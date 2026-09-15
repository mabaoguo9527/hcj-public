// 🟦 服务端组件（没有 "use client"）
// 和客户端版本对比：
//   - 无 hooks、无三态管理：数据在手，直接渲染
//   - 取数直接调用数据层函数，无需绕道 HTTP 接口
//   - 代码不进浏览器 JS 包，正文直接写入 HTML（SEO 友好）
import { getPostBySlug } from "@/lib/posts";

export default function PostContent({ slug }: { slug: string }) {
  const post = getPostBySlug(slug); // 服务端取数：直接调用，无需 fetch
  if (!post) return null;

  return (
    <div className="mt-6 space-y-4 leading-8 text-zinc-700 dark:text-zinc-300">
      {post.content.split("\n\n").map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
