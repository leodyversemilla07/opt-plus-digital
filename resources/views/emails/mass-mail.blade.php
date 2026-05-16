<x-mail::message>
# {{ $massMail->subject }}

{!! nl2br(e($massMail->message_body)) !!}

---

<x-mail::button :url="config('app.url')" color="primary">
Visit {{ config('app.name') }}
</x-mail::button>

Salamat,<br>
{{ config('app.name') }}
</x-mail::message>
