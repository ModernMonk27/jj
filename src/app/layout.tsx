import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "temp_app",
  description: "Birthday experience space",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-white">{children}</body>
    </html>
  );
}
