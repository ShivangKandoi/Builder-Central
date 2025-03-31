'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewToolRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to explore page
    router.replace('/explore');
  }, [router]);

  // Show loading message while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground">Redirecting to tool creation...</div>
    </div>
  );
} 