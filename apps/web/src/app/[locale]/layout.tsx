import type { Metadata } from 'next';

import '../globals.css';
import { AppShell } from '@/ui/shell/AppShell';

export const metadata: Metadata = {
  title: 'YouTok',
  description: 'AI Clip SaaS',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
