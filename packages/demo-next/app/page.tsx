import Link from "next/link";
import { posts } from "@/lib/posts";

// 服务端组件：直接读数据，无需 useEffect / 接口请求
export default function Home() {
  const latestPosts = posts.slice(0, 3); // 取最新 3 篇

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">
        欢迎来到我的迷你博客
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        这是一个用 Next.js App Router 搭建的多页面示例项目，用来学习文件路由、
        动态路由、布局和数据获取。
      </p>

      <h2 className="mt-10 text-xl font-semibold">最新文章</h2>
      <ul className="mt-4 space-y-3">
        {latestPosts.map((post) => (
          <li
            key={post.slug}
            className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-blue-400 dark:border-zinc-800"
          >
            <Link href={`/posts/${post.slug}`}>
              <span className="font-medium text-blue-600">
                {post.title}
              </span>
              <span className="ml-3 text-sm text-zinc-400">{post.date}</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/posts"
        className="mt-6 inline-block text-sm text-zinc-500 underline underline-offset-4 hover:text-blue-600"
      >
        查看全部文章 →
      </Link>
    </section>
  );
}
