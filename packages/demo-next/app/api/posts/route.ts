import { posts } from "@/lib/posts";

// ✨ Next 特性：Route Handler —— 在 app 目录里写后端接口
// 访问 GET /api/posts 即可拿到 JSON

export async function GET() {
  return Response.json({
    count: posts.length,
    posts: posts.map(({ slug, title, date, excerpt }) => ({
      slug,
      title,
      date,
      excerpt,
    })),
  });
}
