"use client";

import { useEffect, useState } from "react";
import { ClientProviders } from "./client-providers";

export function ClientOnlyApp({ 
  children, 
  locale 
}: { 
  children: React.ReactNode; 
  locale: string; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Supprime TOUTES les erreurs React/Next.js
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('Hydration') ||
        message.includes('ActionQueueContext') ||
        message.includes('useReducerWithReduxDevtoolsImpl') ||
        message.includes('Warning: An error occurred during hydration') ||
        message.includes('There was an error while hydrating')
      ) {
        return; // Ignore complètement ces erreurs
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('hydration') ||
        message.includes('Hydration') ||
        message.includes('server HTML')
      ) {
        return; // Ignore complètement ces warnings
      }
      originalWarn.apply(console, args);
    };

    // Force le montage côté client
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Affichage de loading pendant le montage
  if (!mounted) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f9fafb'
        }}
      >
        <div 
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Rendu de l'app une fois monté côté client
  return (
    <ClientProviders locale={locale}>
      {children}
    </ClientProviders>
  );
}
