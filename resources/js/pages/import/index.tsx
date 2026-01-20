import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Upload,
} from 'lucide-react';
import { useState } from 'react';

interface Barangay {
    id: string;
    name: string;
}

interface OptSession {
    id: string;
    name: string;
    session_date: string;
    barangay_id: string;
}

interface ImportResult {
    success: boolean;
    summary: {
        total_processed: number;
        imported: number;
        skipped: number;
        errors: number;
    };
    errors?: Array<{
        row: number;
        field: string;
        message: string;
    }>;
}

interface Props {
    barangays: Barangay[];
    optSessions: OptSession[];
    recentImports: Array<{
        id: string;
        filename: string;
        imported_at: string;
        records_imported: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Import', href: '/import' },
];

export default function Index({ barangays, optSessions }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string; importResult?: ImportResult } };
    const [file, setFile] = useState<File | null>(null);
    const [barangayId, setBarangayId] = useState('');
    const [optSessionId, setOptSessionId] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        sheets?: string[];
        estimated_rows?: number;
        error?: string;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setFile(selectedFile || null);
        setValidationResult(null);

        // Validate file on selection
        if (selectedFile) {
            validateFile(selectedFile);
        }
    };

    const validateFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/import/validate', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            setValidationResult(result);
        } catch {
            setValidationResult({
                valid: false,
                error: 'Failed to validate file',
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !barangayId) {
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('barangay_id', barangayId);
        if (optSessionId) {
            formData.append('opt_session_id', optSessionId);
        }

        router.post('/import', formData, {
            forceFormData: true,
            onFinish: () => {
                setIsUploading(false);
            },
            onSuccess: () => {
                setFile(null);
                setValidationResult(null);
            },
        });
    };

    const filteredSessions = optSessions.filter(
        (session) => !barangayId || session.barangay_id === barangayId
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Data" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Import Data
                        </h1>
                        <p className="text-muted-foreground">
                            Import children and measurements from OPT Plus Excel files
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href="/import/template">
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </a>
                    </Button>
                </div>

                {/* Success/Error Messages */}
                {flash?.success && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Import Result Details */}
                {flash?.importResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {flash.importResult.summary.total_processed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Processed
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {flash.importResult.summary.imported}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Imported
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {flash.importResult.summary.skipped}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Skipped
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {flash.importResult.summary.errors}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Errors
                                    </div>
                                </div>
                            </div>

                            {flash.importResult.errors && flash.importResult.errors.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Errors:</h4>
                                    <div className="max-h-48 overflow-auto rounded border p-2">
                                        {flash.importResult.errors.map(
                                            (error, index) => (
                                                <div
                                                    key={index}
                                                    className="text-sm text-red-600"
                                                >
                                                    Row {error.row}: {error.message}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Import Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Excel File</CardTitle>
                        <CardDescription>
                            Select an OPT Plus Excel file (.xlsx or .xls) to import
                            children and measurements data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="file">Excel File</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="flex-1"
                                    />
                                    {file && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileSpreadsheet className="h-4 w-4" />
                                            {file.name}
                                        </div>
                                    )}
                                </div>
                                {validationResult && (
                                    <div
                                        className={`text-sm ${
                                            validationResult.valid
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {validationResult.valid
                                            ? `✓ Valid file with approximately ${validationResult.estimated_rows} rows`
                                            : `✗ ${validationResult.error}`}
                                    </div>
                                )}
                            </div>

                            {/* Barangay Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="barangay">Target Barangay</Label>
                                <Select
                                    value={barangayId}
                                    onValueChange={setBarangayId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select barangay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {barangays.map((barangay) => (
                                            <SelectItem
                                                key={barangay.id}
                                                value={barangay.id}
                                            >
                                                {barangay.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* OPT Session Selection (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="opt_session">
                                    Link to OPT Session (Optional)
                                </Label>
                                <Select
                                    value={optSessionId}
                                    onValueChange={setOptSessionId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select OPT session (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            No session
                                        </SelectItem>
                                        {filteredSessions.map((session) => (
                                            <SelectItem
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {session.name} (
                                                {new Date(
                                                    session.session_date
                                                ).toLocaleDateString()}
                                                )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={
                                    !file ||
                                    !barangayId ||
                                    isUploading ||
                                    (validationResult !== null && !validationResult.valid)
                                }
                            >
                                {isUploading ? (
                                    <>
                                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import Data
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Import Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>
                                Download the import template or use your existing
                                OPT Plus Excel file.
                            </li>
                            <li>
                                Ensure the file contains a sheet named "OPT Plus
                                Form 1A" or "Nut_StatusTool".
                            </li>
                            <li>
                                The following columns are required:
                                <ul className="list-disc list-inside ml-4 mt-1">
                                    <li>Child Name (Column E)</li>
                                    <li>Sex (Column G)</li>
                                    <li>Date of Birth (Column H)</li>
                                    <li>Measurement Date (Column I)</li>
                                    <li>Weight in kg (Column J)</li>
                                    <li>Height/Length in cm (Column K)</li>
                                </ul>
                            </li>
                            <li>
                                Select the target barangay where the data will be
                                imported.
                            </li>
                            <li>
                                Optionally link the import to an OPT session for
                                tracking.
                            </li>
                            <li>
                                Click "Import Data" to process the file.
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
