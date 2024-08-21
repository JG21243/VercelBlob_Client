// /app/components/ui/toaster.tsx
import React from 'react';
import { useToast } from '@/components/ui/use-toast';

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <div className="toaster">
      {toasts.map((toast, index) => (
        <div key={index} className="toast">
          {toast}
        </div>
      ))}
    </div>
  );
};