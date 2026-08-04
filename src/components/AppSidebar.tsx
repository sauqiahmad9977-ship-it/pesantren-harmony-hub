import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { menu } from "@/lib/menu";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url;
  const { t, i18n } = useTranslation();
  const { data: settings } = useSettings();
  const { roles } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0 overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground icon-3d icon-3d-active" />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-semibold text-sidebar-foreground leading-tight truncate" title={settings?.app_name || "SIM Pesantren"}>
                {settings?.app_name || "SIM Pesantren"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider truncate">Manajemen Terpadu</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menu.map((group) => {
          const visibleItems = group.items.filter(item => 
            !item.allowedRoles || item.allowedRoles.some(r => roles.includes(r as any))
          );
          if (visibleItems.length === 0) return null;

          return (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{t(`sidebar.${group.label.toLowerCase()}`, group.label)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="group flex items-center gap-2">
                        {typeof item.icon === 'string' ? (
                          <img 
                            src={item.icon} 
                            alt={item.title} 
                            className={`h-5 w-5 shrink-0 icon-3d ${isActive(item.url) ? 'icon-3d-active' : ''} object-contain`} 
                          />
                        ) : (
                          <item.icon className={`h-5 w-5 shrink-0 icon-3d ${isActive(item.url) ? 'icon-3d-active text-primary' : ''}`} />
                        )}
                        <span>{t(`sidebar.${item.title.toLowerCase().replace(' ', '_')}`, item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          );
        })}
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.language', 'Bahasa')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                 <select 
                    className="w-full bg-sidebar-accent text-sidebar-foreground p-2 rounded-md border-0 text-sm focus:ring-1 focus:ring-sidebar-ring cursor-pointer"
                    value={i18n.language} 
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    <option value="id">🇮🇩 Indonesia</option>
                    <option value="ar">🇸🇦 العربية</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ms">🇲🇾 Melayu</option>
                  </select>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
