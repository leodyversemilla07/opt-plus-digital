<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * Show the notification preferences page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $knownTypes = [
            'severe_malnutrition' => 'Severe Malnutrition Alerts (SAM)',
            'report_generated' => 'Report Generation Complete',
            'weekly_summary' => 'Weekly Summary',
        ];

        $prefs = $user->notificationPreferences()->get()->keyBy('notification_type');

        // Seed default preferences for any missing types
        foreach ($knownTypes as $type => $label) {
            if (! $prefs->has($type)) {
                $pref = $user->notificationPreferences()->create([
                    'notification_type' => $type,
                    'database' => true,
                    'email' => true,
                    'push' => true,
                ]);
                $prefs->put($type, $pref);
            }
        }

        return Inertia::render('settings/notification-preferences', [
            'preferences' => $prefs->values()->map(fn ($pref) => [
                'id' => $pref->id,
                'notification_type' => $pref->notification_type,
                'label' => $knownTypes[$pref->notification_type] ?? ucfirst($pref->notification_type),
                'database' => (bool) $pref->database,
                'email' => (bool) $pref->email,
                'push' => (bool) $pref->push,
            ]),
        ]);
    }

    /**
     * Update a single notification preference.
     */
    public function update(Request $request, NotificationPreference $preference): RedirectResponse
    {
        if ($preference->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'database' => 'boolean',
            'email' => 'boolean',
            'push' => 'boolean',
        ]);

        $preference->update($validated);

        return redirect()->back()->with('success', 'Notification preference updated.');
    }
}
