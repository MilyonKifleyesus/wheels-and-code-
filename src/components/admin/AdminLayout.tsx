import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Car, Calendar, Users, Settings, BarChart3, FileText, Layout, LogOut, User,
  Palette, Image, Zap, Target, Gift, TestTube, Clock, Layers, Search, Shield
} from 'lucide-react';

const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/content", label: "Website Builder", icon: Layout },
    { to: "/admin/templates", label: "Templates", icon: FileText },
    { to: "/admin/blocks", label: "Reusable Blocks", icon: Layers },
    { to: "/admin/design", label: "Design System", icon: Palette },
    { to: "/admin/media", label: "Media Library", icon: Image },
    { to: "/admin/forms", label: "Form Builder", icon: Zap },
    { to: "/admin/inventory", label: "Inventory", icon: Car },
    { to: "/admin/bookings", label: "Bookings", icon: Calendar },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: FileText },
    { to: "/admin/advanced-analytics", label: "Advanced Analytics", icon: Target },
    { to: "/admin/promotions", label: "Promotions", icon: Gift },
    { to: "/admin/ab-testing", label: "A/B Testing", icon: TestTube },
    { to: "/admin/conditional-display", label: "Conditional Display", icon: Layers },
    { to: "/admin/scheduler", label: "Content Scheduler", icon: Clock },
    { to: "/admin/seo", label: "SEO Manager", icon: Search },
    { to: "/admin/automations", label: "Automations", icon: Zap },
    { to: "/admin/personalization", label: "Personalization", icon: Target },
    { to: "/admin/backup", label: "Backup & Health", icon: Shield },
    { to: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout: React.FC = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="flex min-h-screen bg-matte-black text-gray-300">
            <aside className="w-64 bg-dark-graphite p-4 border-r border-gray-800 flex flex-col fixed top-0 left-0 h-full">
                <div className="p-2">
                    <h1 className="text-2xl font-bold text-acid-yellow mb-2">APEX ADMIN</h1>
                    <p className="text-xs text-gray-500 mb-6">v0.1.0 - Business Control</p>
                </div>
                <nav className="flex-grow overflow-y-auto pr-2 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end
                                className={({ isActive }) =>
                                    `w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm ${
                                    isActive
                                        ? "bg-acid-yellow text-black font-bold shadow-lg"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
                <div className="mt-auto p-2">
                    <div className="bg-matte-black border border-gray-700 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-acid-yellow rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-black" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">{user?.full_name || "Admin User"}</h3>
                                <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs">Role</span>
                                <span className="text-acid-yellow text-xs font-bold capitalize">{user?.role || 'admin'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs">Status</span>
                                <span className="text-green-400 text-xs font-bold">Active</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8 bg-black">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
