import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

interface Child {
    id: string;
    full_name: string;
    sex: 'male' | 'female';
    age_in_months: number;
    date_of_birth: string;
    family_serial_number: string;
    qr_code: string;
    is_indigenous_people: boolean;
    barangay: {
        id: string;
        name: string;
    };
}

interface Barangay {
    id: string;
    name: string;
}

interface Filters {
    search?: string;
    barangay_id?: string;
    is_indigenous_people?: boolean;
}

interface PaginatedChildren {
    data: Child[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    children: PaginatedChildren;
    filters: Filters;
    barangays: Barangay[];
}

export default function Index({ children, filters, barangays }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [barangayId, setBarangayId] = useState(filters.barangay_id || '');
    const [isIndigenous, setIsIndigenous] = useState(
        filters.is_indigenous_people?.toString() || ''
    );

    const handleSearch = () => {
        router.get(
            '/children',
            {
                search,
                barangay_id: barangayId || undefined,
                is_indigenous_people: isIndigenous || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setBarangayId('');
        setIsIndigenous('');
        router.get('/children');
    };

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years}y ${months}m`;
        }
        return `${months}m`;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Children Registry', href: '/children' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children Registry" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Children Registry
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Total: {children.total} children registered
                            </p>
                        </div>
                        <Link href="/children/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Register New Child
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <Input
                                    placeholder="Search by name, FSN, or QR code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                />
                            </div>
                            <div>
                                <Select
                                    value={barangayId}
                                    onValueChange={setBarangayId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Barangays" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All Barangays
                                        </SelectItem>
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
                            <div>
                                <Select
                                    value={isIndigenous}
                                    onValueChange={setIsIndigenous}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Indigenous People" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All</SelectItem>
                                        <SelectItem value="1">
                                            Indigenous
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Non-Indigenous
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>FSN</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {children.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-gray-500"
                                        >
                                            No children found. Register a child
                                            to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    children.data.map((child) => (
                                        <TableRow key={child.id}>
                                            <TableCell className="font-medium">
                                                {child.full_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        child.sex === 'male'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {child.sex === 'male'
                                                        ? 'M'
                                                        : 'F'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getAgeDisplay(
                                                    child.age_in_months
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {child.family_serial_number}
                                            </TableCell>
                                            <TableCell>
                                                {child.barangay.name}
                                            </TableCell>
                                            <TableCell>
                                                {child.is_indigenous_people && (
                                                    <Badge variant="outline">
                                                        IP
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/children/${child.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {children.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-3">
                                <div className="text-sm text-gray-700">
                                    Showing {children.data.length} of{' '}
                                    {children.total} results
                                </div>
                                <div className="flex gap-2">
                                    {children.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.visit(link.url)
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
