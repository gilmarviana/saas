import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  ShoppingCart, 
  Smartphone, 
  BarChart3, 
  QrCode, 
  MapPin, 
  MessageSquare,
  Star,
  ArrowRight,
  Zap,
  LogIn
} from "lucide-react";

const plans = [
  {
    id: 1,
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para testar o sistema",
    features: [
      "10 pedidos por mês",
      "Cardápio digital",
      "QR Code personalizado",
      "Suporte por email"
    ],
    limitations: [
      "Sem painel financeiro",
      "Sem integração WhatsApp"
    ],
    highlight: false,
    trialText: "Teste grátis por 30 dias"
  },
  {
    id: 2,
    name: "Padrão",
    price: "R$ 30",
    period: "/mês",
    description: "Ideal para pequenos negócios",
    features: [
      "100 pedidos por mês",
      "Cardápio digital completo",
      "QR Code personalizado",
      "Painel financeiro",
      "Relatórios de vendas",
      "Suporte prioritário"
    ],
    limitations: [
      "Sem integração WhatsApp automática"
    ],
    highlight: true,
    trialText: "30 dias grátis"
  },
  {
    id: 3,
    name: "Premium",
    price: "R$ 50",
    period: "/mês",
    description: "Para restaurantes em crescimento",
    features: [
      "300 pedidos por mês",
      "Cardápio digital completo",
      "QR Code personalizado",
      "Painel financeiro avançado",
      "Relatórios detalhados",
      "Integração WhatsApp",
      "Áreas de delivery",
      "Suporte VIP"
    ],
    limitations: [],
    highlight: false,
    trialText: "30 dias grátis"
  }
];

export default function RestaurantLanding() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">SaaS MicroSistema</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme seu restaurante em um 
              <span className="text-yellow-300"> delivery digital</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Sistema completo para pedidos online com cardápio digital, QR Code e integração WhatsApp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                <Zap className="w-5 h-5 mr-2" />
                Começar Grátis
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-gray-600">
              Sistema completo para gerenciar pedidos, cardápio e clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
                title: "Pedidos Online",
                description: "Receba pedidos diretamente pelo WhatsApp com carrinho de compras integrado"
              },
              {
                icon: <QrCode className="w-8 h-8 text-orange-600" />,
                title: "QR Code Digital",
                description: "Cardápio digital acessível por QR Code para mesas e delivery"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
                title: "Painel Financeiro",
                description: "Acompanhe vendas, relatórios e performance em tempo real"
              },
              {
                icon: <MapPin className="w-8 h-8 text-orange-600" />,
                title: "Áreas de Delivery",
                description: "Configure zonas de entrega com taxas personalizadas"
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-orange-600" />,
                title: "WhatsApp Integrado",
                description: "Integração automática com WhatsApp para confirmação de pedidos"
              },
              {
                icon: <Smartphone className="w-8 h-8 text-orange-600" />,
                title: "100% Mobile",
                description: "Funciona perfeitamente em celulares, tablets e computadores"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos que crescem com seu negócio
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para o seu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.highlight ? 'border-orange-500 scale-105' : 'border-gray-200'} cursor-pointer transition-all hover:shadow-lg`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-orange-600 font-medium">{plan.trialText}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center text-gray-400">
                        <span className="w-5 h-5 mr-3">×</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Implementar lógica de seleção do plano
                    }}
                  >
                    Começar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para modernizar seu restaurante?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Junte-se a centenas de restaurantes que já aumentaram suas vendas conosco
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="restaurant-name" className="text-white">Nome do Restaurante</Label>
                <Input id="restaurant-name" placeholder="Ex: Pizzaria do João" className="bg-white/20 border-white/30 text-white placeholder-white/70" />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" className="bg-white/20 border-white/30 text-white placeholder-white/70" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white">WhatsApp</Label>
                <Input id="phone" type="tel" placeholder="(11) 99999-9999" className="bg-white/20 border-white/30 text-white placeholder-white/70" />
              </div>
              <Button size="lg" className="w-full bg-white text-orange-600 hover:bg-orange-50">
                Começar Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SaaS MicroSistema</h3>
              <p className="text-gray-400">
                Plataforma completa para restaurantes e delivery
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Recursos</li>
                <li>Preços</li>
                <li>Integrações</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Status</li>
                <li>Comunidade</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SaaS MicroSistema. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}