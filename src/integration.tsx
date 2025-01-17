import { createRoot } from "react-dom/client";
import { AppContextProvider } from './Context/Context';
import { Widget } from './components/Widget/Widget';

// Import Tailwind styles
import './index.css';

// Function to load external scripts
const loadScript = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
    });
};

// Function to load CSS from a file
const loadCSS = async (url: string): Promise<string> => {
    const response = await fetch(url);
    return response.text();
};

const injectCSS = (css: string) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
};

interface AccessibilityWidgetConfig {
    appId?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    theme?: {
        primaryColor?: string;
    };
}

declare global {
    interface Window {
        AccessibililtyWidgetSDK: {
            initialize: (config: AccessibilityWidgetConfig) => void;
        };
    }
}

const initialize = async (config: AccessibilityWidgetConfig): Promise<void> => {
    try {
        // Load CSS
        const css = await loadCSS('./index.css'); // Adjust the path if necessary
        injectCSS(css);

        // Load React and ReactDOM if not already loaded
        if (!window.React) {
            await loadScript('https://unpkg.com/react@18/umd/react.production.min.js');
        }
        if (!window.ReactDOM) {
            await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
        }

        const { appId = "default" } = config;

        if (!appId) {
            console.error('App ID is required');
            return;
        }

        // Remove existing widget if present
        const existingWidget = document.getElementById('accessibility-widget-root');
        if (existingWidget) {
            existingWidget.remove();
        }

        const widgetRoot = document.createElement('div');
        widgetRoot.id = 'accessibility-widget-root';
        document.body.appendChild(widgetRoot);

        createRoot(widgetRoot).render(
            <AppContextProvider>
                <Widget />
            </AppContextProvider>
        );
    } catch (error) {
        console.error('Failed to initialize AccessibilityWidget:', error);
    }
};

// For UMD/script tag usage
window.AccessibililtyWidgetSDK = { initialize };

// For ESM/npm usage
export { initialize as initializeAccessibililtyWidget };