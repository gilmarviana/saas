import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/layout";
import { 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  MapPin,
  Phone,
  Save,
  ArrowLeft
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ItemCardapio {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

interface ItemPedido {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacoes?: string;
}

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
}

export default function NovoPedidoPage() {
  const [, setLocation] = useLocation();
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'balcao' | 'mesa'>('delivery');
  const [mesa, setMesa] = useState('');
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [taxaEntrega, setTaxaEntrega] = useState(5.00);
  const [searchCliente, setSearchCliente] = useState('');
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    endereco: ''
  });
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cardapio = [] } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  const { data: clientes = [] } = useQuery<Cliente[]>({
    queryKey: ['/api/clientes'],
  });

  const criarPedidoMutation = useMutation({
    mutationFn: async (pedido: any) => {
      return apiRequest('POST', '/api/pedidos', pedido);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Pedido criado",
        description: "O pedido foi criado com sucesso.",
      });
      setLocation('/empresa/pedidos');
    },
  });

  const criarClienteMutation = useMutation({
    mutationFn: async (cliente: any) => {
      return apiRequest('POST', '/api/clientes', cliente);
    },
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
      setClienteSelecionado(cliente);
      setMostrarNovoCliente(false);
      setNovoCliente({ nome: '', telefone: '', endereco: '' });
      toast({
        title: "Cliente criado",
        description: "O cliente foi criado com sucesso.",
      });
    },
  });

  const adicionarItem = (item: ItemCardapio) => {
    const itemExistente = itensPedido.find(i => i.id === item.id);
    if (itemExistente) {
      setItensPedido(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      );
    } else {
      setItensPedido(prev => [...prev, {
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: 1
      }]);
    }
  };

  const removerItem = (id: number) => {
    setItensPedido(prev => prev.filter(i => i.id !== id));
  };

  const alterarQuantidade = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(id);
      return;
    }
    setItensPedido(prev => 
      prev.map(i => 
        i.id === id 
          ? { ...i, quantidade }
          : i
      )
    );
  };

  const calcularSubtotal = () => {
    return itensPedido.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal + (tipoEntrega === 'delivery' ? taxaEntrega : 0);
  };

  const handleSubmit = () => {
    if (tipoEntrega === 'delivery' && !clienteSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para delivery.",
        variant: "destructive",
      });
      return;
    }

    if (tipoEntrega === 'mesa' && !mesa) {
      toast({
        title: "Erro",
        description: "Informe o número da mesa.",
        variant: "destructive",
      });
      return;
    }

    if (itensPedido.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive",
      });
      return;
    }

    const pedido = {
      clienteId: clienteSelecionado?.id,
      tipo: tipoEntrega,
      mesa: tipoEntrega === 'mesa' ? mesa : undefined,
      itens: itensPedido,
      observacoes,
      taxaEntrega: tipoEntrega === 'delivery' ? taxaEntrega : 0,
    };

    criarPedidoMutation.mutate(pedido);
  };

  const handleNovoCliente = () => {
    if (!novoCliente.nome || !novoCliente.telefone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    criarClienteMutation.mutate(novoCliente);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
    cliente.telefone.includes(searchCliente)
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/empresa/pedidos')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Pedido</h1>
              <p className="text-gray-600">Criar um novo pedido para cliente</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cardápio */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cardápio</CardTitle>
                <CardDescription>Selecione os itens do pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardapio.filter(item => item.disponivel).map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.nome}</h3>
                          <p className="text-sm text-gray-600">{item.categoria}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{formatCurrency(item.preco)}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => adicionarItem(item)}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            {/* Tipo de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={tipoEntrega} onValueChange={(value: any) => setTipoEntrega(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="balcao">Balcão</SelectItem>
                    <SelectItem value="mesa">Mesa</SelectItem>
                  </SelectContent>
                </Select>

                {tipoEntrega === 'mesa' && (
                  <div className="mt-4">
                    <Label htmlFor="mesa">Número da Mesa</Label>
                    <Input
                      id="mesa"
                      value={mesa}
                      onChange={(e) => setMesa(e.target.value)}
                      placeholder="Ex: 5"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cliente */}
            {tipoEntrega === 'delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  {!mostrarNovoCliente ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchCliente}
                        onChange={(e) => setSearchCliente(e.target.value)}
                      />
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {clientesFiltrados.map((cliente) => (
                          <div 
                            key={cliente.id}
                            className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                              clienteSelecionado?.id === cliente.id ? 'bg-orange-50 border-orange-300' : ''
                            }`}
                            onClick={() => setClienteSelecionado(cliente)}
                          >
                            <div className="font-medium">{cliente.nome}</div>
                            <div className="text-sm text-gray-600">{cliente.telefone}</div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setMostrarNovoCliente(true)}
                        className="w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Novo Cliente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeCliente">Nome</Label>
                        <Input
                          id="nomeCliente"
                          value={novoCliente.nome}
                          onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefoneCliente">Telefone</Label>
                        <Input
                          id="telefoneCliente"
                          value={novoCliente.telefone}
                          onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="enderecoCliente">Endereço</Label>
                        <Input
                          id="enderecoCliente"
                          value={novoCliente.endereco}
                          onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleNovoCliente}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Criar Cliente
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setMostrarNovoCliente(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Itens do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itensPedido.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum item adicionado</p>
                  ) : (
                    itensPedido.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(item.preco)} cada</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantidade}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calcularSubtotal())}</span>
                  </div>
                  {tipoEntrega === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span>{formatCurrency(taxaEntrega)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calcularTotal())}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                  disabled={criarPedidoMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}