<?php
header('Content-Type: application/json');

// Ensure the directory exists
$uploadDir = __DIR__ . '/assets/reviews/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Read existing reviews
$jsonFile = __DIR__ . '/reviews.json';
$reviews = [];
if (file_exists($jsonFile)) {
    $json = file_get_contents($jsonFile);
    $reviews = json_decode($json, true) ?: [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = $_POST['type'] ?? 'text';
    $name = $_POST['name'] ?? '';
    $role = $_POST['role'] ?? '';
    $content = $_POST['content'] ?? '';
    $password = $_POST['password'] ?? '';

    // Basic password protection (change this in production)
    if ($password !== 'admin123') {
        echo json_encode(['success' => false, 'error' => 'Invalid password']);
        exit;
    }

    if (empty($name) || empty($content)) {
        echo json_encode(['success' => false, 'error' => 'Name and Content are required']);
        exit;
    }

    $mediaUrl = null;

    // Handle video upload
    if ($type === 'video') {
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            $tmpName = $_FILES['video']['tmp_name'];
            $fileName = basename($_FILES['video']['name']);
            
            // Clean filename
            $fileName = preg_replace("/[^a-zA-Z0-9.\-_]/", "", $fileName);
            $fileName = time() . '_' . $fileName; // Make it unique

            $destination = $uploadDir . $fileName;

            // Only allow MP4, WebM, Ogg
            $fileType = mime_content_type($tmpName);
            $allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            
            if (!in_array($fileType, $allowedTypes)) {
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only MP4, WebM, and Ogg are allowed.']);
                exit;
            }

            if (move_uploaded_file($tmpName, $destination)) {
                $mediaUrl = './assets/reviews/' . $fileName;
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file.']);
                exit;
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Video file is required for video reviews.']);
            exit;
        }
    }

    // Create the new review entry
    $newReview = [
        'id' => uniqid(),
        'type' => $type,
        'name' => $name,
        'role' => $role,
        'content' => $content,
        'mediaUrl' => $mediaUrl,
        'createdAt' => date('c')
    ];

    // Add to the beginning of the array so new reviews show up first
    array_unshift($reviews, $newReview);

    // Save back to JSON
    if (file_put_contents($jsonFile, json_encode($reviews, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Review added successfully!']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to save review data.']);
    }

} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>
