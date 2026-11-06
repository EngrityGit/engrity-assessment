import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Engrity Assessments", template: "%s · Engrity" },
  description: "Engrity talent platform — assessments, AI interviews, learning and compliance.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0071fe" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
