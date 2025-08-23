import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { VehicleProvider } from "./contexts/VehicleContext";
import { BookingProvider } from "./contexts/BookingContext";
import { ContentProvider } from "./contexts/ContentContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import ServicesPage from "./pages/ServicesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import BookingPage from "./pages/BookingPage";
import RepairStatusPage from "./pages/RepairStatusPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import TestPage from "./pages/TestPage.tsx";

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ContentManager from './components/admin/ContentManager';
import TemplateManager from './components/admin/TemplateManager';
import ReusableBlocks from './components/admin/ReusableBlocks';
import DesignTokenManager from './components/admin/DesignTokenManager';
import MediaLibrary from './components/admin/MediaLibrary';
import FormBuilder from './components/admin/FormBuilder';
import InventoryManager from './components/inventory/InventoryManager';
import BookingManager from './components/booking/BookingManager';
import CustomerManager from './components/admin/CustomerManager';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import AdvancedAnalytics from './components/admin/AdvancedAnalytics';
import PromotionsEngine from './components/admin/PromotionsEngine';
import ABTestManager from './components/admin/ABTestManager';
import ConditionalDisplay from './components/admin/ConditionalDisplay';
import ContentScheduler from './components/admin/ContentScheduler';
import SEOManager from './components/admin/SEOManager';
import AutomationEngine from './components/admin/AutomationEngine';
import PersonalizationEngine from './components/admin/PersonalizationEngine';
import BackupManager from './components/admin/BackupManager';
import SystemSettings from './components/admin/SystemSettings';

import "./styles/globals.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <VehicleProvider>
            <BookingProvider>
              <ContentProvider>
                <Router>
                <div className="min-h-screen bg-black text-white overflow-x-hidden">
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route
                        path="/vehicle/:id"
                        element={<VehicleDetailPage />}
                      />
                      <Route path="/book" element={<BookingPage />} />
                      <Route
                        path="/repair-status"
                        element={<RepairStatusPage />}
                      />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/admin" element={<AdminPage />}>
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="content" element={<ContentManager />} />
                        <Route path="templates" element={<TemplateManager />} />
                        <Route path="blocks" element={<ReusableBlocks />} />
                        <Route path="design" element={<DesignTokenManager />} />
                        <Route path="media" element={<MediaLibrary />} />
                        <Route path="forms" element={<FormBuilder />} />
                        <Route path="inventory" element={<InventoryManager />} />
                        <Route path="bookings" element={<BookingManager />} />
                        <Route path="customers" element={<CustomerManager />} />
                        <Route path="analytics" element={<AnalyticsDashboard />} />
                        <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
                        <Route path="promotions" element={<PromotionsEngine />} />
                        <Route path="ab-testing" element={<ABTestManager />} />
                        <Route path="conditional-display" element={<ConditionalDisplay />} />
                        <Route path="scheduler" element={<ContentScheduler />} />
                        <Route path="seo" element={<SEOManager />} />
                        <Route path="automations" element={<AutomationEngine />} />
                        <Route path="personalization" element={<PersonalizationEngine />} />
                        <Route path="backup" element={<BackupManager />} />
                        <Route path="settings" element={<SystemSettings />} />
                      </Route>
                      <Route path="/test" element={<TestPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </ContentProvider>
          </BookingProvider>
        </VehicleProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
