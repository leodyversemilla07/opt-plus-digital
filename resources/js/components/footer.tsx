import { Link } from '@inertiajs/react';

export function Footer() {
    return (
        <footer className="mt-auto border-t bg-card py-8 sm:py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:gap-8 sm:px-6 md:flex-row">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary p-1.5">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 512 512"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M256 128V384"
                                stroke="white"
                                strokeWidth="48"
                                strokeLinecap="round"
                            />
                            <path
                                d="M128 256H384"
                                stroke="white"
                                strokeWidth="48"
                                strokeLinecap="round"
                            />
                            <circle
                                cx="256"
                                cy="256"
                                r="180"
                                stroke="white"
                                strokeWidth="32"
                                strokeDasharray="30 30"
                                fill="none"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold">
                        OPT Plus Digital
                    </span>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                    <Link
                        href="#"
                        className="transition-colors hover:text-primary"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="#"
                        className="transition-colors hover:text-primary"
                    >
                        Terms of Service
                    </Link>
                    <a
                        href="https://www.nnc.gov.ph"
                        className="transition-colors hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Official NNC Website
                    </a>
                    <a
                        href="https://www.doh.gov.ph"
                        className="transition-colors hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Department of Health
                    </a>
                </div>

                <div className="text-xs text-muted-foreground opacity-60">
                    &copy; {new Date().getFullYear()} OPT Plus Digital Project.
                </div>
            </div>
        </footer>
    );
}
