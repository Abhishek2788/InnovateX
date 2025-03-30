import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "InovateX",
  description: "Finance Advisior with AI Integration",
};


export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-zinc-950`}>
          {/*header*/}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          {/*footer*/}
          <footer className="bg-black py-12">
            <div className="container mx-auto px-4 text-center text-white">
              <p>Made by Team InnovateX</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
