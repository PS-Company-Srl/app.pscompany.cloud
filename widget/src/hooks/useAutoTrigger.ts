import { useEffect, useRef } from 'react';

interface UseAutoTriggerOptions {
  delay: number;
  message?: string;
  enabled: boolean;
  onTrigger: () => void;
}

export function useAutoTrigger({ delay, enabled, onTrigger }: UseAutoTriggerOptions): void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled || delay <= 0 || hasTriggeredRef.current) return;

    const sessionKey = 'pscompany_widget_triggered';
    if (sessionStorage.getItem(sessionKey)) {
      hasTriggeredRef.current = true;
      return;
    }

    timerRef.current = setTimeout(() => {
      hasTriggeredRef.current = true;
      sessionStorage.setItem(sessionKey, 'true');
      onTrigger();
    }, delay * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay, enabled, onTrigger]);
}
