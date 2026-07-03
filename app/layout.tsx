import "./globals.css";
import { Montserrat } from "next/font/google";
import { UIProvider } from "@/context/UIContext";
import AppShell from "@/components/AppShell";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "POS UMKM",
  description: "Sistem kasir dinamis untuk UMKM, kafe, dan warung",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={montserrat.variable}>
      <body className="font-sans">
        <UIProvider>
          <AppShell>{children}</AppShell>
        </UIProvider>
      </body>
    </html>
  );
}
