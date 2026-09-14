import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, posts } from "@/lib/posts";
import LikeButton from "@/components/LikeButton";

// ✨ Next 特性：SSG 静态生成
// 构建时对每个 slug 生成一个静态 HTML 页面，访问速度极快
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

// ✨ Next 特性：根据文章内容动态生成 <head> 标签
export async function generateMetadata(
  { params }: PageProps<'/posts/[slug]'>,
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post?.title ?? "文章不存在",
    description: post?.excerpt,
  };
}

// ✨ Next 特性：动态路由参数在 params 里（Next 15+ 是 Promise，必须 await）
export default async function PostPage({
  params,
}: PageProps<'/posts/[slug]'>) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // ✨ Next 特性：数据不存在时渲染 404 页面（可用 app/not-found.tsx 自定义）
  if (!post) notFound();

  // 正文按空行拆成段落
  const paragraphs = post.content.split("\n\n");

  return (
    <article>
      <Link
        href="/posts"
        className="text-sm text-zinc-500 hover:text-blue-600"
      >
        ← 返回列表
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{post.title}</h1>
      <time className="mt-2 block text-sm text-zinc-400">{post.date}</time>

      <div className="mt-6 space-y-4 leading-8 text-zinc-700 dark:text-zinc-300">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* 服务端组件（本页面）把数据作为 props 传给客户端组件 */}
      <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <LikeButton initialLikes={Math.floor(post.slug.length * 3.7) + 1} />
      </div>
    </article>
  );
}
