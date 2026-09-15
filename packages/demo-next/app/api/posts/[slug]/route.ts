import { getPostBySlug } from "@/lib/posts";

// 单篇文章接口：GET /api/posts/hello-next
// 供浏览器（客户端组件）在进入详情页时调用
export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/posts/[slug]'>,
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // 没有这篇文章 → 返回 404 JSON（不是 HTML 404 页）
  if (!post) {
    return Response.json({ error: "文章不存在" }, { status: 404 });
  }

  return Response.json(post);
}
