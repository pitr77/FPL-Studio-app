
import React, { useEffect } from 'react';
import { trackPageView } from '../lib/analytics';

interface AnalyticsTrackerProps {
    currentView: string;
}

/**
 * Component that tracks page views when navigation occurs.
 * Since this SPA uses a 'view' state for navigation instead of React Router,
 * we track the view changes here.
 */
const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ currentView }) => {
    useEffect(() => {
        // We normalize the view name to a path-like string (e.g. /dashboard)
        const path = `/${currentView.toLowerCase().replace(/_/g, '-')}`;

        // Also include a fallback to window.location if helpful for tracking external referrals (like X)
        const fullPath = path + (typeof window !== 'undefined' ? window.location.search : '');

        trackPageView(fullPath);
    }, [currentView]);

    return null;
};

export default AnalyticsTracker;
