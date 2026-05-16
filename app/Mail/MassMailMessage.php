<?php

namespace App\Mail;

use App\Models\MassMail;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MassMailMessage extends Mailable
{
    use Queueable, SerializesModels;

    public MassMail $massMail;

    public string $recipientName;

    public function __construct(MassMail $massMail, string $recipientName)
    {
        $this->massMail = $massMail;
        $this->recipientName = $recipientName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->massMail->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.mass-mail',
        );
    }

    /** @return array<int, \Illuminate\Mail\Mailables\Attachment> */
    public function attachments(): array
    {
        return [];
    }
}
