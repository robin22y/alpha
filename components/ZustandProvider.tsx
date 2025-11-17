'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function ZustandProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrate = useUserStore.persist?.rehydrate;

  useEffect(() => {
    // Only hydrate on client side
    if (hydrate) {
      hydrate();
    }
    setIsHydrated(true);
  }, [hydrate]);

  if (!isHydrated) {
    return null; // or a loading state
  }

  return <>{children}</>;
}

