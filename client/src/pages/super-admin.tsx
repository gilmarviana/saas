import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: administrators, isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/users/administrators"],
  });

  if (statsLoading || adminsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Super Admin Panel" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Administrators"
            value={stats?.totalAdmins || 0}
            change="+12%"
            icon="fas fa-users"
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatsCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            change="+8%"
            icon="fas fa-user-friends"
            iconColor="text-accent"
            iconBg="bg-accent/10"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats?.monthlyRevenue || 0}`}
            change="+15%"
            icon="fas fa-dollar-sign"
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            change="+3%"
            icon="fas fa-credit-card"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Administrators Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Administrators</CardTitle>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {administrators?.map((admin: any) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-user text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary">{admin.username}</h4>
                          <p className="text-sm text-slate-500">{admin.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Clients</p>
                        <p className="font-semibold text-secondary">{admin.clientCount}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={admin.isActive ? "default" : "secondary"}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-ellipsis-v"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Sales */}
          <div className="space-y-6">
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary">Professional Plan</p>
                      <p className="text-sm text-slate-500">New Admin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">$99</p>
                      <p className="text-sm text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary">Starter Plan</p>
                      <p className="text-sm text-slate-500">New Admin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">$29</p>
                      <p className="text-sm text-slate-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary">Enterprise Plan</p>
                      <p className="text-sm text-slate-500">New Admin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">$299</p>
                      <p className="text-sm text-slate-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-user-plus text-primary mr-3"></i>
                      <span>Add Administrator</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-chart-bar text-accent mr-3"></i>
                      <span>View Reports</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-cog text-amber-500 mr-3"></i>
                      <span>System Settings</span>
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
