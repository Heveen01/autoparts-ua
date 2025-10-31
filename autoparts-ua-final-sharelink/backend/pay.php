<?php
// backend/pay.php
// Это заглушка обработчика оплаты.
// В реальном продакшене тут должна быть интеграция с платежным провайдером,
// НЕ храним и не шлем CVV в чистом виде по почте.
// Сейчас просто отправим данные тебе на почту, как уведомление.

$to = "you@example.com";
$subject = "Autoparts-UA: спроба оплати / бронювання";

$fullname = $_POST['fullname'] ?? '';
$phone    = $_POST['phone'] ?? '';
$address  = $_POST['address'] ?? '';
$message  = $_POST['message'] ?? '';

$card_name   = $_POST['card_name'] ?? '';
$card_number = $_POST['card_number'] ?? '';
$card_exp    = $_POST['card_exp'] ?? '';
$card_cvv    = $_POST['card_cvv'] ?? '';
$comment     = $_POST['comment'] ?? '';

$cart    = $_POST['cart_json'] ?? '[]';

$body = "Нове бронювання через payment.html\n"
      . "Одержувач: $fullname\n"
      . "Телефон: $phone\n"
      . "Адреса доставки: $address\n"
      . "VIN/Деталі: $message\n"
      . "Коментар: $comment\n"
      . "Кошик: $cart\n"
      . "---Дані картки---\n"
      . "Ім'я на картці: $card_name\n"
      . "Номер картки: $card_number\n"
      . "Термін дії: $card_exp\n"
      . "CVV: $card_cvv\n";

$headers = "From: autoparts-ua@example.com\r\n";

if (mail($to, $subject, $body, $headers)) {
    http_response_code(200);
    echo "OK";
} else {
    http_response_code(500);
    echo "ERR";
}
?>