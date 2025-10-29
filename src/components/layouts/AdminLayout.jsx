import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ChevronDown,
  ChevronRight,
  X,
  ChevronsLeft,
  Menu,
  ChevronsRight,
  Settings,
  Type,
  FileText,
  LogOut,
  Tag,
  User,
  Factory,
  Settings2,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    "MASTER DATA": true,
    HRMS: true,
    SALES: true,
    PROCUREMENT: true,
    PRODUCTION: true,
    INVENTORY: true,
    Reports: true,
  });

  const navigate = useNavigate();
  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections((prev) => {
      const isCurrentlyCollapsed = prev[sectionName];

      if (isCurrentlyCollapsed) {
        const newState = {};
        Object.keys(prev).forEach((key) => {
          newState[key] = key === sectionName ? false : true;
        });
        return newState;
      } else {
        return {
          ...prev,
          [sectionName]: true,
        };
      }
    });
  };
  const toggleSettingsDropdown = () => {
    setSettingsDropdownOpen(!settingsDropdownOpen);
  };
  const closeSettingsDropdown = () => {
    setSettingsDropdownOpen(false);
  };
  const navigation = [
    {
      sectionName: "Master",
      collapsible: true,
      items: [
        { name: "Clients", href: "/clients", icon: User },
        { name: "Suppliers", href: "/suppliers", icon: Factory },
        { name: "Process", href: "/process", icon: Settings2 }
      ],
    },
    // {
    //   sectionName: "Product",
    //   collapsible: true,
    //   items: [
    //     { name: "Product", href: "/", icon: Package },
    //     { name: "SKU", href: "/sku", icon: Tag }
    //   ],
    // }
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const renderSectionHeader = (section = false) => {
    if (!section.collapsible) {
      return (
        <div className="py-2">
          <p className="px-3 text-xs font-semibold text-manufacturing-600 uppercase tracking-wider">
            {section.sectionName}
          </p>
        </div>
      );
    }

    const isCollapsed = collapsedSections[section.sectionName];
    const ChevronIcon = isCollapsed ? ChevronRight : ChevronDown;

    return (
      <div className="py-2">
        <button
          onClick={() => toggleSectionCollapse(section.sectionName)}
          className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-manufacturing-600 uppercase tracking-wider hover:text-primary-600 transition-colors group rounded-md hover:bg-primary-50"
        >
          <span>{section.sectionName}</span>
          <ChevronIcon className="h-3 w-3 transition-transform duration-200 group-hover:text-primary-600" />
        </button>
      </div>
    );
  };
  const renderSectionItems = (section, isMobile = false) => {
    if (section.collapsible && collapsedSections[section.sectionName]) {
      return null;
    }

    return (
      <div className="space-y-1">
        {section.items.map((item) => {
          const isActive = location.pathname === item.href;

          if (!isMobile && sidebarCollapsed) {
            return (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className={`sidebar-link group ${
                    isActive ? "active" : ""
                  } rounded-lg mx-1 justify-center`}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </Link>

                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </div>
              </div>
            );
          } else {
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-link group ${isActive ? "active" : ""} ${
                  !isMobile ? "rounded-lg mx-1" : ""
                }`}
                title={item.description}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
              </Link>
            );
          }
        })}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-cardboard-50 to-corrugated-50">
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-manufacturing-900 bg-opacity-75 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-52 flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-r from-primary-600 to-corrugated-600">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white" />
              <span className="ml-3 text-lg font-bold text-white">
                PackWorkX
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-cardboard-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 pb-4 overflow-y-auto">
            {navigation.map((section) => (
              <div key={section.sectionName}>
                {renderSectionHeader(section, true)}
                {renderSectionItems(section, true)}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-52"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-cardboard-200 shadow-xl">
          <div
            className={`flex items-center bg-gradient-to-r from-primary-600 to-corrugated-600 ${
              sidebarCollapsed ? "justify-center px-2 py-4" : "px-6 py-6"
            } transition-all duration-300`}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-white" />
                  <span className="ml-3 text-lg font-bold text-white transition-opacity duration-300">
                    PackWorkX
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="flex items-center justify-center w-8 h-8 text-white hover:text-cardboard-200 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0"
                  title="Collapse sidebar"
                >
                  <ChevronsLeft className="h-5 w-5" />
                </button>
              </div>
            )}
            {sidebarCollapsed && <Package className="h-6 w-6 text-white" />}
          </div>
          <nav className="flex-1 space-y-1 px-3 pb-4 overflow-y-auto bg-gradient-to-b from-white to-cardboard-50">
            {navigation.map((section) => (
              <div key={section.sectionName}>
                {!sidebarCollapsed && renderSectionHeader(section, false)}
                {renderSectionItems(section, false)}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-52"
        }`}
      >
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm border-b border-cardboard-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-manufacturing-500 hover:text-manufacturing-900 hover:bg-cardboard-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {sidebarCollapsed && (
                <button
                  type="button"
                  className="hidden lg:flex items-center justify-center h-10 w-10 rounded-lg text-manufacturing-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  onClick={toggleSidebar}
                  title="Expand sidebar"
                >
                  <ChevronsRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/admin/upgrade-plan"
                className="flex items-center text-xs text-manufacturing-600 hover:text-corrugated-600 transition-colors group px-3 py-2 rounded-lg hover:bg-corrugated-50"
              >
                <Package className="h-4 w-4 mr-2 group-hover:text-corrugated-600" />
                <span className="hidden sm:inline font-medium">
                  Upgrade Plan
                </span>
              </Link>

              <div className="relative">
                <button
                  onClick={toggleSettingsDropdown}
                  className="flex items-center text-xs text-manufacturing-600 hover:text-corrugated-600 transition-colors group px-3 py-2 rounded-lg hover:bg-corrugated-50"
                >
                  <Settings className="h-4 w-4 mr-2 group-hover:text-corrugated-600" />
                  <Link
                    to="/admin/settings"
                    className="flex items-center w-full px-3 py-2 text-sm text-manufacturing-700 hover:bg-corrugated-50 hover:text-corrugated-700 rounded-md transition-colors"
                  >
                    Settings
                  </Link>
                </button>

                {settingsDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={closeSettingsDropdown}
                    ></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-cardboard-200 z-20">
                      <div className="p-2">
                        <Link
                          to="/admin/settings"
                          onClick={closeSettingsDropdown}
                          className="flex items-center w-full px-3 py-2 text-xs text-manufacturing-700 hover:bg-corrugated-50 hover:text-corrugated-700 rounded-md transition-colors"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          ID Format
                        </Link>
                        <Link
                          to="/admin/settings"
                          onClick={closeSettingsDropdown}
                          className="flex items-center w-full px-3 py-2 text-xs text-manufacturing-700 hover:bg-corrugated-50 hover:text-corrugated-700 rounded-md transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          PO Templates
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden sm:block">
                <div className="text-xs text-manufacturing-700">
                  <span className="font-medium">Welcome back, </span>
                  <span className="font-semibold text-corrugated-700">
                    {"Admin"}
                  </span>
                </div>
                <div className="text-xs text-manufacturing-500">
                  {"Company Admin"}
                </div>
              </div>

              <div className="h-8 w-px bg-cardboard-300"></div>

              <button
                onClick={handleLogout}
                className="flex items-center text-xs text-manufacturing-600 hover:text-danger-600 transition-colors group"
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:text-danger-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
