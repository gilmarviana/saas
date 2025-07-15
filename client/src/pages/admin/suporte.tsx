import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/layout";
import { 
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Send
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  categoria: 'tecnico' | 'comercial' | 'financeiro' | 'outros';
  createdAt: string;
  updatedAt: string;
  resposta?: string;
  funcionarioId: number;
}

export default function SuportePage() {
  const [novoTicket, setNovoTicket] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
    categoria: 'tecnico' as 'tecnico' | 'comercial' | 'financeiro' | 'outros'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  const criarTicketMutation = useMutation({
    mutationFn: async (ticket: any) => {
      return apiRequest('POST', '/api/tickets', {
        ...ticket,
        funcionarioId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setNovoTicket({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        categoria: 'tecnico'
      });
      toast({
        title: "Ticket criado",
        description: "Seu ticket foi enviado para o suporte.",
      });
    },
  });

  const handleSubmit = () => {
    if (!novoTicket.titulo || !novoTicket.descricao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    criarTicketMutation.mutate(novoTicket);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-gray-100 text-gray-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberto': return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento': return <Clock className="w-4 h-4" />;
      case 'resolvido': return <CheckCircle className="w-4 h-4" />;
      case 'fechado': return <XCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
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

  const ticketsStats = {
    abertos: tickets.filter(t => t.status === 'aberto').length,
    emAndamento: tickets.filter(t => t.status === 'em_andamento').length,
    resolvidos: tickets.filter(t => t.status === 'resolvido').length,
    total: tickets.length
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suporte</h1>
          <p className="text-gray-600">Central de atendimento e suporte técnico</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {ticketsStats.abertos}
                  </p>
                  <p className="text-sm text-gray-600">Abertos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {ticketsStats.emAndamento}
                  </p>
                  <p className="text-sm text-gray-600">Em Andamento</p>
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
                    {ticketsStats.resolvidos}
                  </p>
                  <p className="text-sm text-gray-600">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {ticketsStats.total}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
            <TabsTrigger value="novo">Novo Ticket</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Histórico de Tickets
                </CardTitle>
                <CardDescription>Acompanhe o status dos seus tickets de suporte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                      <span className="mt-2 text-gray-600">Carregando tickets...</span>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum ticket encontrado</p>
                      <p className="text-sm">Crie seu primeiro ticket de suporte</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{ticket.titulo}</CardTitle>
                              <CardDescription className="mt-1">
                                Criado em {formatDate(ticket.createdAt)}
                                {ticket.updatedAt !== ticket.createdAt && (
                                  <span> • Atualizado em {formatDate(ticket.updatedAt)}</span>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPrioridadeColor(ticket.prioridade)}>
                                {ticket.prioridade}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {getStatusIcon(ticket.status)}
                                <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-3">{ticket.descricao}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{ticket.categoria}</Badge>
                            <span className="text-sm text-gray-500">
                              Ticket #{ticket.id}
                            </span>
                          </div>
                          {ticket.resposta && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-800 mb-1">Resposta do Suporte:</p>
                              <p className="text-sm text-green-700">{ticket.resposta}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="novo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Ticket de Suporte
                </CardTitle>
                <CardDescription>Descreva seu problema ou dúvida para nosso suporte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="titulo">Título do Ticket *</Label>
                  <Input
                    id="titulo"
                    value={novoTicket.titulo}
                    onChange={(e) => setNovoTicket({...novoTicket, titulo: e.target.value})}
                    placeholder="Resumo do problema ou dúvida"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={novoTicket.categoria} 
                      onValueChange={(value: any) => setNovoTicket({...novoTicket, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select 
                      value={novoTicket.prioridade} 
                      onValueChange={(value: any) => setNovoTicket({...novoTicket, prioridade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição Detalhada *</Label>
                  <Textarea
                    id="descricao"
                    value={novoTicket.descricao}
                    onChange={(e) => setNovoTicket({...novoTicket, descricao: e.target.value})}
                    placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir se aplicável..."
                    rows={6}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Dicas para um bom ticket:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Seja específico sobre o problema</li>
                    <li>• Inclua mensagens de erro se houver</li>
                    <li>• Informe em que tela/página o problema ocorre</li>
                    <li>• Descreva os passos para reproduzir o problema</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={criarTicketMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}