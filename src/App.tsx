import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { VehicleProvider } from "./contexts/VehicleContext";
import { BookingProvider } from "./contexts/BookingContext";
import { ContentProvider } from "./contexts/ContentContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
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
import AdminCrudTestPage from "./pages/AdminCrudTestPage";
import "./styles/globals.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
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
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/test" element={<TestPage />} />
                        <Route path="/crud-test" element={<AdminCrudTestPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </Router>
              </ContentProvider>
            </BookingProvider>
          </VehicleProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
