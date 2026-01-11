
export const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;

// Declare gtag as a global function for TypeScript
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

/**
 * Initializes Google Analytics by injecting the gtag script
 */
export const initGA = () => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

    // Check if it's already initialized
    if (window.gtag) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      anonymize_ip: true,
      send_page_view: false // We will track page views manually for the SPA
    });
  `;
    document.head.appendChild(script2);
};

/**
 * Tracks a page view
 * @param path The URL path to track
 */
export const trackPageView = (path: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        anonymize_ip: true
    });
};
