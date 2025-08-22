import React, { useState } from "react";
import {
  Car,
  Calendar,
  Users,
  Settings,
  BarChart3,
  FileText,
  Layout,
  LogOut,
  User,
  Palette,
  Image,
  Zap,
  Target,
  Gift,
  TestTube,
  Clock,
  Layers
} from "lucide-react";
import AdminDashboard from "../components/admin/AdminDashboard";
import InventoryManager from "../components/inventory/InventoryManager";
import BookingManager from "../components/booking/BookingManager";
import CustomerManager from "../components/admin/CustomerManager";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import ContentManager from "../components/admin/ContentManager";
import SystemSettings from "../components/admin/SystemSettings";
import TemplateManager from "../components/admin/TemplateManager";
import DesignTokenManager from "../components/admin/DesignTokenManager";
import MediaLibrary from "../components/admin/MediaLibrary";
import FormBuilder from "../components/admin/FormBuilder";
import AdvancedAnalytics from "../components/admin/AdvancedAnalytics";
import PromotionsEngine from "../components/admin/PromotionsEngine";
import ABTestManager from "../components/admin/ABTestManager";
import ConditionalDisplay from "../components/admin/ConditionalDisplay";
import ContentScheduler from "../components/admin/ContentScheduler";
import ReusableBlocks from "../components/admin/ReusableBlocks";
import SEOManager from "../components/admin/SEOManager";
import AutomationEngine from "../components/admin/AutomationEngine";
import PersonalizationEngine from "../components/admin/PersonalizationEngine";
import BackupManager from "../components/admin/BackupManager";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "content", label: "Website Builder", icon: Layout },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "blocks", label: "Reusable Blocks", icon: Layers },
    { id: "design-tokens", label: "Design System", icon: Palette },
    { id: "media", label: "Media Library", icon: Image },
    { id: "forms", label: "Form Builder", icon: Zap },
    { id: "inventory", label: "Inventory", icon: Car },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: FileText },
    { id: "advanced-analytics", label: "Advanced Analytics", icon: Target },
    { id: "promotions", label: "Promotions", icon: Gift },
    { id: "ab-testing", label: "A/B Testing", icon: TestTube },
    { id: "conditional", label: "Conditional Display", icon: Layers },
    { id: "scheduler", label: "Content Scheduler", icon: Clock },
    { id: "seo", label: "SEO Manager", icon: Search },
    { id: "automations", label: "Automations", icon: Zap },
    { id: "personalization", label: "Personalization", icon: Target },
    { id: "backup", label: "Backup & Health", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "content":
        return <ContentManager />;
      case "templates":
        return <TemplateManager />;
      case "blocks":
        return <ReusableBlocks />;
      case "design-tokens":
        return <DesignTokenManager />;
      case "media":
        return <MediaLibrary />;
      case "forms":
        return <FormBuilder />;
      case "inventory":
        return <InventoryManager />;
      case "bookings":
        return <BookingManager />;
      case "customers":
        return <CustomerManager />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "advanced-analytics":
        return <AdvancedAnalytics />;
      case "promotions":
        return <PromotionsEngine />;
      case "ab-testing":
        return <ABTestManager />;
      case "conditional":
        return <ConditionalDisplay />;
      case "scheduler":
        return <ContentScheduler />;
      case "seo":
        return <SEOManager />;
      case "automations":
        return <AutomationEngine />;
      case "personalization":
        return <PersonalizationEngine />;
      case "backup":
        return <BackupManager />;
      case "settings":
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-matte-black pt-20">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-dark-graphite border-r border-gray-800 min-h-screen fixed left-0 top-20 z-40">
            <div className="p-6">
              <h2 className="text-white font-bold text-lg tracking-wider">
                BUSINESS CONTROL
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Complete Management System
              </p>
            </div>

            <nav className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-acid-yellow text-black shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium tracking-wider">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 mt-8">
              <div className="bg-matte-black border border-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-acid-yellow rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {user?.full_name || "Admin User"}
                    </h3>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Role</span>
                    <span className="text-acid-yellow text-xs font-bold capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Status</span>
                    <span className="text-green-400 text-xs font-bold">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 mt-4">
              <div className="bg-matte-black border border-gray-800 rounded-lg p-4">
                <h3 className="text-white font-bold text-sm mb-3">
                  QUICK STATS
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">
                      Today's Revenue
                    </span>
                    <span className="text-acid-yellow text-xs font-bold">
                      $3,450
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">
                      Active Bookings
                    </span>
                    <span className="text-white text-xs font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">
                      Vehicles Available
                    </span>
                    <span className="text-white text-xs font-bold">45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 mt-4">
              <button
                onClick={signOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">{renderContent()}</div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;
