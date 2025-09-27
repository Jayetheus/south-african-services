import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import ToolsDrawer from "@/components/layout/ToolsDrawer";
import QuickAccess from "@/components/layout/QuickAccess";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import ServiceDetail from "./pages/ServiceDetail";
import CreateRequest from "./pages/CreateRequest";
import Verification from "./pages/Verification";
import Notifications from "./pages/Notifications";
import Learning from "./pages/Learning";
import Bookkeeping from "./pages/Bookkeeping";
import Pricing from "./pages/Pricing";
import Savings from "./pages/Savings";
import Prime from "./pages/Prime";
import NotFound from "./pages/NotFound";

// Note: SecurityProvider sets up Content Security Policy (CSP) headers
// In development, it allows 'unsafe-eval' and 'unsafe-inline' for compatibility
// In production, you should set CSP headers on your server and remove these unsafe directives

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Public route wrapper (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <ToolsDrawer />
      <QuickAccess />
      <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute>
          <Services />
        </ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute>
          <Requests />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/service/:id" element={
        <ProtectedRoute>
          <ServiceDetail />
        </ProtectedRoute>
      } />
      <Route path="/create-request" element={
        <ProtectedRoute>
          <CreateRequest />
        </ProtectedRoute>
      } />
      <Route path="/verification" element={
        <ProtectedRoute>
          <Verification />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/learning" element={
        <ProtectedRoute>
          <Learning />
        </ProtectedRoute>
      } />
      <Route path="/bookkeeping" element={
        <ProtectedRoute>
          <Bookkeeping />
        </ProtectedRoute>
      } />
      <Route path="/pricing" element={
        <ProtectedRoute>
          <Pricing />
        </ProtectedRoute>
      } />
      <Route path="/savings" element={
        <ProtectedRoute>
          <Savings />
        </ProtectedRoute>
      } />
      <Route path="/prime" element={
        <ProtectedRoute>
          <Prime />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SecurityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </SecurityProvider>
  </QueryClientProvider>
);

export default App;
