import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/layout";
import { 
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Receipt
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Mesa {
  id: number;
  numero: string;
  status: 'ocupada' | 'fechada';
  pedidos: number[];
  totalConta: number;
  abertaEm: string;
  fechadaEm?: string;
}

export default function MesasPage() {
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mesas = [], isLoading } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  const fecharMesaMutation = useMutation({
    mutationFn: async (numero: string) => {
      return apiRequest('POST', `/api/mesas/${numero}/fechar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Mesa fechada",
        description: "A mesa foi fechada e os pedidos foram finalizados.",
      });
      setSelectedMesa(null);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'fechada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ocupada': return <XCircle className="w-4 h-4" />;
      case 'fechada': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const mesasOcupadas = mesas.filter(m => m.status === 'ocupada').length;
  const totalVendas = mesas.reduce((total, m) => total + m.totalConta, 0);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Mesas</h1>
          <p className="text-gray-600">Gerencie as mesas do seu restaurante</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {mesasOcupadas}
                  </p>
                  <p className="text-sm text-gray-600">Mesas Ocupadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {mesas.filter(m => m.status === 'fechada').length}
                  </p>
                  <p className="text-sm text-gray-600">Mesas Fechadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalVendas)}
                  </p>
                  <p className="text-sm text-gray-600">Total em Vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mesas Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Mesas do Restaurante</CardTitle>
            <CardDescription>Visualize e gerencie as mesas ocupadas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-2">Carregando mesas...</span>
                </div>
              </div>
            ) : mesas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma mesa encontrada
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mesas.map((mesa) => (
                  <Card key={mesa.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-orange-600" />
                          <CardTitle className="text-lg">Mesa {mesa.numero}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(mesa.status)}>
                          {getStatusIcon(mesa.status)}
                          <span className="ml-1 capitalize">{mesa.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total da Conta:</span>
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(mesa.totalConta)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pedidos:</span>
                          <span className="text-sm font-medium">
                            {mesa.pedidos.length} pedido(s)
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Aberta em:</span>
                          <span className="text-sm">
                            {formatDateTime(mesa.abertaEm)}
                          </span>
                        </div>
                        
                        {mesa.fechadaEm && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Fechada em:</span>
                            <span className="text-sm">
                              {formatDateTime(mesa.fechadaEm)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedMesa(mesa)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {mesa.status === 'ocupada' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => fecharMesaMutation.mutate(mesa.numero)}
                            disabled={fecharMesaMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}