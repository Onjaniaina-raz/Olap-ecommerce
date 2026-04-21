'use client';
import cubejsApi from '@/lib/cube';
import { CubeProvider } from '@cubejs-client/react';

export default function CubeClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <CubeProvider cubeApi={cubejsApi}>
      {children}
    </CubeProvider>
  );
}