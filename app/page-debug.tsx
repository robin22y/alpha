'use client';

import { useState, useEffect } from 'react';

export default function LandingPageDebug() {
  const [mounted, setMounted] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      console.log('Render count:', newCount);
      if (newCount > 10) {
        console.error('Too many renders!');
      }
      return newCount;
    });
  });

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black mb-4">zdebt Debug</h1>
      <p className="text-black">Render count: {renderCount}</p>
      <p className="text-black">Mounted: {mounted ? 'Yes' : 'No'}</p>
    </div>
  );
}

