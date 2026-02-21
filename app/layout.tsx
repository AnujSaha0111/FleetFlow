import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Logistics Platform",
  description: "AI-Powered Truck Loading Optimization",
  icons: {
    icon: "/icon.png", // Path to your file in public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* 1. The Navbar sits at the top */}
          {/* <Navbar />  */}
          
          {/* 2. The main content (Dashboard, Home, etc.) goes below */}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}