import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VMCraft — Linux VM in your browser",
  description: "Run a real Linux VM in a browser tab. No servers. No installs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}