import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { initializeTheme } from './hooks/use-appearance';

import './i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    strictMode: true,
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                console.log(
                    '[SW] Service Worker registered:',
                    registration.scope,
                );
            })
            .catch((error) => {
                console.error(
                    '[SW] Service Worker registration failed:',
                    error,
                );
            });
    });
}
