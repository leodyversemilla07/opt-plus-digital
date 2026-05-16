import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
import { useOnlineStatus } from '@/hooks/use-online-status';
import AppLayout from '@/layouts/app-layout';
import { offlineDB } from '@/lib/offline-db';
import {
    create as childrenCreate,
    show as childrenShow,
} from '@/routes/children';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Download, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    f1k?: boolean;
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
    const { t } = useTranslation();
    const isOnline = useOnlineStatus();
    const [search, setSearch] = useState(filters.search || '');
    const [barangayId, setBarangayId] = useState(filters.barangay_id || 'all');
    const [isIndigenous, setIsIndigenous] = useState(
        filters.is_indigenous_people?.toString() || 'all',
    );
    const [cachedCount, setCachedCount] = useState(0);
    const [isCaching, setIsCaching] = useState(false);

    // Cache children data when loaded
    useEffect(() => {
        const cacheChildren = async () => {
            if (isOnline && children.data.length > 0) {
                try {
                    // Children from backend include first_name, last_name, etc.
                    await offlineDB.cacheChildren(
                        children.data as unknown as Parameters<
                            typeof offlineDB.cacheChildren
                        >[0],
                    );
                    updateCachedCount();
                } catch (error) {
                    console.error('Failed to cache children:', error);
                }
            }
        };

        cacheChildren();
    }, [children.data, isOnline]);

    // Get cached count on mount
    useEffect(() => {
        updateCachedCount();
    }, []);

    async function updateCachedCount() {
        try {
            const cachedChildren = await offlineDB.getAllCachedChildren();
            setCachedCount(cachedChildren.length);
        } catch (error) {
            console.error('Failed to get cached count:', error);
        }
    }

    const handleCacheAll = async () => {
        setIsCaching(true);
        try {
            // Children from backend include first_name, last_name, etc.
            await offlineDB.cacheChildren(
                children.data as unknown as Parameters<
                    typeof offlineDB.cacheChildren
                >[0],
            );
            await updateCachedCount();
            alert(
                `Successfully cached ${children.data.length} children for offline access`,
            );
        } catch (error) {
            console.error('Failed to cache all children:', error);
            alert('Failed to cache children. Please try again.');
        } finally {
            setIsCaching(false);
        }
    };

    const handleSearch = () => {
        router.get(
            '/children',
            {
                search,
                barangay_id: barangayId !== 'all' ? barangayId : undefined,
                is_indigenous_people:
                    isIndigenous !== 'all' ? isIndigenous : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setBarangayId('all');
        setIsIndigenous('all');
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
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('nav.children'), href: '/children' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('children.registry')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('children.registry')}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {t('children.total_registered', { count: children.total })}
                            {cachedCount > 0 && (
                                <span className="ml-2 text-blue-600 dark:text-blue-400">
                                    • {t('children.cached_offline', { count: cachedCount })}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isOnline && (
                            <Button
                                variant="outline"
                                onClick={handleCacheAll}
                                disabled={isCaching}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isCaching ? t('children.caching') : t('children.cache_for_offline')}
                            </Button>
                        )}
                        <Link href={childrenCreate.url()}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('children.register_new_child')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <Input
                                placeholder={t('children.search_placeholder')}
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
                                onValueChange={(value) =>
                                    setBarangayId(value ?? '')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('children.all_barangays')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('children.all_barangays')}
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
                                onValueChange={(value) =>
                                    setIsIndigenous(value ?? '')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('children.indigenous_people')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('children.all')}</SelectItem>
                                    <SelectItem value="1">
                                        {t('children.indigenous')}
                                    </SelectItem>
                                    <SelectItem value="0">
                                        {t('children.non_indigenous')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            {t('common.search')}
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            {t('common.reset')}
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('children.name')}</TableHead>
                                <TableHead>{t('children.sex')}</TableHead>
                                <TableHead>{t('children.age')}</TableHead>
                                <TableHead>{t('children.fsn')}</TableHead>
                                <TableHead>{t('children.barangay')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead>{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {children.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t('children.no_children')}
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
                                            {getAgeDisplay(child.age_in_months)}
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
                                                href={childrenShow.url(
                                                    child.id,
                                                )}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    {t('children.view')}
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
                            <div className="text-sm text-muted-foreground">
                                {t('children.showing_results', { count: children.data.length, total: children.total })}
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    {/* Previous Button */}
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={children.links[0]?.url || '#'}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (children.links[0]?.url) {
                                                    router.visit(
                                                        children.links[0].url,
                                                    );
                                                }
                                            }}
                                            className={
                                                !children.links[0]?.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {children.links
                                        .slice(1, -1)
                                        .map((link, index) => {
                                            // Show first page, last page, current page, and pages around current
                                            const pageNum = index + 1;
                                            const currentPage =
                                                children.current_page;
                                            const lastPage = children.last_page;

                                            // Show ellipsis logic
                                            if (
                                                pageNum === 1 ||
                                                pageNum === lastPage ||
                                                (pageNum >= currentPage - 1 &&
                                                    pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={index}>
                                                        <PaginationLink
                                                            href={
                                                                link.url || '#'
                                                            }
                                                            isActive={
                                                                link.active
                                                            }
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (link.url) {
                                                                    router.visit(
                                                                        link.url,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                pageNum === currentPage - 2 ||
                                                pageNum === currentPage + 2
                                            ) {
                                                return (
                                                    <PaginationItem key={index}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        })}

                                    {/* Next Button */}
                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                children.links[
                                                    children.links.length - 1
                                                ]?.url || '#'
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const lastLink =
                                                    children.links[
                                                        children.links.length -
                                                            1
                                                    ];
                                                if (lastLink?.url) {
                                                    router.visit(lastLink.url);
                                                }
                                            }}
                                            className={
                                                !children.links[
                                                    children.links.length - 1
                                                ]?.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
