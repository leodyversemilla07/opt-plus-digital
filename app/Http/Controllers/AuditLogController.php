<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display a paginated, filterable list of audit logs.
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::query()
            ->with('user:id,name')
            ->latest('created_at');

        // Filter by user
        $query->when($request->user_id, function ($q, $userId) {
            $q->where('user_id', $userId);
        });

        // Filter by action
        $query->when($request->action, function ($q, $action) {
            $q->where('action', $action);
        });

        // Filter by auditable type (model)
        $query->when($request->type, function ($q, $type) {
            $q->where('auditable_type', $type);
        });

        // Search across related data
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('auditable_type', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('auditable_id', (int) $search);
            });
        });

        // Date range
        $query->when($request->from, function ($q, $from) {
            $q->whereDate('created_at', '>=', $from);
        });
        $query->when($request->until, function ($q, $until) {
            $q->whereDate('created_at', '<=', $until);
        });

        $logs = $query->paginate(20)->withQueryString();

        // Get unique action types and model types for filter dropdowns
        $actions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        $types = AuditLog::query()
            ->select('auditable_type')
            ->distinct()
            ->orderBy('auditable_type')
            ->pluck('auditable_type');

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'actions' => $actions,
            'types' => $types,
            'filters' => $request->only(['search', 'action', 'type', 'user_id', 'from', 'until']),
        ]);
    }

    /**
     * Display a single audit log with full details.
     */
    public function show(int $id): Response
    {
        $log = AuditLog::with('user:id,name')->findOrFail($id);

        // Attempt to load the related auditable model
        $auditable = null;
        try {
            $modelClass = $log->auditable_type;
            if (class_exists($modelClass)) {
                $auditable = $modelClass::withTrashed()
                    ->whereKey($log->auditable_id)
                    ->first();
            }
        } catch (\Exception) {
            // Model class may not exist or table may be missing
        }

        return Inertia::render('audit-logs/show', [
            'log' => $log,
            'auditable' => $auditable,
        ]);
    }
}
