import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/admin", user?.id],
    enabled: !!user?.id,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients", { adminId: user?.id }],
    enabled: !!user?.id,
  });

  if (statsLoading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Admin Panel" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            change="+3 new this week"
            icon="fas fa-users"
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatsCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            change="+2 this month"
            icon="fas fa-project-diagram"
            iconColor="text-accent"
            iconBg="bg-accent/10"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats?.monthlyRevenue || 0}`}
            change="+12%"
            icon="fas fa-dollar-sign"
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatsCard
            title="Satisfaction"
            value={stats?.satisfaction || 0}
            change="+0.2"
            icon="fas fa-star"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Client Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Clients</CardTitle>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients && clients.length > 0 ? (
                    clients.map((client: any) => (
                      <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user text-white"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-secondary">{client.user.username}</h4>
                            <p className="text-sm text-slate-500">{client.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Last Active</p>
                          <p className="font-semibold text-secondary">
                            {client.lastActiveAt ? new Date(client.lastActiveAt).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={client.user.isActive ? "default" : "secondary"}>
                            {client.user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-ellipsis-v"></i>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-users text-4xl text-slate-400 mb-4"></i>
                      <p className="text-slate-500">No clients yet. Start by adding your first client!</p>
                      <Button className="mt-4">
                        <i className="fas fa-plus mr-2"></i>Add First Client
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Tools */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-secondary">New client registered</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-secondary">Project milestone completed</p>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-secondary">Payment received</p>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-link text-primary mr-3"></i>
                      <span>My Landing Page</span>
                    </div>
                    <i className="fas fa-external-link-alt text-slate-400"></i>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-chart-line text-accent mr-3"></i>
                      <span>Analytics</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-cog text-amber-500 mr-3"></i>
                      <span>Settings</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
