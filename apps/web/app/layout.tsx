import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

/**
 * Font nội dung. Dùng Be Vietnam Pro thay Poppins (PLAN) vì Poppins không có chữ Việt có dấu;
 * Be Vietnam Pro cùng phong cách hình học và hỗ trợ đầy đủ tiếng Việt.
 */
const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

/** Font tiêu đề kiểu taalas. Không có tiếng Việt: chỉ dùng cho logo và tiêu đề tiếng Anh. */
const panchang = localFont({
  variable: '--font-panchang',
  src: [
    { path: './fonts/Panchang-500.woff2', weight: '500' },
    { path: './fonts/Panchang-600.woff2', weight: '600' },
    { path: './fonts/Panchang-700.woff2', weight: '700' },
  ],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Evolve Web',
  description: 'Quản lý dự án tối giản',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`dark ${beVietnamPro.variable} ${panchang.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
