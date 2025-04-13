"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollToBottom<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const refEnd = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const onScroll = () => {
        if (!ref.current) return;

        const isUserScrollingUp = ref.current.scrollTop + ref.current.clientHeight < ref.current.scrollHeight - 100;

        if (isUserScrollingUp) {
            setShouldAutoScroll(false);
        } else {
            setShouldAutoScroll(true);
        }
    };

    useEffect(() => {
        const refCurrent = ref.current;
        refCurrent?.addEventListener("scroll", onScroll);
        return () => {
            refCurrent?.removeEventListener("scroll", onScroll);
        };
    }, []);

    useEffect(() => {
        if (shouldAutoScroll && refEnd.current) {
            refEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [shouldAutoScroll]);

    return [ref, refEnd] as const;
}
