import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/layout";
import { 
  MessageSquare,
  Settings,
  Send,
  QrCode,
  CheckCircle,
  XCircle,
  Phone,
  Bot,
  Users,
  MessageCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConfig {
  id: number;
  instanceName: string;
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  phoneNumber?: string;
  autoReply: boolean;
  welcomeMessage: string;
  menuMessage: string;
}

interface Conversa {
  id: number;
  contato: string;
  ultimaMensagem: string;
  dataUltimaMensagem: string;
  naoLidas: number;
  status: 'ativo' | 'arquivado';
}

export default function WhatsAppPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    id: 1,
    instanceName: 'restaurante-instance',
    apiKey: '',
    baseUrl: 'https://evolution-api.com',
    webhookUrl: 'https://seu-webhook.com/whatsapp',
    status: 'disconnected',
    autoReply: true,
    welcomeMessage: 'Olá! Bem-vindo ao nosso restaurante. Como posso ajudá-lo?',
    menuMessage: 'Aqui está nosso cardápio digital: [LINK_CARDAPIO]'
  });

  const [novaMensagem, setNovaMensagem] = useState('');
  const [contatoSelecionado, setContatoSelecionado] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversas = [] } = useQuery<Conversa[]>({
    queryKey: ['/api/whatsapp/conversas'],
  });

  const conectarWhatsAppMutation = useMutation({
    mutationFn: async (configData: any) => {
      return apiRequest('POST', '/api/whatsapp/connect', configData);
    },
    onSuccess: (data) => {
      setConfig(prev => ({ ...prev, status: 'connecting', qrCode: data.qrCode }));
      toast({
        title: "Conectando WhatsApp",
        description: "Escaneie o QR Code para conectar sua conta.",
      });
    },
  });

  const desconectarWhatsAppMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/whatsapp/disconnect');
    },
    onSuccess: () => {
      setConfig(prev => ({ ...prev, status: 'disconnected', qrCode: undefined }));
      toast({
        title: "WhatsApp desconectado",
        description: "Sua conta foi desconectada com sucesso.",
      });
    },
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: async (mensagem: { contato: string; texto: string }) => {
      return apiRequest('POST', '/api/whatsapp/send', mensagem);
    },
    onSuccess: () => {
      setNovaMensagem('');
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    },
  });

  const handleConnect = () => {
    if (!config.apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, configure sua API Key do Evolution API.",
        variant: "destructive",
      });
      return;
    }
    conectarWhatsAppMutation.mutate(config);
  };

  const handleSendMessage = () => {
    if (!novaMensagem.trim() || !contatoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um contato e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }
    
    enviarMensagemMutation.mutate({
      contato: contatoSelecionado,
      texto: novaMensagem
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Integration</h1>
          <p className="text-gray-600">Integre seu restaurante com WhatsApp usando Evolution API</p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(config.status)}>
                  {config.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {config.status === 'connecting' && <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-1" />}
                  {config.status === 'disconnected' && <XCircle className="w-3 h-3 mr-1" />}
                  {config.status === 'connected' ? 'Conectado' : config.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                </Badge>
                {config.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-1" />
                    {config.phoneNumber}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {config.status === 'disconnected' && (
                  <Button 
                    onClick={handleConnect}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={conectarWhatsAppMutation.isPending}
                  >
                    Conectar WhatsApp
                  </Button>
                )}
                {config.status === 'connected' && (
                  <Button 
                    onClick={() => desconectarWhatsAppMutation.mutate()}
                    variant="destructive"
                    disabled={desconectarWhatsAppMutation.isPending}
                  >
                    Desconectar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="configuracao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="automacao">Automação</TabsTrigger>
          </TabsList>

          <TabsContent value="configuracao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuração da API
                </CardTitle>
                <CardDescription>Configure sua instância do Evolution API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="instanceName">Nome da Instância</Label>
                  <Input
                    id="instanceName"
                    value={config.instanceName}
                    onChange={(e) => setConfig({...config, instanceName: e.target.value})}
                    placeholder="restaurante-instance"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key do Evolution API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                    placeholder="Sua API Key aqui..."
                  />
                </div>

                <div>
                  <Label htmlFor="baseUrl">URL Base da API</Label>
                  <Input
                    id="baseUrl"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                    placeholder="https://evolution-api.com"
                  />
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
                    placeholder="https://seu-webhook.com/whatsapp"
                  />
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Salvar Configuração
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code para Conexão
                </CardTitle>
                <CardDescription>Escaneie o QR Code com seu WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {config.qrCode ? (
                  <div className="space-y-4">
                    <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                      <img 
                        src={config.qrCode} 
                        alt="QR Code WhatsApp" 
                        className="w-64 h-64"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Abra o WhatsApp no seu celular e escaneie o código
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-gray-500">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Conecte sua conta WhatsApp para gerar o QR Code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mensagens">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Conversas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Conversas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversas.map((conversa) => (
                      <div 
                        key={conversa.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          contatoSelecionado === conversa.contato
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setContatoSelecionado(conversa.contato)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{conversa.contato}</div>
                            <div className="text-sm text-gray-600 truncate">
                              {conversa.ultimaMensagem}
                            </div>
                          </div>
                          {conversa.naoLidas > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {conversa.naoLidas}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Área de Mensagens */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {contatoSelecionado ? `Conversa com ${contatoSelecionado}` : 'Selecione uma conversa'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contatoSelecionado ? (
                    <div className="space-y-4">
                      {/* Área de mensagens */}
                      <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                        <div className="text-center text-gray-500">
                          Histórico de mensagens aparecerá aqui
                        </div>
                      </div>

                      {/* Input de nova mensagem */}
                      <div className="flex space-x-2">
                        <Textarea
                          value={novaMensagem}
                          onChange={(e) => setNovaMensagem(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1"
                          rows={3}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={enviarMensagemMutation.isPending}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Selecione uma conversa para começar a enviar mensagens</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Mensagens Automáticas
                </CardTitle>
                <CardDescription>Configure respostas automáticas para seus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Resposta Automática</Label>
                    <p className="text-sm text-gray-600">Enviar mensagem automática quando cliente entrar em contato</p>
                  </div>
                  <Button 
                    variant={config.autoReply ? "default" : "outline"}
                    onClick={() => setConfig({...config, autoReply: !config.autoReply})}
                  >
                    {config.autoReply ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                    placeholder="Mensagem enviada automaticamente para novos contatos"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="menuMessage">Mensagem do Cardápio</Label>
                  <Textarea
                    id="menuMessage"
                    value={config.menuMessage}
                    onChange={(e) => setConfig({...config, menuMessage: e.target.value})}
                    placeholder="Mensagem com link do cardápio digital"
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Salvar Configurações de Automação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}