import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMenuManager from "./pages/AdminMenuManager";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import POSPage from "./pages/POSPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute><AdminMenuManager /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
