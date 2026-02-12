import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/authpages/Login";
import Register from "./pages/authpages/Register";
import ForgotPassword from "./pages/authpages/ForgotPassword";
import CompleteProfile from "./pages/CompleteProfile";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Content from "./pages/dashboard/Content";
import Publish from "./pages/dashboard/Publish";
import Accounts from "./pages/dashboard/Accounts";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import AuthCallback from "./pages/authpages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireProfile = false }: { children: React.ReactNode; requireProfile?: boolean }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // Redirect to complete-profile if profile is not complete and route requires it
  if (requireProfile && !user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (user) {
    // Redirect to dashboard if already logged in
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            
            {/* Keycloak OAuth Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes - Profile not required */}
            <Route path="/complete-profile" element={
              <ProtectedRoute requireProfile={false}>
                <CompleteProfile />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Profile required */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireProfile={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="content" element={<Content />} />
              <Route path="publish" element={<Publish />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;