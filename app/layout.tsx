import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kettlebod",
  description: "Your personal kettlebell workout generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased`}>
        <main className="flex-1 pb-20 max-w-lg mx-auto w-full px-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
