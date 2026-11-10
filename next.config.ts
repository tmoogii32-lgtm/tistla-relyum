import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // "Шалгалт өгөх" хуудас "Даалгавартай ажиллах" болсон — хуучин холбоос ажилласаар байна
  async redirects() {
    return [
      { source: "/shalgalt", destination: "/daalgavar", permanent: true },
      // "Түвшин" тайлан Нүүр хуудсанд шилжсэн
      { source: "/tuvshin", destination: "/#tuvshin", permanent: true },
    ];
  },
  partialPrefetching: true,
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
