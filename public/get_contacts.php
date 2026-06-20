<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';

    // Check admin password
    if ($password !== 'admin123') {
        echo json_encode(['success' => false, 'error' => 'Invalid password']);
        exit;
    }

    $dbFile = __DIR__ . '/contacts_db.php';
    $contacts = [];

    if (file_exists($dbFile)) {
        $content = file_get_contents($dbFile);
        $json = preg_replace('/^<\?php die\(\); \?'.'>\n/', '', $content);
        if ($json) {
            $contacts = json_decode($json, true) ?: [];
        }
    }

    echo json_encode(['success' => true, 'contacts' => $contacts]);

} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method. Please use POST.']);
}
?>
