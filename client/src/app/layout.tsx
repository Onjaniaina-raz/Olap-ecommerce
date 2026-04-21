import type { Metadata } from 'next';
import './globals.css';
import CubeClientProvider from '@/components/CubeProvider';

export const metadata: Metadata = {
  title: 'OLAP Dashboard',
  description: 'E-commerce Analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CubeClientProvider>
          {children}
        </CubeClientProvider>
      </body>
    </html>
  );
}