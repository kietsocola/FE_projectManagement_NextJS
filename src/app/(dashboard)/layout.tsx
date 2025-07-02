'use client';

import Link from "next/link";
import { Toaster } from '@/components/ui/sonner';
import { ProjectContext, MOCK_PROJECT_ID } from '@/app/context/ProjectContext';
import { UserContext, MOCK_USERS } from '@/app/context/UserContext';
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks" },
  { href: "/labels", label: "Labels" },
  { href: "/priorities", label: "Priorities" },
];

function Header() {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">BOOSTECH</span>
      </div>
    </header>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-48 min-h-full bg-white border-r flex flex-col py-8 px-4 gap-2">
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(`${item.href}`);
          return (
          <Link
            key={item.href}
            href={item.href}
            className={
                `font-medium px-3 py-2 rounded transition-colors
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`
              }
          >
            {item.label}
          </Link>
        )
        })}
      </nav>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Boostech Kanban. All rights reserved.
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectContext.Provider value={MOCK_PROJECT_ID}>
      <UserContext.Provider value={MOCK_USERS}>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Header />
          <div className="flex flex-1 min-h-0 bg-gray-100">
            <Sidebar />
            <main className="flex-1 px-8 py-8">{children}</main>
          </div>
          <Footer />
        </div>
        <Toaster richColors position="top-right" />
      </UserContext.Provider>
    </ProjectContext.Provider>
  );
}