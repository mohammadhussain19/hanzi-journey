import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hanzi Journey — Learn Chinese, one lesson at a time",
    template: "%s · Hanzi Journey",
  },
  description: "A thoughtful, beginner-friendly path to Mandarin with HSK-aligned lessons, listening practice, and spaced review.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
