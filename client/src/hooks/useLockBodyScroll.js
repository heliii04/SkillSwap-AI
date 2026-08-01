import { useEffect } from 'react';

export default function useLockBodyScroll(isLocked = true) {
    useEffect(() => {
        if (!isLocked) return;
        
        // Save original body overflow
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        
        // Re-enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isLocked]);
}
