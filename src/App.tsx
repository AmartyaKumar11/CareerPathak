import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './contexts/SimpleAuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useEffect } from 'react';

// Import pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CareersPage from "./pages/CareersPage";
import { Dashboard } from "./pages/Dashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { CreateProfilePage } from "./pages/CreateProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import NotFound from "./pages/NotFound";

// Debug component to track route changes
const RouteDebugger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
    console.log('Current location state:', location.state);
  }, [location]);
  
  return null;
};

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteDebugger />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/careers" element={
            <ProtectedRoute>
              <CareersPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/create" element={
            <ProtectedRoute>
              <CreateProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
          {/* Additional routes will be added as components are created */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
