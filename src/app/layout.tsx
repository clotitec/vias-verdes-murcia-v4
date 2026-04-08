import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#5A9E8F',
};

export const metadata: Metadata = {
  title: 'Vias Verdes de la Region de Murcia',
  description:
    'Explora las 8 Vias Verdes de la Region de Murcia: mas de 180 km de rutas ciclistas y senderistas sobre antiguos trazados ferroviarios.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo-vv-murcia.webp',
    apple: '/images/logo-vv-murcia.webp',
  },
  openGraph: {
    title: 'Vias Verdes de la Region de Murcia',
    description: 'Explora 8 rutas ciclistas sobre antiguos trazados ferroviarios en Murcia.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
