import { Toaster } from "@/components/ui/sonner"
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}
    <Toaster richColors position="top-right" /></>; // hoặc thêm bất kỳ wrapper layout nào bạn muốn
}
