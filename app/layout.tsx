import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PersonaProvider } from "@/components/persona/PersonaProvider";
import { ToastProvider } from "@/components/common/Toast";

export const metadata: Metadata = {
  title: "Salik API Developer Portal — Demo",
  description:
    "Salik API Developer Portal demo — discover, test, subscribe to, and monitor Salik mobility APIs. All data is fictional and for demonstration purposes only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <PersonaProvider>
            <ToastProvider>{children}</ToastProvider>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
