import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/sidebar";

export const metadata: Metadata = {
  title: "WarungCuan",
  description: "Aplikasi kasir untuk warung sembako",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
