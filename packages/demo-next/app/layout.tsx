import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✨ Next 特性：导出 metadata 即可自动生成 <head> 标签
// title.template 会让子页面自动变成 "子页面标题 | 我的迷你博客"
export const metadata: Metadata = {
  title: {
    default: "我的迷你博客",
    template: "%s | 我的迷你博客",
  },
  description: "一个用于学习 Next.js 的多页面小项目",
};

// ✨ Next 特性：layout 是所有页面的共享外壳
// 切换页面时只有 children 部分变化，导航栏不会重新渲染
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold">
              🐣 迷你博客
            </Link>
            <div className="flex gap-6 text-sm">
              {/* ✨ Next 特性：<Link> 客户端导航 + 自动预取 */}
              <Link href="/" className="hover:text-blue-600">
                首页
              </Link>
              <Link href="/posts" className="hover:text-blue-600">
                文章
              </Link>
              <Link href="/about" className="hover:text-blue-600">
                关于
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500">
          用 Next.js 学习搭建 · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
