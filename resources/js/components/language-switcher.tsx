import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'fil', label: 'Filipino' },
];

export function LanguageSwitcher({ variant = 'icon' }: { variant?: 'icon' | 'minimal' }) {
    const { i18n, t } = useTranslation();

    const switchLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-1">
                {languages.map((lang) => (
                    <Button
                        key={lang.code}
                        variant={lang.code === i18n.language ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => switchLanguage(lang.code)}
                    >
                        {lang.code.toUpperCase()}
                    </Button>
                ))}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">{t('settings.language')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={lang.code === i18n.language ? 'bg-accent font-medium' : ''}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
