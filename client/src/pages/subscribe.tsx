import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const SubscribeForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate successful subscription for now
      toast({
        title: "Subscription Successful",
        description: "Welcome to your new subscription!",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-slate-50 rounded-lg text-center">
        <i className="fas fa-credit-card text-3xl text-slate-400 mb-2"></i>
        <p className="text-slate-600">Payment processing temporarily disabled</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : "Continue to Dashboard"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState("Professional");
  const [selectedAmount, setSelectedAmount] = useState(99);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const plans = [
    { name: "Starter", price: 29, features: ["Up to 5 admins", "100 clients per admin", "Basic analytics"] },
    { name: "Professional", price: 99, features: ["Up to 25 admins", "Unlimited clients", "Advanced analytics", "Priority support"] },
    { name: "Enterprise", price: 299, features: ["Unlimited admins", "Unlimited clients", "Custom integrations", "White-label options"] },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-4">Choose Your Plan</h1>
          <p className="text-slate-600">Select the perfect plan for your business needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`cursor-pointer transition-all ${selectedPlan === plan.name ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setSelectedPlan(plan.name);
                setSelectedAmount(plan.price);
              }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  ${plan.price}<span className="text-sm text-slate-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <i className="fas fa-check text-accent mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <p className="text-slate-600">
              You've selected the {selectedPlan} plan for ${selectedAmount}/month
            </p>
          </CardHeader>
          <CardContent>
            <SubscribeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
