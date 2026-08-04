<?php
// GET /api/auth/me.php
// Header: Authorization: Bearer <token>
// Returns: { "user": {...}, "roles": [...] }

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/jwt.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$payload = JWT::requireAuth();

$db = (new Database())->getConnection();

// Get user details
$stmt = $db->prepare("SELECT id, email, full_name, phone, avatar_url, created_at FROM users WHERE id = :id LIMIT 1");
$stmt->execute(["id" => $payload["sub"]]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User tidak ditemukan"]);
    exit;
}

// Get roles
$roleStmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = :user_id");
$roleStmt->execute(["user_id" => $user["id"]]);
$roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode([
    "user" => $user,
    "roles" => $roles,
]);
