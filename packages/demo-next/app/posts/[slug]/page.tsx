import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, posts } from "@/lib/posts";
import LikeButton from "@/components/LikeButton";
import PostContent from "@/components/PostContent";

// ✨ SSG 依然生效：构建时为每篇文章生成静态"外壳"
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

// ✨ 元信息仍由服务端生成（SEO 不受客户端取数影响）
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

// 🟦 服务端组件：负责"壳"——校验 slug、标题、日期、交互件
export default async function PostPage({
  params,
}: PageProps<'/posts/[slug]'>) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article>
      <Link
        href="/posts"
        className="text-sm text-zinc-500 hover:text-blue-600"
      >
        ← 返回列表
      </Link>

      {/* ---- 以下由服务端渲染，HTML 里直接就有 ---- */}
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{post.title}</h1>
      <time className="mt-2 block text-sm text-zinc-400">{post.date}</time>

      {/* ---- 正文也是服务端渲染：同样只传 slug，但代码不再进浏览器包 ---- */}
      <PostContent slug={slug} />

      <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <LikeButton initialLikes={Math.floor(post.slug.length * 3.7) + 1} />
      </div>
    </article>
  );
}
