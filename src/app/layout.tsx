import { Sidebar } from '@/components/layout/Sidebar';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoTabsJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

export const metadata = {
  title: 'Trade Gate & Log',
  description: '裁量トレーダー向け エントリー前チェック＋トレードログ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${notoTabsJP.variable} font-sans bg-background text-foreground antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
