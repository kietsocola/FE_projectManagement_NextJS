'use client';

import Link from "next/link";
import { Toaster } from '@/components/ui/sonner';
import { ProjectContext, MOCK_PROJECT_ID } from '@/app/context/ProjectContext';
import { UserContext, MOCK_USERS } from '@/app/context/UserContext';
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react"; // hoặc bất kỳ icon nào bạn thích

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks" },
  { href: "/labels", label: "Labels" },
  { href: "/priorities", label: "Priorities" },
];

function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">BOOSTECH</span>
        {/* Hamburger chỉ hiện trên mobile */}
        <button
          className="sm:hidden p-2 rounded hover:bg-gray-100"
          onClick={onOpenSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  // Sidebar dạng overlay trên mobile, cố định bên trái trên desktop
  return (
    <>
      {/* Overlay cho mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-white border-r flex-col py-8 px-4 gap-2
          transform ${open ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200
          sm:static sm:translate-x-0 sm:flex sm:w-48 sm:min-h-full
        `}
        style={{ minHeight: "100vh" }}
      >
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
                onClick={onClose}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProjectContext.Provider value={MOCK_PROJECT_ID}>
      <UserContext.Provider value={MOCK_USERS}>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="flex flex-1 min-h-0 bg-gray-100">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 px-4 sm:px-8 py-8 pt-0 overflow-x-auto">{children}</main>
          </div>
          <Footer />
        </div>
        <Toaster richColors position="top-right" />
      </UserContext.Provider>
    </ProjectContext.Provider>
  );
}