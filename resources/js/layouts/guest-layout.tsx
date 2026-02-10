import { Footer } from '@/components/footer';
import { GovPHHeader } from '@/components/gov-ph-header';
import { Header } from '@/components/header';

interface GuestLayoutProps {
    children: React.ReactNode;
    canRegister?: boolean;
}

export default function GuestLayout({
    children,
    canRegister = true,
}: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <GovPHHeader />
            <Header canRegister={canRegister} />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
