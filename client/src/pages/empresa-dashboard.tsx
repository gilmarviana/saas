import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Clock, 
  Phone, 
  MapPin,
  QrCode,
  Settings,
  TrendingUp,
  Package
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";

interface EmpresaStats {
  pedidosHoje: number;
  vendas: number;
  clientesTotal: number;
  pedidosPendentes: number;
}

interface Pedido {
  id: number;
  numero: string;
  cliente: string;
  total: number;
  status: string;
  tipo: string;
  createdAt: string;
}

export default function EmpresaDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<EmpresaStats>({
    queryKey: ['/api/empresa/stats'],
    enabled: !!user && user.role === 'empresa',
  });

  const { data: pedidos } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
    enabled: !!user && user.role === 'empresa',
  });

  const { data: cardapio } = useQuery({
    queryKey: ['/api/cardapio'],
    enabled: !!user && user.role === 'empresa',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'preparando': return 'bg-orange-100 text-orange-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'entregue': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'delivery': return <MapPin className="w-4 h-4" />;
      case 'balcao': return <Package className="w-4 h-4" />;
      case 'mesa': return <Users className="w-4 h-4" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  if (!user || user.role !== 'empresa') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600">
            Esta área é exclusiva para empresas/restaurantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard - {user.businessName || 'Restaurante'}
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie seus pedidos, cardápio e clientes
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pedidos Hoje"
            value={stats?.pedidosHoje || 0}
            icon="📋"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Vendas do Dia"
            value={`R$ ${stats?.vendas?.toFixed(2) || '0,00'}`}
            icon="💰"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Clientes"
            value={stats?.clientesTotal || 0}
            icon="👥"
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
          <StatsCard
            title="Pendentes"
            value={stats?.pedidosPendentes || 0}
            icon="⏱️"
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pedidos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="cardapio">Cardápio</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pedidos?.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(pedido.tipo)}
                          <span className="font-medium">#{pedido.numero}</span>
                        </div>
                        <div>
                          <p className="font-medium">{pedido.cliente}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(pedido.status)}>
                          {pedido.status}
                        </Badge>
                        <span className="font-bold">R$ {pedido.total.toFixed(2)}</span>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cardapio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Cardápio
                  </div>
                  <Button size="sm">
                    Adicionar Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gerencie seu cardápio
                  </h3>
                  <p className="text-gray-500">
                    Adicione, edite e organize os itens do seu cardápio
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Base de clientes
                  </h3>
                  <p className="text-gray-500">
                    Visualize e gerencie informações dos seus clientes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Relatórios Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Análise financeira
                  </h3>
                  <p className="text-gray-500">
                    Acompanhe vendas, despesas e relatórios detalhados
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}