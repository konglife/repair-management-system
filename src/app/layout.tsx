import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from './providers'
import "./globals.css";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Repair Management System",
  description: "Professional repair shop management application for tracking repairs, inventory, and customer data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${prompt.variable} antialiased`}>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
