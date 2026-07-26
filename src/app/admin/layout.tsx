import { SessionProvider } from "@/components/providers/SessionProvider";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
