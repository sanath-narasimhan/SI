<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($firstName) || empty($email) || empty($message)) {
        echo json_encode(['success' => false, 'error' => 'Please fill in all required fields.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
        exit;
    }

    $dbFile = __DIR__ . '/contacts_db.php';
    $contacts = [];

    if (file_exists($dbFile)) {
        $content = file_get_contents($dbFile);
        // Remove the <?php die(); prefix securely without using literal closing tags
        $json = preg_replace('/^<\?php die\(\); \?'.'>\n/', '', $content);
        if ($json) {
            $contacts = json_decode($json, true) ?: [];
        }
    }

    $newContact = [
        'id' => uniqid(),
        'firstName' => htmlspecialchars($firstName),
        'lastName' => htmlspecialchars($lastName),
        'email' => htmlspecialchars($email),
        'phone' => htmlspecialchars($phone),
        'message' => htmlspecialchars($message),
        'createdAt' => date('c')
    ];

    array_unshift($contacts, $newContact);

    $jsonData = json_encode($contacts, JSON_PRETTY_PRINT);
    $fileContent = "<?php die(); ?>\n" . $jsonData;

    if (file_put_contents($dbFile, $fileContent)) {
        
        // Send Email Notification
        $to = "srgschoolofvedanta@gmail.com";
        $subject = "New Contact Form Submission from " . $firstName . " " . $lastName;
        $body = "You have received a new message from the contact form.\n\n" .
                "Name: $firstName $lastName\n" .
                "Email: $email\n" .
                "Phone: $phone\n\n" .
                "Message:\n$message\n\n" .
                "Date: " . date('Y-m-d H:i:s');
        
        $headers = "From: no-reply@" . $_SERVER['HTTP_HOST'] . "\r\n";
        $headers .= "Reply-To: $email\r\n";
        
        // Use @ to suppress mail() errors on local setups, it will work on Hostinger
        @mail($to, $subject, $body, $headers);

        echo json_encode(['success' => true, 'message' => 'Message sent securely.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to save the message.']);
    }

} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>
