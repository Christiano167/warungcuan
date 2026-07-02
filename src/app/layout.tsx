import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/sidebar";

export const metadata: Metadata = {
  title: "WarungCuan",
  description: "Aplikasi kasir warung sembako",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg)",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
