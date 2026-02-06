import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 설정 (Next.js 16+)
  // 빈 설정으로 추가하여 webpack과의 충돌 방지
  turbopack: {},
  // Webpack 설정 (빌드 시 사용)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들에서 Prisma 관련 모듈 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
};

export default nextConfig;
