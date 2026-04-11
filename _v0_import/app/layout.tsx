import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-inter'
});

const notoSans = Noto_Sans({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-noto'
});

export const metadata: Metadata = {
  title: 'Mulkchi - Ko\'chmas mulk bozori',
  description: 'O\'zbekistondagi eng ishonchli ko\'chmas mulk sayti. Kvartira, uy, ofis va boshqa mulklarni sotib oling yoki ijaraga bering.',
  generator: 'v0.app',
  keywords: ['ko\'chmas mulk', 'kvartira', 'uy sotish', 'ijara', 'Toshkent', 'Uzbekistan'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#C0392B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className={`${inter.variable} ${notoSans.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
