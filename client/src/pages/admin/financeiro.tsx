import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/layout";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Calendar,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  origem: 'pedido' | 'manual';
  pedidoId?: number;
}

interface ResumoFinanceiro {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  pedidosConfirmados: number;
  pedidosPendentes: number;
  valorPendente: number;
}

export default function FinanceiroPage() {
  const [selectedPeriodo, setSelectedPeriodo] = useState("mes");
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resumo } = useQuery<ResumoFinanceiro>({
    queryKey: ['/api/financeiro/resumo'],
  });

  const { data: transacoes = [] } = useQuery<Transacao[]>({
    queryKey: ['/api/financeiro/transacoes'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addTransacaoMutation = useMutation({
    mutationFn: async (transacao: any) => {
      return apiRequest('POST', '/api/financeiro/transacoes', transacao);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financeiro/transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financeiro/resumo'] });
      setNovaTransacao({
        tipo: 'receita',
        descricao: '',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Transação adicionada",
        description: "A transação foi adicionada com sucesso.",
      });
    },
  });

  const handleAddTransacao = () => {
    if (!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    addTransacaoMutation.mutate({
      ...novaTransacao,
      valor: parseFloat(novaTransacao.valor),
      origem: 'manual'
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
          <p className="text-gray-600">Controle suas receitas, despesas e fluxo de caixa</p>
        </div>

        {/* Resumo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(resumo?.receitaTotal || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Receita Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(resumo?.despesaTotal || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Despesa Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(resumo?.lucroLiquido || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Lucro Líquido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(resumo?.valorPendente || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos Confirmados</TabsTrigger>
            <TabsTrigger value="nova">Nova Transação</TabsTrigger>
          </TabsList>

          <TabsContent value="transacoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Todas as receitas e despesas do período</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Semana</SelectItem>
                        <SelectItem value="mes">Mês</SelectItem>
                        <SelectItem value="ano">Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Data</th>
                        <th className="text-left py-2 px-4">Descrição</th>
                        <th className="text-left py-2 px-4">Tipo</th>
                        <th className="text-left py-2 px-4">Categoria</th>
                        <th className="text-left py-2 px-4">Valor</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoes.map((transacao) => (
                        <tr key={transacao.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(transacao.data)}</td>
                          <td className="py-3 px-4">{transacao.descricao}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              transacao.tipo === 'receita' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }>
                              {transacao.tipo}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{transacao.categoria}</td>
                          <td className="py-3 px-4 font-medium">
                            <span className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                              {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(transacao.status)}>
                              {transacao.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {transacao.origem === 'pedido' ? (
                                <Receipt className="w-4 h-4 mr-1" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-1" />
                              )}
                              {transacao.origem}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Confirmados</CardTitle>
                <CardDescription>Pedidos que foram confirmados e liberados para o financeiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Pedidos confirmados aparecerão aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nova">
            <Card>
              <CardHeader>
                <CardTitle>Nova Transação Manual</CardTitle>
                <CardDescription>Adicione receitas ou despesas manualmente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tipo">Tipo de Transação</Label>
                    <Select 
                      value={novaTransacao.tipo} 
                      onValueChange={(value: 'receita' | 'despesa') => 
                        setNovaTransacao({...novaTransacao, tipo: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={novaTransacao.valor}
                      onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      placeholder="Descreva a transação..."
                      value={novaTransacao.descricao}
                      onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={novaTransacao.categoria} 
                      onValueChange={(value) => setNovaTransacao({...novaTransacao, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {novaTransacao.tipo === 'receita' ? (
                          <>
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="ingredientes">Ingredientes</SelectItem>
                            <SelectItem value="funcionarios">Funcionários</SelectItem>
                            <SelectItem value="aluguel">Aluguel</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novaTransacao.data}
                      onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddTransacao}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={addTransacaoMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}