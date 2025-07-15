import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/layout";
import { 
  Settings,
  User,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: 'garcom' | 'cozinheiro' | 'gerente' | 'admin';
  status: 'ativo' | 'inativo';
  ultimoLogin: string;
  createdAt: string;
}

interface ConfigEmpresa {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  horarioFuncionamento: {
    abertura: string;
    fechamento: string;
  };
  configuracoes: {
    aceitaPedidosOnline: boolean;
    tempoMinimoEntrega: number;
    taxaEntregaMinima: number;
    pedidoMinimoEntrega: number;
  };
}

export default function ConfiguracoesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    email: '',
    cargo: 'garcom' as 'garcom' | 'cozinheiro' | 'gerente' | 'admin',
    senha: '',
    confirmarSenha: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [configEmpresa, setConfigEmpresa] = useState<ConfigEmpresa>({
    id: 1,
    nome: 'Meu Restaurante',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 99999-9999',
    email: 'contato@meurestaurante.com',
    endereco: 'Rua dos Sabores, 123 - Centro',
    horarioFuncionamento: {
      abertura: '11:00',
      fechamento: '23:00'
    },
    configuracoes: {
      aceitaPedidosOnline: true,
      tempoMinimoEntrega: 30,
      taxaEntregaMinima: 5.00,
      pedidoMinimoEntrega: 20.00
    }
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: funcionarios = [], isLoading } = useQuery<Funcionario[]>({
    queryKey: ['/api/funcionarios'],
  });

  const criarFuncionarioMutation = useMutation({
    mutationFn: async (funcionario: any) => {
      return apiRequest('POST', '/api/funcionarios', funcionario);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funcionarios'] });
      setIsDialogOpen(false);
      setNovoFuncionario({
        nome: '',
        email: '',
        cargo: 'garcom',
        senha: '',
        confirmarSenha: ''
      });
      toast({
        title: "Funcionário criado",
        description: "O funcionário foi criado com sucesso.",
      });
    },
  });

  const editarFuncionarioMutation = useMutation({
    mutationFn: async ({ id, ...funcionario }: any) => {
      return apiRequest('PUT', `/api/funcionarios/${id}`, funcionario);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funcionarios'] });
      setEditingFuncionario(null);
      setIsDialogOpen(false);
      toast({
        title: "Funcionário atualizado",
        description: "O funcionário foi atualizado com sucesso.",
      });
    },
  });

  const deletarFuncionarioMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/funcionarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funcionarios'] });
      toast({
        title: "Funcionário removido",
        description: "O funcionário foi removido com sucesso.",
      });
    },
  });

  const salvarConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest('PUT', '/api/empresa/configuracoes', config);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso.",
      });
    },
  });

  const handleSubmitFuncionario = () => {
    if (novoFuncionario.senha !== novoFuncionario.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (editingFuncionario) {
      editarFuncionarioMutation.mutate({
        id: editingFuncionario.id,
        nome: novoFuncionario.nome,
        email: novoFuncionario.email,
        cargo: novoFuncionario.cargo,
        ...(novoFuncionario.senha && { senha: novoFuncionario.senha })
      });
    } else {
      criarFuncionarioMutation.mutate(novoFuncionario);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setNovoFuncionario({
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      senha: '',
      confirmarSenha: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      deletarFuncionarioMutation.mutate(id);
    }
  };

  const toggleStatus = (funcionario: Funcionario) => {
    editarFuncionarioMutation.mutate({
      id: funcionario.id,
      ...funcionario,
      status: funcionario.status === 'ativo' ? 'inativo' : 'ativo'
    });
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'gerente': return 'bg-blue-100 text-blue-800';
      case 'cozinheiro': return 'bg-orange-100 text-orange-800';
      case 'garcom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações da sua empresa e funcionários</p>
        </div>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="operacao">Operação</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>Configure os dados básicos da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={configEmpresa.nome}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, nome: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={configEmpresa.cnpj}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, cnpj: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={configEmpresa.telefone}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, telefone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={configEmpresa.email}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={configEmpresa.endereco}
                    onChange={(e) => setConfigEmpresa({...configEmpresa, endereco: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="abertura">Horário de Abertura</Label>
                    <Input
                      id="abertura"
                      type="time"
                      value={configEmpresa.horarioFuncionamento.abertura}
                      onChange={(e) => setConfigEmpresa({
                        ...configEmpresa,
                        horarioFuncionamento: {
                          ...configEmpresa.horarioFuncionamento,
                          abertura: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechamento">Horário de Fechamento</Label>
                    <Input
                      id="fechamento"
                      type="time"
                      value={configEmpresa.horarioFuncionamento.fechamento}
                      onChange={(e) => setConfigEmpresa({
                        ...configEmpresa,
                        horarioFuncionamento: {
                          ...configEmpresa.horarioFuncionamento,
                          fechamento: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => salvarConfigMutation.mutate(configEmpresa)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Salvar Configurações da Empresa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funcionarios">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Funcionários
                    </CardTitle>
                    <CardDescription>Gerencie os usuários que têm acesso ao sistema</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          setEditingFuncionario(null);
                          setNovoFuncionario({
                            nome: '',
                            email: '',
                            cargo: 'garcom',
                            senha: '',
                            confirmarSenha: ''
                          });
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Funcionário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome Completo</Label>
                          <Input
                            id="nome"
                            value={novoFuncionario.nome}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={novoFuncionario.email}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cargo">Cargo</Label>
                          <Select 
                            value={novoFuncionario.cargo} 
                            onValueChange={(value: any) => setNovoFuncionario({...novoFuncionario, cargo: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="garcom">Garçom</SelectItem>
                              <SelectItem value="cozinheiro">Cozinheiro</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="senha">Senha</Label>
                          <div className="relative">
                            <Input
                              id="senha"
                              type={mostrarSenha ? "text" : "password"}
                              value={novoFuncionario.senha}
                              onChange={(e) => setNovoFuncionario({...novoFuncionario, senha: e.target.value})}
                              placeholder={editingFuncionario ? "Deixe em branco para manter" : ""}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                            >
                              {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                          <Input
                            id="confirmarSenha"
                            type={mostrarSenha ? "text" : "password"}
                            value={novoFuncionario.confirmarSenha}
                            onChange={(e) => setNovoFuncionario({...novoFuncionario, confirmarSenha: e.target.value})}
                          />
                        </div>
                        <Button 
                          onClick={handleSubmitFuncionario}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          disabled={criarFuncionarioMutation.isPending || editarFuncionarioMutation.isPending}
                        >
                          {editingFuncionario ? 'Atualizar' : 'Criar'} Funcionário
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Nome</th>
                        <th className="text-left py-2 px-4">E-mail</th>
                        <th className="text-left py-2 px-4">Cargo</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Último Login</th>
                        <th className="text-left py-2 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                          </td>
                        </tr>
                      ) : funcionarios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Nenhum funcionário cadastrado
                          </td>
                        </tr>
                      ) : (
                        funcionarios.map((funcionario) => (
                          <tr key={funcionario.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{funcionario.nome}</td>
                            <td className="py-3 px-4">{funcionario.email}</td>
                            <td className="py-3 px-4">
                              <Badge className={getCargoColor(funcionario.cargo)}>
                                {funcionario.cargo}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(funcionario.status)}>
                                {funcionario.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {funcionario.ultimoLogin 
                                ? new Date(funcionario.ultimoLogin).toLocaleDateString('pt-BR')
                                : 'Nunca'
                              }
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleStatus(funcionario)}
                                >
                                  {funcionario.status === 'ativo' ? 'Desativar' : 'Ativar'}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(funcionario)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(funcionario.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="operacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurações de Operação
                </CardTitle>
                <CardDescription>Configure como sua empresa opera</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Aceitar Pedidos Online</Label>
                    <p className="text-sm text-gray-600">Permitir que clientes façam pedidos pelo sistema</p>
                  </div>
                  <Button 
                    variant={configEmpresa.configuracoes.aceitaPedidosOnline ? "default" : "outline"}
                    onClick={() => setConfigEmpresa({
                      ...configEmpresa,
                      configuracoes: {
                        ...configEmpresa.configuracoes,
                        aceitaPedidosOnline: !configEmpresa.configuracoes.aceitaPedidosOnline
                      }
                    })}
                  >
                    {configEmpresa.configuracoes.aceitaPedidosOnline ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tempoMinimo">Tempo Mínimo de Entrega (min)</Label>
                    <Input
                      id="tempoMinimo"
                      type="number"
                      value={configEmpresa.configuracoes.tempoMinimoEntrega}
                      onChange={(e) => setConfigEmpresa({
                        ...configEmpresa,
                        configuracoes: {
                          ...configEmpresa.configuracoes,
                          tempoMinimoEntrega: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxaMinima">Taxa de Entrega Mínima</Label>
                    <Input
                      id="taxaMinima"
                      type="number"
                      step="0.01"
                      value={configEmpresa.configuracoes.taxaEntregaMinima}
                      onChange={(e) => setConfigEmpresa({
                        ...configEmpresa,
                        configuracoes: {
                          ...configEmpresa.configuracoes,
                          taxaEntregaMinima: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pedidoMinimo">Pedido Mínimo para Entrega</Label>
                    <Input
                      id="pedidoMinimo"
                      type="number"
                      step="0.01"
                      value={configEmpresa.configuracoes.pedidoMinimoEntrega}
                      onChange={(e) => setConfigEmpresa({
                        ...configEmpresa,
                        configuracoes: {
                          ...configEmpresa.configuracoes,
                          pedidoMinimoEntrega: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => salvarConfigMutation.mutate(configEmpresa)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Salvar Configurações de Operação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}