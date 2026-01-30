export function GovPHHeader() {
    return (
        <div className="border-b border-border bg-muted px-4 py-1 font-sans text-[10px] md:text-xs">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="flex items-center gap-1 font-bold tracking-tight text-foreground">
                        <span className="hidden md:inline">
                            Republic of the Philippines
                        </span>
                        <span className="md:hidden">GOVPH</span>
                    </span>
                    <nav className="hidden items-center gap-4 text-muted-foreground md:flex">
                        <a
                            href="https://www.gov.ph"
                            className="hover:text-foreground hover:underline"
                        >
                            Home
                        </a>
                        <a
                            href="https://www.gov.ph/about-the-philippines"
                            className="hover:text-foreground hover:underline"
                        >
                            About the Philippines
                        </a>
                        <a
                            href="https://www.gov.ph/services"
                            className="hover:text-foreground hover:underline"
                        >
                            Services
                        </a>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden text-muted-foreground italic lg:inline">
                        Official Portal of the Philippine Government
                    </span>
                </div>
            </div>
        </div>
    );
}
