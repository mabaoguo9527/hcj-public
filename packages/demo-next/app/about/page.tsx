import type { Metadata } from "next";

// ✨ Next 特性：页面级 metadata，配合根布局的 template
// 最终标签页标题 = "关于 | 我的迷你博客"
export const metadata: Metadata = {
  title: "关于",
  description: "关于这个迷你博客项目",
};

export default function AboutPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">关于本项目</h1>

      <div className="mt-6 space-y-4 leading-7 text-zinc-700 dark:text-zinc-300">
        <p>
          这是一个<strong>教学用</strong>的 Next.js 多页面项目，演示了以下特性：
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>文件即路由（about、posts 等页面）</li>
          <li>嵌套布局与 metadata 管理</li>
          <li>动态路由 /posts/[slug]</li>
          <li>静态生成 SSG（generateStaticParams）</li>
          <li>Route Handler 接口（/api/posts）</li>
          <li>客户端组件（文章页的点赞按钮）</li>
        </ul>
        <p className="text-sm text-zinc-500">
          数据存放在 lib/posts.ts，真实项目里替换为数据库查询即可。
        </p>
      </div>
    </section>
  );
}
