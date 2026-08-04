<?php
// POST /api/auth/login.php
// Body: { "email": "...", "password": "..." }
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

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email dan password wajib diisi"]);
    exit;
}

$db = (new Database())->getConnection();

// Find user by email
$stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
$stmt->execute(["email" => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password_hash"])) {
    http_response_code(401);
    echo json_encode(["error" => "Email atau password salah"]);
    exit;
}

// Get roles
$roleStmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = :user_id");
$roleStmt->execute(["user_id" => $user["id"]]);
$roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

// Generate JWT
$token = JWT::encode([
    "sub" => $user["id"],
    "email" => $user["email"],
    "full_name" => $user["full_name"],
]);

// Return response
echo json_encode([
    "token" => $token,
    "user" => [
        "id" => $user["id"],
        "email" => $user["email"],
        "full_name" => $user["full_name"],
        "phone" => $user["phone"],
        "avatar_url" => $user["avatar_url"],
        "created_at" => $user["created_at"],
    ],
    "roles" => $roles,
]);
