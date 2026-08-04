<?php
// POST /api/auth/register.php
// Body: { "email": "...", "password": "...", "full_name": "..." }
// Returns: { "token": "...", "user": {...}, "roles": [...] }

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/jwt.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";
$fullName = trim($input["full_name"] ?? "");

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email dan password wajib diisi"]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password minimal 6 karakter"]);
    exit;
}

if (empty($fullName)) {
    // Fallback: use part before @ as name
    $fullName = explode("@", $email)[0];
}

$db = (new Database())->getConnection();

// Check if email already exists
$checkStmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$checkStmt->execute(["email" => $email]);
if ($checkStmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email sudah terdaftar"]);
    exit;
}

// Count existing users to determine role
$countStmt = $db->query("SELECT COUNT(*) as total FROM users");
$userCount = (int) $countStmt->fetch()["total"];

// Hash password
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

// Generate UUID
$id = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

// Insert user
$insertStmt = $db->prepare(
    "INSERT INTO users (id, email, password_hash, full_name) VALUES (:id, :email, :password_hash, :full_name)"
);
$insertStmt->execute([
    "id" => $id,
    "email" => $email,
    "password_hash" => $passwordHash,
    "full_name" => $fullName,
]);

// Assign role: first user = admin, others = staff
$role = $userCount === 0 ? "admin" : "staff";
$roleId = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

$roleStmt = $db->prepare(
    "INSERT INTO user_roles (id, user_id, role) VALUES (:id, :user_id, :role)"
);
$roleStmt->execute([
    "id" => $roleId,
    "user_id" => $id,
    "role" => $role,
]);

// Generate JWT
$token = JWT::encode([
    "sub" => $id,
    "email" => $email,
    "full_name" => $fullName,
]);

echo json_encode([
    "token" => $token,
    "user" => [
        "id" => $id,
        "email" => $email,
        "full_name" => $fullName,
        "phone" => null,
        "avatar_url" => null,
        "created_at" => date("c"),
    ],
    "roles" => [$role],
    "message" => "Pendaftaran berhasil" . ($role === "admin" ? ". Anda menjadi admin pertama." : "."),
]);
