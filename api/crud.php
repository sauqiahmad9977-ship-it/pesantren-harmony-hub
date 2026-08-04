<?php
// Generic CRUD handler for all data tables
//
// GET    /api/crud.php?table=santri                → SELECT all rows
// GET    /api/crud.php?table=santri&count=true      → COUNT only
// POST   /api/crud.php?table=santri                → INSERT row (admin only)
// DELETE /api/crud.php?table=santri&id=xxx          → DELETE row (admin only)

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/auth/jwt.php";

// Whitelist of allowed table names to prevent SQL injection
$ALLOWED_TABLES = [
    "santri",
    "kelas",
    "kamar",
    "kitab",
    "kesehatan",
    "konseling",
    "izin_keluar",
    "izin_pulang",
    "pegawai",
    "mata_pelajaran",
    "nilai_santri",
    "tagihan",
    "pembayaran",
    "donatur",
    "donasi",
    "buku_kas",
    "akun_perkiraan",
    "jurnal_umum",
    "detail_jurnal",
    "tabungan_santri",
    "penggajian_pegawai",
    "pengaturan"
];

$table = $_GET["table"] ?? "";

if (!in_array($table, $ALLOWED_TABLES)) {
    http_response_code(400);
    echo json_encode(["error" => "Tabel tidak valid: $table"]);
    exit;
}

$db = (new Database())->getConnection();
$method = $_SERVER["REQUEST_METHOD"];

// ────────────────────────────────────────────
// GET — Read all rows or count
// ────────────────────────────────────────────
if ($method === "GET") {
    $isCount = isset($_GET["count"]) && $_GET["count"] === "true";

    try {
        if ($isCount) {
            $stmt = $db->query("SELECT COUNT(*) as total FROM `$table`");
            $row = $stmt->fetch();
            echo json_encode(["count" => (int) $row["total"]]);
        } else {
            $stmt = $db->query("SELECT * FROM `$table` ORDER BY created_at DESC");
            $data = $stmt->fetchAll();
            echo json_encode($data);
        }
    } catch (PDOException $e) {
        error_log("GET ERROR on table $table: " . $e->getMessage() . "\n", 3, __DIR__ . '/error.log');
        http_response_code(422);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit;
}

// ────────────────────────────────────────────
// POST — Insert new row(s) (admin only)
// ────────────────────────────────────────────
if ($method === "POST") {
    $user = JWT::requireAuth();

    // Check admin role
    $roleStmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = :uid AND role = 'admin'");
    $roleStmt->execute(["uid" => $user["sub"]]);
    if (!$roleStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Hanya admin yang dapat menambah data"]);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);
    error_log("INPUT: " . json_encode($input) . "\n", 3, __DIR__ . '/error.log');
    
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Data tidak valid"]);
        exit;
    }

    // Support both single object and array of objects (bulk insert)
    $is_list = is_array($input) && array_keys($input) === range(0, count($input) - 1);
    
    if ($is_list) {
        if (!empty($input) && is_array($input[0]) && array_keys($input[0]) !== range(0, count($input[0]) - 1)) {
            $is_bulk = true;
            $records = $input;
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Format data tidak valid. Pastikan baris pertama berisi nama kolom yang sesuai."]);
            exit;
        }
    } else {
        $is_bulk = false;
        $records = [$input];
        if (isset($input[0])) {
            http_response_code(400);
            echo json_encode(["error" => "Data tidak valid (mengandung index numerik)"]);
            exit;
        }
    }
    
    $inserted_records = [];

    try {
        $db->beginTransaction();

        foreach ($records as $record) {
            // Generate UUID for id
            $id = sprintf(
                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            $record["id"] = $id;

            // Filter out empty string values (treat as NULL)
            $filtered = [];
            foreach ($record as $key => $value) {
                if ($value !== "" && $value !== null) {
                    $filtered[$key] = $value;
                }
            }

            if (empty($filtered)) {
                continue;
            }

            $columns = implode(", ", array_map(fn($k) => "`$k`", array_keys($filtered)));
            $placeholders = implode(", ", array_map(fn($k) => ":$k", array_keys($filtered)));

            $stmt = $db->prepare("INSERT INTO `$table` ($columns) VALUES ($placeholders)");
            $stmt->execute($filtered);
            
            $inserted_records[] = $filtered;
        }

        $db->commit();
        
        $message = $is_bulk ? count($inserted_records) . " Data tersimpan" : "Data tersimpan";
        echo json_encode([
            "data" => $is_bulk ? $inserted_records : ($inserted_records[0] ?? null),
            "message" => $message
        ]);
    } catch (PDOException $e) {
        $db->rollBack();
        error_log($e->getMessage(), 3, __DIR__ . '/error.log');
        http_response_code(422);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// ────────────────────────────────────────────
// PUT — Update row by id (admin only)
// ────────────────────────────────────────────
if ($method === "PUT") {
    $user = JWT::requireAuth();

    // Check admin role
    $roleStmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = :uid AND role = 'admin'");
    $roleStmt->execute(["uid" => $user["sub"]]);
    if (!$roleStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Hanya admin yang dapat mengubah data"]);
        exit;
    }

    $id = $_GET["id"] ?? "";
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "ID wajib diisi"]);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Data tidak valid"]);
        exit;
    }

    // Filter out id and created_at if they exist in payload
    unset($input['id']);
    unset($input['created_at']);
    unset($input['updated_at']);

    if (empty($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Tidak ada data untuk diupdate"]);
        exit;
    }

    try {
        $setParts = [];
        $params = ["id" => $id];
        
        foreach ($input as $key => $value) {
            $setParts[] = "`$key` = :$key";
            $params[$key] = $value;
        }

        $setClause = implode(", ", $setParts);
        $stmt = $db->prepare("UPDATE `$table` SET $setClause WHERE id = :id");
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            // Check if record exists
            $check = $db->prepare("SELECT id FROM `$table` WHERE id = :id");
            $check->execute(["id" => $id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(["error" => "Data tidak ditemukan"]);
                exit;
            }
        }
        
        echo json_encode(["message" => "Data berhasil diperbarui"]);
    } catch (PDOException $e) {
        error_log($e->getMessage(), 3, __DIR__ . '/error.log');
        http_response_code(422);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// ────────────────────────────────────────────
// DELETE — Remove row by id (admin only)
// ────────────────────────────────────────────
if ($method === "DELETE") {
    $user = JWT::requireAuth();

    // Check admin role
    $roleStmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = :uid AND role = 'admin'");
    $roleStmt->execute(["uid" => $user["sub"]]);
    if (!$roleStmt->fetch()) {
        http_response_code(403);
        echo json_encode(["error" => "Hanya admin yang dapat menghapus data"]);
        exit;
    }

    $id = $_GET["id"] ?? "";
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "ID wajib diisi"]);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM `$table` WHERE id = :id");
        $stmt->execute(["id" => $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Data tidak ditemukan"]);
        } else {
            echo json_encode(["message" => "Data dihapus"]);
        }
    } catch (PDOException $e) {
        http_response_code(422);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
