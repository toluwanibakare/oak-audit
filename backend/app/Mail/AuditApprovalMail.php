<?php

namespace App\Mail;

use App\Models\AuditModel;
use App\Models\AuditApproval;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuditApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AuditModel $audit,
        public AuditApproval $stage,
        public string $approvalUrl,
        public string $orgName,
    ) {}

    public function envelope(): Envelope
    {
        $label = $this->stage->stage;
        return new Envelope(
            subject: "Approval Required · {$this->audit->title} · {$label}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.audit-approval');
    }
}
