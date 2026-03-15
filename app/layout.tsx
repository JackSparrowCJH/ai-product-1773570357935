import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "敲木鱼 - 积功德",
  description: "点击木鱼，积累功德，轻松解压",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
