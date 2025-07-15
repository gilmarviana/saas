import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAuth?: boolean;
}

export function Header({ title, subtitle, showAuth = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-primary/10 text-primary";
      case "admin":
        return "bg-accent/10 text-accent";
      case "client":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return "fas fa-crown";
      case "admin":
        return "fas fa-shield-alt";
      case "client":
        return "fas fa-user";
      default:
        return "fas fa-user";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Administrator";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <i className="fas fa-cube text-2xl text-primary mr-3"></i>
            <div>
              <span className="text-xl font-bold text-secondary">{title}</span>
              {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
            </div>
          </div>
          
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    <i className={`${getRoleIcon(user.role)} mr-1`}></i>
                    {getRoleLabel(user.role)}
                  </div>
                  <button className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <i className="fas fa-bell text-slate-600"></i>
                  </button>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
