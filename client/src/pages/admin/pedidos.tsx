import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/layout";
import { 
  ShoppingCart, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Printer,
  Clock,
  MapPin,
  Package,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Pedido {
  id: number;
  numero: string;
  cliente: string;
  clienteId?: number;
  mesa?: string;
  total: number;
  status: string;
  tipo: string;
  createdAt: string;
  observacoes?: string;
  taxaEntrega?: number;
  itens: Array<{
    id: number;
    nome: string;
    quantidade: number;
    preco: number;
  }>;
}

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [editForm, setEditForm] = useState({
    tipo: '',
    mesa: '',
    observacoes: '',
    itens: [] as any[]
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: pedidos = [], isLoading } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
  });

  const { data: cardapio = [] } = useQuery({
    queryKey: ['/api/cardapio'],
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['/api/clientes'],
  });

  const confirmarPedidoMutation = useMutation({
    mutationFn: async (pedidoId: number) => {
      return apiRequest('POST', `/api/pedidos/${pedidoId}/confirmar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Pedido confirmado",
        description: "O pedido foi confirmado e o valor será liberado no financeiro.",
      });
    },
  });

  const cancelarPedidoMutation = useMutation({
    mutationFn: async (pedidoId: number) => {
      return apiRequest('POST', `/api/pedidos/${pedidoId}/cancelar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Pedido cancelado",
        description: "O pedido foi cancelado com sucesso.",
      });
    },
  });

  const editarPedidoMutation = useMutation({
    mutationFn: async (data: { id: number; pedido: any }) => {
      return apiRequest('PUT', `/api/pedidos/${data.id}`, data.pedido);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      toast({
        title: "Pedido atualizado",
        description: "O pedido foi atualizado com sucesso.",
      });
      setEditingPedido(null);
    },
  });

  const iniciarEdicao = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditForm({
      tipo: pedido.tipo,
      mesa: pedido.mesa || '',
      observacoes: pedido.observacoes || '',
      itens: pedido.itens.map(item => ({
        ...item,
        quantidade: item.quantidade
      }))
    });
  };

  const salvarEdicao = () => {
    if (!editingPedido) return;
    
    const pedidoAtualizado = {
      ...editForm,
      clienteId: editingPedido.clienteId,
      taxaEntrega: editingPedido.taxaEntrega || 0,
    };
    
    editarPedidoMutation.mutate({
      id: editingPedido.id,
      pedido: pedidoAtualizado
    });
  };

  const adicionarItemCardapio = (item: any) => {
    const itemExistente = editForm.itens.find(i => i.id === item.id);
    if (itemExistente) {
      setEditForm(prev => ({
        ...prev,
        itens: prev.itens.map(i => 
          i.id === item.id 
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        itens: [...prev.itens, {
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: 1
        }]
      }));
    }
  };

  const alterarQuantidadeItem = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      setEditForm(prev => ({
        ...prev,
        itens: prev.itens.filter(i => i.id !== id)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        itens: prev.itens.map(i => 
          i.id === id 
            ? { ...i, quantidade }
            : i
        )
      }));
    }
  };

  const calcularTotal = () => {
    const subtotal = editForm.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const taxa = editForm.tipo === 'delivery' ? (editingPedido?.taxaEntrega || 0) : 0;
    return subtotal + taxa;
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || pedido.status === statusFilter;
    const matchesTipo = tipoFilter === "todos" || pedido.tipo === tipoFilter;
    return matchesSearch && matchesStatus && matchesTipo;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos</h1>
          <p className="text-gray-600">Gerencie e confirme os pedidos do seu restaurante</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidos.filter(p => p.status === 'pendente').length}
                  </p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidos.filter(p => p.status === 'confirmado').length}
                  </p>
                  <p className="text-sm text-gray-600">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidos.filter(p => p.status === 'pronto').length}
                  </p>
                  <p className="text-sm text-gray-600">Prontos</p>
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
                    {formatCurrency(pedidos.reduce((sum, p) => sum + p.total, 0))}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>Confirme os pedidos para liberar o valor no financeiro</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => setLocation('/empresa/novo-pedido')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Novo Pedido
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente ou número do pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="preparando">Preparando</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="balcao">Balcão</SelectItem>
                  <SelectItem value="mesa">Mesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Número</th>
                    <th className="text-left py-2 px-4">Cliente</th>
                    <th className="text-left py-2 px-4">Total</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                          <span className="ml-2">Carregando pedidos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPedidos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPedidos.map((pedido) => (
                      <tr key={pedido.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{pedido.numero}</td>
                        <td className="py-3 px-4">{pedido.cliente}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(pedido.total)}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(pedido.status)}>
                            {pedido.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getTipoIcon(pedido.tipo)}
                            <span className="ml-2 capitalize">{pedido.tipo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(pedido.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPedido(pedido)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pedido.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => iniciarEdicao(pedido)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {pedido.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700"
                                onClick={() => confirmarPedidoMutation.mutate(pedido.id)}
                                disabled={confirmarPedidoMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => cancelarPedidoMutation.mutate(pedido.id)}
                                disabled={cancelarPedidoMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <Dialog open={editingPedido !== null} onOpenChange={() => setEditingPedido(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pedido {editingPedido?.numero}</DialogTitle>
              <DialogDescription>
                Modifique as informações do pedido conforme necessário.
              </DialogDescription>
            </DialogHeader>
            
            {editingPedido && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Entrega</Label>
                    <Select value={editForm.tipo} onValueChange={(value) => setEditForm(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balcao">Balcão</SelectItem>
                        <SelectItem value="mesa">Mesa</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editForm.tipo === 'mesa' && (
                    <div>
                      <Label htmlFor="mesa">Número da Mesa</Label>
                      <Input
                        id="mesa"
                        value={editForm.mesa}
                        onChange={(e) => setEditForm(prev => ({ ...prev, mesa: e.target.value }))}
                        placeholder="Ex: 1, 2, 3..."
                      />
                    </div>
                  )}
                </div>

                {/* Itens do Pedido */}
                <div>
                  <Label className="text-base font-semibold">Itens do Pedido</Label>
                  <div className="space-y-2 mt-2">
                    {editForm.itens.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{item.nome}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {formatCurrency(item.preco)} cada
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alterarQuantidadeItem(item.id, item.quantidade - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantidade}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alterarQuantidadeItem(item.id, item.quantidade + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => alterarQuantidadeItem(item.id, 0)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adicionar Itens do Cardápio */}
                <div>
                  <Label className="text-base font-semibold">Adicionar Itens</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {cardapio.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{item.nome}</span>
                          <span className="text-sm text-gray-600 block">
                            {formatCurrency(item.preco)}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => adicionarItemCardapio(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={editForm.observacoes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações especiais do pedido..."
                    rows={3}
                  />
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formatCurrency(calcularTotal())}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPedido(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={salvarEdicao}
                disabled={editarPedidoMutation.isPending}
              >
                {editarPedidoMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}