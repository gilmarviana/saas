import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Printer, 
  BarChart3, 
  UtensilsCrossed,
  Tags,
  QrCode,
  MessageSquare,
  MapPin,
  Truck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/empresa",
    badge: null
  },
  {
    icon: Users,
    label: "Clientes",
    path: "/empresa/clientes",
    badge: null
  },
  {
    icon: ShoppingCart,
    label: "Pedidos",
    path: "/empresa/pedidos",
    badge: "3"
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    path: "/empresa/financeiro",
    badge: null
  },
  {
    icon: Printer,
    label: "Impressão",
    path: "/empresa/impressao",
    badge: null
  },
  {
    icon: BarChart3,
    label: "Relatórios",
    path: "/empresa/relatorios",
    badge: null
  },
  {
    icon: UtensilsCrossed,
    label: "Cardápio",
    path: "/empresa/cardapio",
    badge: null
  },
  {
    icon: Tags,
    label: "Categorias",
    path: "/empresa/categorias",
    badge: null
  },
  {
    icon: Users,
    label: "Mesas",
    path: "/empresa/mesas",
    badge: null
  },
  {
    icon: QrCode,
    label: "Cardápio Digital",
    path: "/empresa/cardapio-digital",
    badge: null
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    path: "/empresa/whatsapp",
    badge: null
  },
  {
    icon: MapPin,
    label: "Entregas",
    path: "/empresa/entregas",
    badge: null
  },
  {
    icon: Truck,
    label: "Áreas de Entrega",
    path: "/empresa/areas-entrega",
    badge: null
  },
  {
    icon: Settings,
    label: "Configurações",
    path: "/empresa/configuracoes",
    badge: null
  },
  {
    icon: HelpCircle,
    label: "Suporte",
    path: "/empresa/suporte",
    badge: null
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-600">{user?.username}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-900"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} ${
                  isActive 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'px-2' : 'px-3'}`}
          onClick={logout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
}