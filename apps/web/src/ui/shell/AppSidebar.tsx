'use client';

import { SidebarContent } from '@/ui/shell/SidebarContent';

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <SidebarContent />
    </aside>
  );
}
