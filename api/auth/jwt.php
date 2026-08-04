<?php
// Simple JWT implementation using HMAC-SHA256 (no external libraries)

class JWT {
    private static $secret = "sim_pesantren_jwt_secret_key_2026_change_in_production";
    private static $algorithm = "HS256";

    public static function encode($payload) {
        $header = self::base64UrlEncode(json_encode([
            "typ" => "JWT",
            "alg" => self::$algorithm
        ]));

        // Add issued at and expiration (24 hours)
        $payload["iat"] = time();
        $payload["exp"] = time() + (60 * 60 * 24);

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac("sha256", "$header.$payloadEncoded", self::$secret, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    public static function decode($token) {
        $parts = explode(".", $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($header, $payload, $signature) = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac("sha256", "$header.$payload", self::$secret, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $data = json_decode(self::base64UrlDecode($payload), true);

        // Check expiration
        if (isset($data["exp"]) && $data["exp"] < time()) {
            return null;
        }

        return $data;
    }

    /**
     * Extract and validate JWT from Authorization header.
     * Returns decoded payload or null.
     */
    public static function getAuthUser() {
        $headers = getallheaders();
        $auth = $headers["Authorization"] ?? $headers["authorization"] ?? "";

        if (empty($auth) || !str_starts_with($auth, "Bearer ")) {
            return null;
        }

        $token = substr($auth, 7);
        return self::decode($token);
    }

    /**
     * Require authentication — sends 401 and exits if not authenticated.
     */
    public static function requireAuth() {
        $user = self::getAuthUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        return $user;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, "-_", "+/") . str_repeat("=", 3 - (3 + strlen($data)) % 4));
    }
}
