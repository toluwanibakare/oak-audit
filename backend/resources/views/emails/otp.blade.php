<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 24px;">
  <h2>OakAudix</h2>
  <p>@php
    $message = match ($type) {
      'reset' => 'Use the OTP below to reset your password.',
      'password_change' => 'Use the OTP below to change your password.',
      'email_change_old' => 'Use the OTP below to confirm changing your email address.',
      'email_change_new' => 'Use the OTP below to verify your new email address.',
      default => 'Use the OTP below to verify your email address.',
    };
  @endphp{{ $message }}</p>
  <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 16px; background: #f5f5f5; text-align: center; border-radius: 8px;">{{ $otp }}</div>
  <p style="color: #888; font-size: 13px;">This code expires in 10 minutes.</p>
</body>
</html>
