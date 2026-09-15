<?php
/**
 * Expert Verticals - Production Contact & Enquiry Form Handler
 * Deliver enquiries securely to info@expertverticals.com
 */

header('Content-Type: application/json; charset=utf-8');

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Enquiries must be submitted via POST.'
    ]);
    exit;
}

// Helper: Response helper
function sendResponse(bool $success, string $message, array $extra = [], int $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extra));
    exit;
}

// 2. Honeypot check for spam bots
if (!empty($_POST['website_hp'])) {
    // Silent success response for bot submissions
    sendResponse(true, 'Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly.');
}

// 3. Simple Rate Limiting (File-based in sys_get_temp_dir())
$userIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ipHash = md5($userIp);
$rateLimitFile = sys_get_temp_dir() . '/ev_rfq_rate_' . $ipHash . '.json';
$maxAttempts = 5;
$windowSeconds = 600; // 10 minutes

$currentTime = time();
$rateData = ['attempts' => 0, 'first_attempt' => $currentTime];

if (file_exists($rateLimitFile)) {
    $rawContent = @file_get_contents($rateLimitFile);
    if ($rawContent) {
        $decoded = @json_decode($rawContent, true);
        if (is_array($decoded)) {
            $rateData = $decoded;
        }
    }
}

if ($currentTime - $rateData['first_attempt'] > $windowSeconds) {
    // Window expired, reset
    $rateData = ['attempts' => 1, 'first_attempt' => $currentTime];
} else {
    $rateData['attempts']++;
}

@file_put_contents($rateLimitFile, json_encode($rateData), LOCK_EX);

if ($rateData['attempts'] > $maxAttempts) {
    sendResponse(
        false, 
        'We could not submit your enquiry. Rate limit exceeded. Please try again later, call +92 333 3533058, or email info@expertverticals.com.',
        [],
        429
    );
}

// 4. Sanitize and Validate Inputs
function cleanHeaderString(string $str): string {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], '', $str));
}

$name     = cleanHeaderString($_POST['name'] ?? $_POST['full_name'] ?? '');
$email    = cleanHeaderString($_POST['email'] ?? '');
$phone    = cleanHeaderString($_POST['phone'] ?? $_POST['telephone'] ?? '');
$company  = cleanHeaderString($_POST['company'] ?? $_POST['organization'] ?? '');
$vertical = cleanHeaderString($_POST['vertical'] ?? $_POST['division'] ?? 'Elevator & Vertical Transportation');
$service  = cleanHeaderString($_POST['service'] ?? $_POST['subject'] ?? 'General Enquiry');
$urgency  = cleanHeaderString($_POST['urgency'] ?? 'Normal');
$message  = trim($_POST['message'] ?? $_POST['details'] ?? $_POST['comments'] ?? '');

$errors = [];

if (empty($name)) {
    $errors[] = 'Full Name is required.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

if (empty($message)) {
    $errors[] = 'Enquiry message is required.';
}

if (!empty($errors)) {
    sendResponse(
        false,
        'We could not submit your enquiry. Please check the form details, call +92 333 3533058, or email info@expertverticals.com.',
        ['errors' => $errors],
        400
    );
}

// 5. File Attachment Processing (Optional)
$attachmentPath = null;
$attachmentName = null;
$attachmentType = null;

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['attachment'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendResponse(
            false,
            'We could not submit your enquiry due to a file upload error. Please try again without the attachment, call +92 333 3533058, or email info@expertverticals.com.',
            [],
            400
        );
    }

    // Max 10MB limit
    if ($file['size'] > 10 * 1024 * 1024) {
        sendResponse(
            false,
            'We could not submit your enquiry. Attached file exceeds 10MB limit. Please call +92 333 3533058 or email info@expertverticals.com.',
            [],
            400
        );
    }

    // Allowed MIME types & extensions (PDF, DOC, DOCX, XLS, XLSX only)
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

    $allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
        'application/zip',
        'application/x-zip-compressed'
    ];

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, $file['tmp_name']) : $file['type'];
    if ($finfo) {
        finfo_close($finfo);
    }

    if (!in_array($ext, $allowedExts) || !in_array($mimeType, $allowedMimes)) {
        sendResponse(
            false,
            'We could not submit your enquiry. Attachment format not allowed (PDF, DOC, DOCX, XLS, XLSX only). Please call +92 333 3533058 or email info@expertverticals.com.',
            [],
            400
        );
    }

    $attachmentPath = $file['tmp_name'];
    $attachmentName = basename($file['name']);
    $attachmentType = $mimeType;
}

// 6. Build Email
$to = 'info@expertverticals.com';
$emailSubject = "New Enquiry from Website: " . ($service ?: 'General Enquiry') . " - " . $name;

// Body text
$bodyText  = "New Website Enquiry Received\n";
$bodyText .= "============================\n\n";
$bodyText .= "Full Name:   " . $name . "\n";
$bodyText .= "Email:       " . $email . "\n";
$bodyText .= "Phone:       " . ($phone ?: 'Not provided') . "\n";
$bodyText .= "Company:     " . ($company ?: 'Not provided') . "\n";
$bodyText .= "Vertical:    " . ($vertical ?: 'Elevator & Vertical Transportation') . "\n";
$bodyText .= "Service/Subject: " . ($service ?: 'General Enquiry') . "\n";
$bodyText .= "Urgency:     " . ($urgency ?: 'Normal') . "\n\n";
$bodyText .= "Message Details:\n";
$bodyText .= "----------------\n";
$bodyText .= $message . "\n\n";
$bodyText .= "----------------\n";
$bodyText .= "Submitted IP: " . $userIp . "\n";
$bodyText .= "Submission Time: " . date('Y-m-d H:i:s T') . "\n";

// Email headers
$fromEmail = 'info@expertverticals.com';
$boundary = '==MP_BOUND_' . md5(time() . rand());

$headers  = "From: Expert Verticals Website <" . $fromEmail . ">\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

if ($attachmentPath && file_exists($attachmentPath)) {
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";

    // Multipart Message
    $messageBody  = "--" . $boundary . "\r\n";
    $messageBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $messageBody .= "Content-Transfer-Encoding: 7bit\r\n\n";
    $messageBody .= $bodyText . "\r\n\n";

    // Attachment Part
    $fileData = file_get_contents($attachmentPath);
    $contentChunk = chunk_split(base64_encode($fileData));

    $messageBody .= "--" . $boundary . "\r\n";
    $messageBody .= "Content-Type: " . ($attachmentType ?: 'application/octet-stream') . "; name=\"" . $attachmentName . "\"\r\n";
    $messageBody .= "Content-Description: " . $attachmentName . "\r\n";
    $messageBody .= "Content-Disposition: attachment; filename=\"" . $attachmentName . "\"; size=" . filesize($attachmentPath) . ";\r\n";
    $messageBody .= "Content-Transfer-Encoding: base64\r\n\n";
    $messageBody .= $contentChunk . "\r\n\n";
    $messageBody .= "--" . $boundary . "--";
} else {
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $messageBody = $bodyText;
}

// 7. Send Mail
$mailSent = @mail($to, $emailSubject, $messageBody, $headers);

// Cleanup temporary attachment file if exists
if ($attachmentPath && file_exists($attachmentPath)) {
    @unlink($attachmentPath);
}

if ($mailSent) {
    sendResponse(
        true,
        'Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly.'
    );
} else {
    sendResponse(
        false,
        'We could not submit your enquiry. Please try again, call +92 333 3533058, or email info@expertverticals.com.',
        [],
        500
    );
}
