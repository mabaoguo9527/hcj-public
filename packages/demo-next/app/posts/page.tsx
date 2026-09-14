import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章列表",
};

// ✨ Next 特性：服务端组件可以是 async 函数
// 如果数据来自数据库，这里直接写 await db.post.findMany() 即可
export default async function PostsPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">全部文章</h1>
      <p className="mt-2 text-sm text-zinc-500">共 {posts.length} 篇</p>

      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="rounded-xl border border-zinc-200 p-5 transition-colors hover:border-blue-400 dark:border-zinc-800"
          >
            <Link href={`/posts/${post.slug}`} className="block">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold hover:text-blue-600">
                  {post.title}
                </h2>
                <time className="shrink-0 text-sm text-zinc-400">
                  {post.date}
                </time>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
