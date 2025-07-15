import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/layout";
import { 
  Tags,
  Plus,
  Edit,
  Trash2,
  Search,
  Package
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  itensCount: number;
  ativo: boolean;
  createdAt: string;
}

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    descricao: '',
    cor: '#ea580c'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery<Categoria[]>({
    queryKey: ['/api/categorias'],
  });

  const criarCategoriaMutation = useMutation({
    mutationFn: async (categoria: any) => {
      return apiRequest('POST', '/api/categorias', categoria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categorias'] });
      setIsDialogOpen(false);
      setNovaCategoria({ nome: '', descricao: '', cor: '#ea580c' });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
    },
  });

  const editarCategoriaMutation = useMutation({
    mutationFn: async ({ id, ...categoria }: any) => {
      return apiRequest('PUT', `/api/categorias/${id}`, categoria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categorias'] });
      setEditingCategoria(null);
      setIsDialogOpen(false);
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
    },
  });

  const deletarCategoriaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categorias'] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
  });

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (editingCategoria) {
      editarCategoriaMutation.mutate({
        id: editingCategoria.id,
        ...novaCategoria
      });
    } else {
      criarCategoriaMutation.mutate(novaCategoria);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      descricao: categoria.descricao,
      cor: categoria.cor
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deletarCategoriaMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorias</h1>
          <p className="text-gray-600">Organize seu cardápio em categorias</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tags className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {categorias.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Categorias</p>
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
                    {categorias.filter(c => c.ativo).length}
                  </p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {categorias.reduce((sum, c) => sum + c.itensCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Itens Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Categorias</CardTitle>
                <CardDescription>Gerencie as categorias do seu cardápio</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setEditingCategoria(null);
                      setNovaCategoria({ nome: '', descricao: '', cor: '#ea580c' });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome da Categoria</Label>
                      <Input
                        id="nome"
                        value={novaCategoria.nome}
                        onChange={(e) => setNovaCategoria({...novaCategoria, nome: e.target.value})}
                        placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={novaCategoria.descricao}
                        onChange={(e) => setNovaCategoria({...novaCategoria, descricao: e.target.value})}
                        placeholder="Descrição da categoria..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="cor">Cor da Categoria</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cor"
                          type="color"
                          value={novaCategoria.cor}
                          onChange={(e) => setNovaCategoria({...novaCategoria, cor: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={novaCategoria.cor}
                          onChange={(e) => setNovaCategoria({...novaCategoria, cor: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={criarCategoriaMutation.isPending || editarCategoriaMutation.isPending}
                    >
                      {editingCategoria ? 'Atualizar' : 'Criar'} Categoria
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-2">Carregando categorias...</span>
                  </div>
                </div>
              ) : filteredCategorias.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              ) : (
                filteredCategorias.map((categoria) => (
                  <Card key={categoria.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(categoria.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{categoria.descricao}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {categoria.itensCount} itens
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          categoria.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.ativo ? 'Ativo' : 'Inativo'}
                        </span>
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