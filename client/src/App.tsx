import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/layout/protected-route";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import RestaurantLanding from "@/pages/restaurant-landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Subscribe from "@/pages/subscribe";
import SuperAdminDashboard from "@/pages/super-admin";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLandingPage from "@/pages/admin-landing";
import ClientDashboard from "@/pages/client-dashboard";
import EmpresaDashboard from "@/pages/empresa-dashboard-new";
import PedidosPage from "@/pages/admin/pedidos";
import ClientesPage from "@/pages/admin/clientes";
import CardapioPage from "@/pages/admin/cardapio";
import CardapioDigitalPage from "@/pages/admin/cardapio-digital";
import FinanceiroPage from "@/pages/admin/financeiro";
import CategoriasPage from "@/pages/admin/categorias";
import MesasPage from "@/pages/admin/mesas";
import WhatsAppPage from "@/pages/admin/whatsapp";
import AreasEntregaPage from "@/pages/admin/areas-entrega";
import ConfiguracoesPage from "@/pages/admin/configuracoes";
import SuportePage from "@/pages/admin/suporte";
import NovoPedidoPage from "@/pages/admin/novo-pedido";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RestaurantLanding} />
      <Route path="/old-landing" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/super-admin">
        <ProtectedRoute allowedRoles={["super_admin"]}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <EmpresaDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/pedidos">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <PedidosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/novo-pedido">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <NovoPedidoPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/clientes">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <ClientesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/cardapio">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <CardapioPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/cardapio-digital">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <CardapioDigitalPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/financeiro">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <FinanceiroPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/categorias">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <CategoriasPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/mesas">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <MesasPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/whatsapp">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <WhatsAppPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/areas-entrega">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <AreasEntregaPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/configuracoes">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <ConfiguracoesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/empresa/suporte">
        <ProtectedRoute allowedRoles={["empresa"]}>
          <SuportePage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-landing/:adminId">
        {(params) => <AdminLandingPage adminId={parseInt(params.adminId)} />}
      </Route>
      <Route path="/client">
        <ProtectedRoute allowedRoles={["client"]}>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
