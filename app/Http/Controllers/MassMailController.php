<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\MassMail;
use App\Services\MassMailService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MassMailController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private MassMailService $massMailService
    ) {}

    /**
     * Display the mass mail dashboard
     */
    public function index(): Response
    {
        $this->authorize('send mass mail');

        $mails = MassMail::with('creator')
            ->latest()
            ->paginate(20);

        return Inertia::render('mass-mail/index', [
            'mails' => $mails,
            'barangays' => Barangay::orderBy('name')->get(['id', 'name']),
            'classifications' => MassMailService::getClassifications(),
            'recipientTypes' => MassMailService::getRecipientTypes(),
        ]);
    }

    /**
     * Preview recipient count before sending
     */
    public function previewRecipients(Request $request): JsonResponse
    {
        $this->authorize('send mass mail');

        $data = $request->validate([
            'recipient_type' => 'required|string|in:all_parents,by_barangay,by_classification,specific_roles',
            'recipient_criteria' => 'nullable|array',
            'recipient_criteria.barangay_id' => 'nullable|exists:barangays,id',
            'recipient_criteria.classification' => 'nullable|string',
            'recipient_criteria.roles' => 'nullable|array',
            'recipient_criteria.roles.*' => 'string',
        ]);

        $count = $this->massMailService->getRecipientCount(
            $data['recipient_type'],
            $data['recipient_criteria'] ?? null
        );

        return response()->json(['count' => $count]);
    }

    /**
     * Store and send a mass mail
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('send mass mail');

        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message_body' => 'required|string',
            'recipient_type' => 'required|string|in:all_parents,by_barangay,by_classification,specific_roles',
            'recipient_criteria' => 'nullable|array',
            'recipient_criteria.barangay_id' => 'nullable|exists:barangays,id',
            'recipient_criteria.classification' => 'nullable|string',
            'recipient_criteria.roles' => 'nullable|array',
            'recipient_criteria.roles.*' => 'string',
        ]);

        $massMail = MassMail::create([
            'subject' => $data['subject'],
            'message_body' => $data['message_body'],
            'recipient_type' => $data['recipient_type'],
            'recipient_criteria' => $data['recipient_criteria'] ?? null,
            'created_by' => $request->user()->id,
            'status' => 'draft',
        ]);

        // Queue the sending
        $this->massMailService->queueMassMail($massMail);

        return to_route('mass-mail.index')
            ->with('success', 'Mass mail has been queued for sending.');
    }

    /**
     * Show mass mail details
     */
    public function show(MassMail $massMail): Response
    {
        $this->authorize('send mass mail');

        $massMail->load('creator');

        return Inertia::render('mass-mail/show', [
            'mail' => $massMail,
        ]);
    }

    /**
     * Show compose form
     */
    public function create(): Response
    {
        $this->authorize('send mass mail');

        return Inertia::render('mass-mail/create', [
            'barangays' => Barangay::orderBy('name')->get(['id', 'name']),
            'classifications' => MassMailService::getClassifications(),
            'recipientTypes' => MassMailService::getRecipientTypes(),
        ]);
    }
}
