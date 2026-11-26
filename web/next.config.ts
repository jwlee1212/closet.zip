import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 데모는 모든 화면 상태를 브라우저(localStorage)에서 읽으므로 Cache Components는 끈다.
  // 백엔드 연동 후 서버 데이터 캐싱이 필요해지면 다시 켜는 것을 검토.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
