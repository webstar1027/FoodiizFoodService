<?php
$message = preg_replace('/(<\/?p>)+/', ' ', $message);
throw new Exception("Database error occured with message : {$message}");
$to      = 'support@foodiiz.com';
$subject = 'An error occurred in Foodiiz database: '. $message;
$subject .= "Time: " . date("d-m-Y H:i:s");
$message = 'An error occurred in Foodiiz database';
$headers = 'From: info@foodiiz.com' . "\r\n" .
    'Reply-To: info@foodiiz.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();
mail($to, $subject, $message, $headers);
?>