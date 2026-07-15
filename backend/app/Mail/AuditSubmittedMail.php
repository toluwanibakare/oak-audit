<?php

namespace App\Mail;

use App\Models\AuditModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuditSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AuditModel $audit,
        public string $orgName,
        public string $submittedBy,
        public string $reviewUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Audit Submitted for Review · {$this->audit->title}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.audit-submitted');
    }
}
