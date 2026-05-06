import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PaymentHydration } from "@/components/PaymentHydration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payment Gateway Demo",
  description:
    "Payment checkout UI with simulated API route, retries, and local transaction history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PaymentHydration>{children}</PaymentHydration>
      </body>
    </html>
  );
}
