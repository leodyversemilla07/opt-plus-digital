import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { offlineDB } from '@/lib/offline-db';
import { Link } from '@inertiajs/react';
import { AlertCircle, Database, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CachedChild {
    id: string;
    full_name: string;
    sex: 'male' | 'female';
    age_in_months: number;
    date_of_birth: string;
    family_serial_number: string;
    barangay?: {
        name: string;
    };
    cachedAt?: string;
}

export function OfflineChildrenList() {
    const [children, setChildren] = useState<CachedChild[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<CachedChild[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCachedChildren();
    }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredChildren(children);
        } else {
            const searchLower = search.toLowerCase();
            const filtered = children.filter(
                (child) =>
                    child.full_name.toLowerCase().includes(searchLower) ||
                    child.family_serial_number
                        .toLowerCase()
                        .includes(searchLower) ||
                    child.barangay?.name.toLowerCase().includes(searchLower),
            );
            setFilteredChildren(filtered);
        }
    }, [search, children]);

    const loadCachedChildren = async () => {
        setLoading(true);
        try {
            const cachedChildren = await offlineDB.getAllCachedChildren();
            // Cast to CachedChild[] - the cached data includes computed properties like full_name
            setChildren(cachedChildren as unknown as CachedChild[]);
            setFilteredChildren(cachedChildren as unknown as CachedChild[]);
        } catch (error) {
            console.error('Failed to load cached children:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years}y ${months}m`;
        }
        return `${months}m`;
    };

    const getCacheAge = (cachedAt?: string) => {
        if (!cachedAt) return 'Unknown';
        const now = new Date();
        const cached = new Date(cachedAt);
        const diff = now.getTime() - cached.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Loading Cached Children...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (children.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Offline Children Browser
                    </CardTitle>
                    <CardDescription>
                        View children cached for offline access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No children cached for offline viewing. When online,
                            visit the Children Registry and click "Cache for
                            Offline" to download child records for offline
                            access.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Offline Children Browser
                </CardTitle>
                <CardDescription>
                    {children.length} children cached for offline viewing
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search cached children..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {search && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Found {filteredChildren.length} of {children.length}{' '}
                            children
                        </p>
                    )}
                </div>

                {/* Table */}
                {filteredChildren.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No children match your search criteria.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>FSN</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Cached</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredChildren.map((child) => (
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
                                            {getAgeDisplay(child.age_in_months)}
                                        </TableCell>
                                        <TableCell>
                                            {child.family_serial_number}
                                        </TableCell>
                                        <TableCell>
                                            {child.barangay?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {getCacheAge(child.cachedAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/children/${child.id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
