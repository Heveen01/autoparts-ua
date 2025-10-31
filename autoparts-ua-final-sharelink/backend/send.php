<?php
// backend/send.php
// TODO: заміни на свою пошту
$to = "you@example.com";
$subject = "Autoparts-UA: новий запит (ЄС/Україна)";

$name    = $_POST['name']    ?? '';
$phone   = $_POST['phone']   ?? '';
$np      = $_POST['np']      ?? '';
$msg     = $_POST['message'] ?? '';
$cart    = $_POST['cart_json'] ?? '[]';
$paymethod = $_POST['paymethod'] ?? 'unknown';

$body = "Новий запит з Autoparts-UA\n"
      . "Ім'я: $name\n"
      . "Телефон / WhatsApp / Viber: $phone\n"
      . "Локація доставки: $np\n"
      . "VIN/Деталь: $msg\n"
      . "Кошик: $cart\n" . "Спосіб оплати: $paymethod\n";

$headers = "From: autoparts-ua@example.com\r\n";

if (mail($to, $subject, $body, $headers)) {
    http_response_code(200);
    echo "OK";
} else {
    http_response_code(500);
    echo "ERR";
}
?>