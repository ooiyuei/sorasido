'use client';
import { useEffect, useRef } from 'react';

// TODO: Replace with actual AdSense slot ID from Google AdSense dashboard
export default function AdBanner({ slot = '0000000000', format = 'auto' }: { slot?: string; format?: string }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && adsenseId) {
      try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
      initialized.current = true;
    }
  }, [adsenseId]);

  if (!adsenseId) return null;
  return (
    <div className="w-full flex justify-center my-4">
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={adsenseId} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  );
}