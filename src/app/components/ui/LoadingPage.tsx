// components/LoadingPage.tsx
'use client';

import { Loader2 } from 'lucide-react'; // Hoặc dùng icon spinner nào bạn thích
import React from 'react';

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-center text-gray-600 animate-pulse">
      <Loader2 className="w-8 h-8 mb-4 animate-spin text-blue-500" />
      <p>Loading page...</p>
    </div>
  );
}
