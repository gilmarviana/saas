import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects", { clientId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings", { clientId: user?.id }],
    enabled: !!user?.id,
  });

  if (projectsLoading || meetingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-accent";
      case "review":
        return "bg-amber-500";
      default:
        return "bg-primary";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-accent">In Progress</Badge>;
      case "review":
        return <Badge className="bg-amber-500">Review</Badge>;
      default:
        return <Badge>Planning</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Client Portal" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="gradient-primary text-white rounded-xl p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-primary-foreground/90 mb-4">Here's what's happening with your projects</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-primary-foreground/90">Active Projects</p>
              <p className="text-2xl font-bold">{projects?.filter((p: any) => p.status === "in_progress").length || 0}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-primary-foreground/90">Completed</p>
              <p className="text-2xl font-bold">{projects?.filter((p: any) => p.status === "completed").length || 0}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-primary-foreground/90">Upcoming Meetings</p>
              <p className="text-2xl font-bold">{meetings?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects && projects.length > 0 ? (
                    projects.map((project: any) => (
                      <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-secondary">{project.name}</h4>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{project.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-500">
                            <i className="fas fa-calendar mr-1"></i>
                            <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-32 mr-2">
                              <Progress value={project.progress || 0} className="h-2" />
                            </div>
                            <span className="text-sm text-slate-500">{project.progress || 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-project-diagram text-4xl text-slate-400 mb-4"></i>
                      <p className="text-slate-500">No projects yet. Your administrator will create projects for you.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings && meetings.length > 0 ? (
                    meetings.map((meeting: any) => (
                      <div key={meeting.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                          <i className={`fas fa-${meeting.type === 'video' ? 'video' : 'calendar'} text-white`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-secondary">{meeting.title}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(meeting.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-calendar text-2xl text-slate-400 mb-2"></i>
                      <p className="text-slate-500 text-sm">No upcoming meetings</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <i className="fas fa-file-pdf text-red-500 mr-3"></i>
                    <div>
                      <p className="text-sm font-medium text-secondary">Project Brief.pdf</p>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <i className="fas fa-file-alt text-blue-500 mr-3"></i>
                    <div>
                      <p className="text-sm font-medium text-secondary">Requirements.docx</p>
                      <p className="text-xs text-slate-500">5 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <i className="fas fa-file-excel text-green-500 mr-3"></i>
                    <div>
                      <p className="text-sm font-medium text-secondary">Budget.xlsx</p>
                      <p className="text-xs text-slate-500">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    <i className="fas fa-message mr-2"></i>
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-book mr-2"></i>
                    View Documentation
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
