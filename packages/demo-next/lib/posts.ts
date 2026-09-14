// 一篇文章的数据结构
export type Post = {
  slug: string; // URL 标识，例如 /posts/hello-next
  title: string;
  date: string;
  excerpt: string; // 摘要
  content: string; // 正文（用空行分段）
};

// 模拟数据库：真实项目里这一步会换成查数据库 / 调 API
export const posts: Post[] = [
  {
    slug: "hello-next",
    title: "你好，Next.js",
    date: "2025-06-01",
    excerpt: "什么是 Next.js？为什么大家都用它？",
    content: `Next.js 是一个基于 React 的全栈框架。

它帮你解决了纯 React 项目的很多问题：路由、服务端渲染、打包优化、后端接口，全都内置。

最重要的特性是「文件即路由」：在 app 目录下新建一个文件夹，放一个 page.tsx，就自动拥有了一个页面。`,
  },
  {
    slug: "file-based-routing",
    title: "文件即路由",
    date: "2025-06-02",
    excerpt: "app 目录下的文件夹结构，就是你的网站地图。",
    content: `在 app 目录中，文件夹用来定义 URL 路径，page.tsx 用来定义这个路径显示的内容。

比如 app/about/page.tsx 对应 /about，app/posts/[slug]/page.tsx 对应 /posts/任意文章名。

方括号文件夹 [slug] 是「动态路由」，一个文件夹就能匹配无数个 URL。`,
  },
  {
    slug: "server-components",
    title: "服务端组件入门",
    date: "2025-06-03",
    excerpt: "默认情况下，Next.js 的组件都在服务器上渲染。",
    content: `App Router 下的组件默认是 Server Component（服务端组件）。

它们可以直接访问数据库、读取文件，这些代码不会打包发给浏览器，页面加载更快。

需要交互（useState、onClick）时，在文件顶部加 "use client"，该文件就变成 Client Component。`,
  },
];

// 根据 slug 查找单篇文章
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
