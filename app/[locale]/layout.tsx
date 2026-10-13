import type { Metadata } from 'next'
import { Outfit, Noto_Sans_Devanagari } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { QueryProvider } from '@/components/providers/query-provider'
import { PwaRegister } from '@/components/shared/pwa-register'
import type { ReactNode } from 'react'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'FarmerOS — Farm Operating System',
  description: 'Responsive, mobile-first farm operating system for Indian agriculture.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'mr' | 'hi')) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${notoSansDevanagari.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary-surface selection:text-primary-dark">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <PwaRegister />
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
