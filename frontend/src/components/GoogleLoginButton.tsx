import { useEffect, useRef } from 'react';
import { loadGoogleScript } from '../utils/googleScript';

interface GoogleLoginButtonProps {
  onSuccess: (response: any) => void;
}

export default function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = () => {
      const g = (window as any).google;
      if (!g || !containerRef.current) return;
      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: onSuccess,
      });
      g.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'pill',
      });
    };
    loadGoogleScript(init);
  }, [onSuccess]);

  return <div ref={containerRef} />;
}
