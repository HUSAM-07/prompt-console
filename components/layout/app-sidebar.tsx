'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Sparkles,
  BarChart3,
  DollarSign,
  ScrollText,
  Layers,
  Code,
  Key,
  Gauge,
  Settings,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSettingsStore } from '@/stores/settings-store';

const buildItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    disabled: false,
  },
  {
    title: 'Workbench',
    icon: Wrench,
    href: '/workbench',
    disabled: false,
  },
  {
    title: 'Files',
    icon: FileText,
    href: '/files',
    disabled: false,
  }
];

const analyticsItems = [
  {
    title: 'Usage',
    icon: BarChart3,
    href: '/usage',
    disabled: true,
  },
  {
    title: 'Cost',
    icon: DollarSign,
    href: '/cost',
    disabled: true,
  },
  {
    title: 'Logs',
    icon: ScrollText,
    href: '/logs',
    disabled: true,
  },
  {
    title: 'Batches',
    icon: Layers,
    href: '/batches',
    disabled: true,
  }
];

const manageItems = [
  {
    title: 'API keys',
    icon: Key,
    href: '/api-keys',
  },
  {
    title: 'Limits',
    icon: Gauge,
    href: '/limits',
    disabled: true,
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const settings = useSettingsStore((state) => state.settings);

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center py-1 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-foreground">
              Prompt Console
            </span>
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* BUILD Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>BUILD</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {buildItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                    tooltip={item.title}
                    disabled={item.disabled}
                  >
                    <Link
                      href={item.disabled ? '#' : item.href}
                      className={item.disabled ? 'pointer-events-none opacity-50' : ''}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ANALYTICS Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>ANALYTICS</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    disabled={item.disabled}
                  >
                    <Link
                      href={item.disabled ? '#' : item.href}
                      className={item.disabled ? 'pointer-events-none opacity-50' : ''}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* MANAGE Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>MANAGE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    disabled={item.disabled}
                  >
                    <Link
                      href={item.disabled ? '#' : item.href}
                      className={item.disabled ? 'pointer-events-none opacity-50' : ''}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        {/* Documentation Link */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Documentation">
              <Link href="/docs" target="_blank">
                <BookOpen className="size-4" />
                <span>Documentation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Profile */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {settings.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {settings.userName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          Individual Plan
                        </span>
                      </div>
                      <ChevronDown className="ml-auto size-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api-keys">
                    <Key className="mr-2 size-4" />
                    API Keys
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
