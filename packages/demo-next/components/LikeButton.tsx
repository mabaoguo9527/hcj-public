"use client";

// ✨ Next 特性：'use client' 声明这是客户端组件
// 只有它会被打包进浏览器 JS，页面其余部分仍在服务端渲染

import { useState } from "react";

type Props = {
  initialLikes: number; // 初始值由服务端组件通过 props 传入
};

export default function LikeButton({ initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  function handleClick() {
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950"
          : "border-zinc-300 hover:border-blue-400 dark:border-zinc-700"
      }`}
    >
      👍 {liked ? "已赞" : "点赞"} · {likes}
    </button>
  );
}
