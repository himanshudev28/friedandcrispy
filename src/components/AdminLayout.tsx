import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LayoutDashboard, BookOpen, ShoppingCart, LogOut, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu Manager", icon: BookOpen },
  { to: "/admin/pos", label: "POS Billing", icon: ShoppingCart },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-display font-bold">Fried&Crispy</span>
          </Link>
          <p className="text-xs text-sidebar-foreground/60 font-body mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                location.pathname === item.to
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground font-body" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-sidebar-primary" />
            <span className="font-display font-bold">Fried&Crispy</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button variant="ghost" size="icon" className={cn(
                  "text-sidebar-foreground/70",
                  location.pathname === item.to && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
            <Button variant="ghost" size="icon" className="text-sidebar-foreground/70" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-background overflow-auto md:p-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
