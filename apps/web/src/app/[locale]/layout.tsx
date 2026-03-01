import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';

import '../globals.css';
import { AppShell } from '@/ui/shell/AppShell';
import { getMessages } from '@/i18n/getMessages';
import { isLocale, type AppLocale } from '@/i18n/locales';

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
  const { locale: rawLocale } = await params;
  const locale: AppLocale = isLocale(rawLocale) ? rawLocale : 'fr';

  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
