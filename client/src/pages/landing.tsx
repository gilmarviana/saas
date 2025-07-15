import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: "fas fa-users-cog",
      title: "Multi-Tenant Management",
      description: "Manage multiple administrators and their clients with complete data isolation"
    },
    {
      icon: "fas fa-chart-line",
      title: "Advanced Analytics",
      description: "Track sales, user engagement, and business metrics across all levels"
    },
    {
      icon: "fas fa-credit-card",
      title: "Integrated Payments",
      description: "Built-in Stripe integration for seamless subscription management"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: 29,
      features: [
        "Up to 5 admins",
        "100 clients per admin",
        "Basic analytics"
      ]
    },
    {
      name: "Professional",
      price: 99,
      features: [
        "Up to 25 admins",
        "Unlimited clients",
        "Advanced analytics",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 299,
      features: [
        "Unlimited admins",
        "Unlimited clients",
        "Custom integrations",
        "White-label options"
      ]
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Header title="SaaS Platform" />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
              Build Your <span className="text-primary">Multi-Tenant</span> Business
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Complete SaaS platform that lets you manage multiple administrators and their clients. 
              Scale your business with powerful tools and analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/register")}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage a multi-tenant SaaS business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <i className={`${feature.icon} text-3xl text-primary mb-4`}></i>
                <h3 className="text-xl font-semibold text-secondary mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-600">Choose the plan that fits your business needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative ${
                plan.popular ? 'border-2 border-primary' : 'border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-secondary mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  ${plan.price}<span className="text-sm text-slate-500">/month</span>
                </div>
                <ul className="space-y-3 text-slate-600 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <i className="fas fa-check text-accent mr-3"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-cube text-2xl text-primary mr-3"></i>
                <span className="text-xl font-bold">SaaS Platform</span>
              </div>
              <p className="text-slate-400">Build and scale your multi-tenant business with our powerful platform.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
