<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $type, // signup | reset | password_change | email_change_old | email_change_new
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            'reset' => 'Password Reset OTP - OakAudix',
            'password_change' => 'Change Password OTP - OakAudix',
            'email_change_old' => 'Confirm Email Change OTP - OakAudix',
            'email_change_new' => 'Verify New Email OTP - OakAudix',
            default => 'Email Verification OTP - OakAudix',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp');
    }
}
