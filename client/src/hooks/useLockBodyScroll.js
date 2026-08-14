import { useEffect } from "react";

let activeLockCount = 0;
let originalBodyOverflow = "";
let originalBodyTouchAction = "";
let originalHtmlOverflow = "";
let originalHtmlTouchAction = "";

/**
 * Universal Cross-Device Body Scroll Lock Hook
 * Reference-counted to safely support nested modals, popups, and drawers across Laptop, Desktop, and Mobile (iOS/Android) devices.
 *
 * @param {boolean} isLocked - Whether the component/modal is active and requesting scroll lock
 */
export default function useLockBodyScroll(isLocked = true) {
    useEffect(() => {
        if (!isLocked) return;

        if (activeLockCount === 0) {
            originalBodyOverflow = window.getComputedStyle(document.body).overflow;
            originalBodyTouchAction = window.getComputedStyle(document.body).touchAction;
            originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
            originalHtmlTouchAction = window.getComputedStyle(document.documentElement).touchAction;

            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
            document.documentElement.style.overflow = "hidden";
            document.documentElement.style.touchAction = "none";
        }

        activeLockCount += 1;

        return () => {
            activeLockCount = Math.max(0, activeLockCount - 1);

            if (activeLockCount === 0) {
                document.body.style.overflow = originalBodyOverflow;
                document.body.style.touchAction = originalBodyTouchAction;
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.documentElement.style.touchAction = originalHtmlTouchAction;
            }
        };
    }, [isLocked]);
}
