import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/layout";
import { 
  MapPin,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Truck,
  Map
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AreaEntrega {
  id: number;
  nome: string;
  bairros: string[];
  raioKm: number;
  taxaEntrega: number;
  tempoEstimado: number;
  ativo: boolean;
  cor: string;
  coordenadas: {
    centro: { lat: number; lng: number };
    pontos: { lat: number; lng: number }[];
  };
}

export default function AreasEntregaPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaEntrega | null>(null);
  const [novaArea, setNovaArea] = useState({
    nome: '',
    bairros: '',
    raioKm: '',
    taxaEntrega: '',
    tempoEstimado: '',
    cor: '#ea580c'
  });
  const [mapaAtivo, setMapaAtivo] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: areas = [], isLoading } = useQuery<AreaEntrega[]>({
    queryKey: ['/api/areas-entrega'],
  });

  const criarAreaMutation = useMutation({
    mutationFn: async (area: any) => {
      return apiRequest('POST', '/api/areas-entrega', area);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas-entrega'] });
      setIsDialogOpen(false);
      setNovaArea({
        nome: '',
        bairros: '',
        raioKm: '',
        taxaEntrega: '',
        tempoEstimado: '',
        cor: '#ea580c'
      });
      toast({
        title: "Área criada",
        description: "A área de entrega foi criada com sucesso.",
      });
    },
  });

  const editarAreaMutation = useMutation({
    mutationFn: async ({ id, ...area }: any) => {
      return apiRequest('PUT', `/api/areas-entrega/${id}`, area);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas-entrega'] });
      setEditingArea(null);
      setIsDialogOpen(false);
      toast({
        title: "Área atualizada",
        description: "A área de entrega foi atualizada com sucesso.",
      });
    },
  });

  const deletarAreaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/areas-entrega/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas-entrega'] });
      toast({
        title: "Área excluída",
        description: "A área de entrega foi excluída com sucesso.",
      });
    },
  });

  const handleSubmit = () => {
    const areaData = {
      ...novaArea,
      raioKm: parseFloat(novaArea.raioKm),
      taxaEntrega: parseFloat(novaArea.taxaEntrega),
      tempoEstimado: parseInt(novaArea.tempoEstimado),
      bairros: novaArea.bairros.split(',').map(b => b.trim()),
      ativo: true
    };

    if (editingArea) {
      editarAreaMutation.mutate({ id: editingArea.id, ...areaData });
    } else {
      criarAreaMutation.mutate(areaData);
    }
  };

  const handleEdit = (area: AreaEntrega) => {
    setEditingArea(area);
    setNovaArea({
      nome: area.nome,
      bairros: area.bairros.join(', '),
      raioKm: area.raioKm.toString(),
      taxaEntrega: area.taxaEntrega.toString(),
      tempoEstimado: area.tempoEstimado.toString(),
      cor: area.cor
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta área de entrega?')) {
      deletarAreaMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleArea = (area: AreaEntrega) => {
    editarAreaMutation.mutate({
      id: area.id,
      ...area,
      ativo: !area.ativo
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Áreas de Entrega</h1>
          <p className="text-gray-600">Configure as áreas e taxas de entrega do seu restaurante</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {areas.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Áreas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {areas.filter(a => a.ativo).length}
                  </p>
                  <p className="text-sm text-gray-600">Ativas</p>
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
                    {formatCurrency(areas.reduce((sum, a) => sum + a.taxaEntrega, 0) / areas.length || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Taxa Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(areas.reduce((sum, a) => sum + a.tempoEstimado, 0) / areas.length || 0)} min
                  </p>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Map className="w-5 h-5 mr-2" />
                  Mapa das Áreas
                </CardTitle>
                <Button 
                  variant="outline"
                  onClick={() => setMapaAtivo(!mapaAtivo)}
                >
                  {mapaAtivo ? 'Desativar Mapa' : 'Ativar Mapa'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                {mapaAtivo ? (
                  <div className="text-center">
                    <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Mapa interativo das áreas de entrega</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Clique e arraste para definir as áreas de entrega
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Map className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Clique em "Ativar Mapa" para visualizar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Areas List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Áreas Configuradas</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        setEditingArea(null);
                        setNovaArea({
                          nome: '',
                          bairros: '',
                          raioKm: '',
                          taxaEntrega: '',
                          tempoEstimado: '',
                          cor: '#ea580c'
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Área
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingArea ? 'Editar Área' : 'Nova Área de Entrega'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome da Área</Label>
                        <Input
                          id="nome"
                          value={novaArea.nome}
                          onChange={(e) => setNovaArea({...novaArea, nome: e.target.value})}
                          placeholder="Ex: Centro, Zona Sul..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairros">Bairros (separados por vírgula)</Label>
                        <Input
                          id="bairros"
                          value={novaArea.bairros}
                          onChange={(e) => setNovaArea({...novaArea, bairros: e.target.value})}
                          placeholder="Centro, Copacabana, Ipanema..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="raioKm">Raio (km)</Label>
                          <Input
                            id="raioKm"
                            type="number"
                            step="0.1"
                            value={novaArea.raioKm}
                            onChange={(e) => setNovaArea({...novaArea, raioKm: e.target.value})}
                            placeholder="5.0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="taxaEntrega">Taxa de Entrega</Label>
                          <Input
                            id="taxaEntrega"
                            type="number"
                            step="0.01"
                            value={novaArea.taxaEntrega}
                            onChange={(e) => setNovaArea({...novaArea, taxaEntrega: e.target.value})}
                            placeholder="5.00"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tempoEstimado">Tempo Estimado (min)</Label>
                        <Input
                          id="tempoEstimado"
                          type="number"
                          value={novaArea.tempoEstimado}
                          onChange={(e) => setNovaArea({...novaArea, tempoEstimado: e.target.value})}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cor">Cor no Mapa</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="cor"
                            type="color"
                            value={novaArea.cor}
                            onChange={(e) => setNovaArea({...novaArea, cor: e.target.value})}
                            className="w-16 h-10"
                          />
                          <Input
                            value={novaArea.cor}
                            onChange={(e) => setNovaArea({...novaArea, cor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={criarAreaMutation.isPending || editarAreaMutation.isPending}
                      >
                        {editingArea ? 'Atualizar' : 'Criar'} Área
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <span className="mt-2 text-gray-600">Carregando áreas...</span>
                  </div>
                ) : areas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma área configurada</p>
                    <p className="text-sm">Crie sua primeira área de entrega</p>
                  </div>
                ) : (
                  areas.map((area) => (
                    <div key={area.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: area.cor }}
                          />
                          <h3 className="font-medium">{area.nome}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={area.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {area.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleArea(area)}
                          >
                            {area.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(area)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(area.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Bairros:</strong> {area.bairros.join(', ')}</p>
                        <div className="flex items-center justify-between">
                          <span><strong>Raio:</strong> {area.raioKm}km</span>
                          <span><strong>Taxa:</strong> {formatCurrency(area.taxaEntrega)}</span>
                          <span><strong>Tempo:</strong> {area.tempoEstimado}min</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}