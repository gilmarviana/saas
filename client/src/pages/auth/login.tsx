import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { ChefHat, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para home
          </Button>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais para gerenciar seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-4">
                <span>Ainda não tem uma conta? </span>
                <button 
                  onClick={() => navigate("/register")}
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Criar conta
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                <span>Esqueceu sua senha? </span>
                <button className="text-orange-600 hover:text-orange-700 hover:underline">
                  Recuperar senha
                </button>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xs text-gray-600 mb-2">
                <strong>Contas de demonstração:</strong>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Super Admin:</strong> gil.gmviana1@gmail.com</div>
                <div><strong>Empresa:</strong> exemplo@restaurante.com</div>
                <div><strong>Senha:</strong> password123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
