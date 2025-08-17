import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Car, Phone, Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "HOME", href: "/" },
    { name: "INVENTORY", href: "/inventory" },
    { name: "SERVICES", href: "/services" },
    { name: "CONTACT", href: "/contact" },
    {
      name: user && isAdmin ? "DASHBOARD" : "ADMIN",
      href: "/admin",
      icon: user && isAdmin ? undefined : Lock,
      className: user && isAdmin ? "text-acid-yellow" : "text-white",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-lg border-b border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-acid-yellow to-neon-lime rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-wider">APEX AUTO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium tracking-widest transition-colors duration-300 hover:text-acid-yellow relative flex items-center space-x-1 ${
                  location.pathname === item.href
                    ? "text-acid-yellow"
                    : item.className || "text-white"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
                {location.pathname === item.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-acid-yellow"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Emergency Call */}
          <div className="hidden md:flex items-center">
            <a
              href="tel:+14169166475"
              className="flex items-center space-x-2 bg-acid-yellow text-black px-4 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-bold">EMERGENCY</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:text-acid-yellow transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-black/98 backdrop-blur-lg border-t border-gray-800">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-lg font-medium tracking-widest transition-colors duration-300 flex items-center space-x-2 ${
                  location.pathname === item.href
                    ? "text-acid-yellow"
                    : item.className || "text-white hover:text-acid-yellow"
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800">
              <a
                href="tel:+14169166475"
                className="flex items-center justify-center space-x-2 bg-acid-yellow text-black py-3 rounded-sm font-bold w-full"
              >
                <Phone className="w-5 h-5" />
                <span>CALL NOW</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
