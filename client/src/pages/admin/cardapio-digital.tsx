import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin/layout";
import { 
  QrCode,
  Download,
  Eye,
  Settings,
  Palette,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConfigCardapio {
  id: number;
  nomeRestaurante: string;
  logo?: string;
  corPrimaria: string;
  corSecundaria: string;
  urlCardapio: string;
  qrCodeUrl: string;
  ativo: boolean;
}

export default function CardapioDigitalPage() {
  const [config, setConfig] = useState<ConfigCardapio>({
    id: 1,
    nomeRestaurante: "Meu Restaurante",
    corPrimaria: "#ea580c",
    corSecundaria: "#dc2626",
    urlCardapio: "https://menu.exemplo.com/restaurante123",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://menu.exemplo.com/restaurante123",
    ativo: true
  });
  
  const { toast } = useToast();

  const { data: cardapio = [] } = useQuery({
    queryKey: ['/api/cardapio'],
  });

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.urlCardapio);
    toast({
      title: "URL copiada",
      description: "A URL do cardápio foi copiada para a área de transferência.",
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = config.qrCodeUrl;
    link.download = `qr-code-${config.nomeRestaurante}.png`;
    link.click();
  };

  const handleSaveConfig = () => {
    // Implementar salvamento da configuração
    toast({
      title: "Configuração salva",
      description: "As configurações do cardápio digital foram atualizadas.",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio Digital</h1>
          <p className="text-gray-600">Configure seu cardápio digital e QR Code</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code
              </CardTitle>
              <CardDescription>
                Seus clientes podem escanear este código para acessar o cardápio
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                  <img 
                    src={config.qrCodeUrl} 
                    alt="QR Code do Cardápio" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={handleDownloadQR}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar QR Code
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(config.urlCardapio, '_blank')}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700">URL do Cardápio</Label>
                  <div className="flex items-center mt-2 gap-2">
                    <Input 
                      value={config.urlCardapio} 
                      readOnly 
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCopyUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(config.urlCardapio, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações
              </CardTitle>
              <CardDescription>
                Personalize a aparência do seu cardápio digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="nomeRestaurante">Nome do Restaurante</Label>
                <Input
                  id="nomeRestaurante"
                  value={config.nomeRestaurante}
                  onChange={(e) => setConfig({...config, nomeRestaurante: e.target.value})}
                  placeholder="Digite o nome do seu restaurante"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corPrimaria">Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corPrimaria"
                      type="color"
                      value={config.corPrimaria}
                      onChange={(e) => setConfig({...config, corPrimaria: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.corPrimaria}
                      onChange={(e) => setConfig({...config, corPrimaria: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="corSecundaria">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corSecundaria"
                      type="color"
                      value={config.corSecundaria}
                      onChange={(e) => setConfig({...config, corSecundaria: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.corSecundaria}
                      onChange={(e) => setConfig({...config, corSecundaria: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Logo do Restaurante</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {config.logo ? (
                      <img src={config.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Palette className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline">
                    Fazer Upload
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Status do Cardápio</Label>
                  <p className="text-sm text-gray-600">
                    {config.ativo ? 'Cardápio ativo e acessível' : 'Cardápio inativo'}
                  </p>
                </div>
                <Button 
                  variant={config.ativo ? "default" : "outline"}
                  onClick={() => setConfig({...config, ativo: !config.ativo})}
                >
                  {config.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>

              <Button 
                onClick={handleSaveConfig}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Prévia do Cardápio
            </CardTitle>
            <CardDescription>
              Veja como seus clientes irão visualizar o cardápio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header do cardápio */}
                <div 
                  className="p-6 text-white text-center"
                  style={{ backgroundColor: config.corPrimaria }}
                >
                  <h2 className="text-2xl font-bold">{config.nomeRestaurante}</h2>
                  <p className="text-sm opacity-90">Cardápio Digital</p>
                </div>

                {/* Itens do cardápio */}
                <div className="p-4 space-y-4">
                  {cardapio.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.nome}</h3>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: config.corSecundaria }}>
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {cardapio.length > 3 && (
                    <div className="text-center py-4 text-gray-500">
                      ... e mais {cardapio.length - 3} itens
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600">
                    Faça seu pedido pelo WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}