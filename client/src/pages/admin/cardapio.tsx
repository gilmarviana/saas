import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  UtensilsCrossed,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Image,
  ToggleLeft
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
  disponivel: boolean;
  createdAt: string;
}

export default function CardapioPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [selectedItem, setSelectedItem] = useState<ItemCardapio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemCardapio | null>(null);
  const [novoItem, setNovoItem] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    disponivel: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cardapio = [], isLoading } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  const criarItemMutation = useMutation({
    mutationFn: async (item: any) => {
      return apiRequest('POST', '/api/cardapio', item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cardapio'] });
      setIsDialogOpen(false);
      setNovoItem({
        nome: '',
        descricao: '',
        preco: '',
        categoria: '',
        disponivel: true
      });
      toast({
        title: "Item criado",
        description: "O item foi adicionado ao cardápio com sucesso.",
      });
    },
  });

  const editarItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: any) => {
      return apiRequest('PUT', `/api/cardapio/${id}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cardapio'] });
      setEditingItem(null);
      setIsDialogOpen(false);
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso.",
      });
    },
  });

  const deletarItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/cardapio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cardapio'] });
      toast({
        title: "Item removido",
        description: "O item foi removido do cardápio.",
      });
    },
  });

  const handleSubmit = () => {
    if (!novoItem.nome || !novoItem.preco || !novoItem.categoria) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      ...novoItem,
      preco: parseFloat(novoItem.preco)
    };

    if (editingItem) {
      editarItemMutation.mutate({ id: editingItem.id, ...itemData });
    } else {
      criarItemMutation.mutate(itemData);
    }
  };

  const handleEdit = (item: ItemCardapio) => {
    setEditingItem(item);
    setNovoItem({
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco.toString(),
      categoria: item.categoria,
      disponivel: item.disponivel
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover este item do cardápio?')) {
      deletarItemMutation.mutate(id);
    }
  };

  const toggleDisponibilidade = (item: ItemCardapio) => {
    editarItemMutation.mutate({
      id: item.id,
      ...item,
      disponivel: !item.disponivel
    });
  };

  const categorias = Array.from(new Set(cardapio.map(item => item.categoria)));

  const filteredItems = cardapio.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === "todas" || item.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (disponivel: boolean) => {
    return disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio</h1>
          <p className="text-gray-600">Gerencie itens do seu cardápio digital</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UtensilsCrossed className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {cardapio.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Itens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ToggleLeft className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {cardapio.filter(item => item.disponivel).length}
                  </p>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Image className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {cardapio.filter(item => item.imagem).length}
                  </p>
                  <p className="text-sm text-gray-600">Com Imagem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UtensilsCrossed className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {categorias.length}
                  </p>
                  <p className="text-sm text-gray-600">Categorias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cardapio Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Itens do Cardápio</CardTitle>
                <CardDescription>Gerencie os itens disponíveis no seu cardápio</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setEditingItem(null);
                      setNovoItem({
                        nome: '',
                        descricao: '',
                        preco: '',
                        categoria: '',
                        disponivel: true
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome do Item *</Label>
                      <Input
                        id="nome"
                        value={novoItem.nome}
                        onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
                        placeholder="Ex: Pizza Margherita"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={novoItem.descricao}
                        onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                        placeholder="Descrição do item..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preco">Preço *</Label>
                        <Input
                          id="preco"
                          type="number"
                          step="0.01"
                          value={novoItem.preco}
                          onChange={(e) => setNovoItem({...novoItem, preco: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Input
                          id="categoria"
                          value={novoItem.categoria}
                          onChange={(e) => setNovoItem({...novoItem, categoria: e.target.value})}
                          placeholder="Ex: Pizzas"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Disponível</Label>
                      <Button 
                        variant={novoItem.disponivel ? "default" : "outline"}
                        onClick={() => setNovoItem({...novoItem, disponivel: !novoItem.disponivel})}
                      >
                        {novoItem.disponivel ? 'Sim' : 'Não'}
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={criarItemMutation.isPending || editarItemMutation.isPending}
                    >
                      {editingItem ? 'Atualizar' : 'Criar'} Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-2">Carregando cardápio...</span>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum item encontrado
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.nome}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>
                        </div>
                        <Badge className={getStatusColor(item.disponivel)}>
                          {item.disponivel ? 'Disponível' : 'Indisponível'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-orange-600">
                          {formatCurrency(item.preco)}
                        </span>
                        <Badge variant="outline">{item.categoria}</Badge>
                      </div>
                      
                      {item.imagem && (
                        <div className="mb-4">
                          <img 
                            src={item.imagem} 
                            alt={item.nome}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}