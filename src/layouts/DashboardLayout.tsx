import React, { useState } from 'react';
import { glassmorphism, gradients, transitions } from '../styles/theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: '📊', label: 'Dashboard', isActive: true },
    { icon: '📈', label: 'Live Market' },
    { icon: '🎯', label: 'Predictions' },
    { icon: '📋', label: 'History' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background gradient effects */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: gradients.primary,
          opacity: 0.1,
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          h-full
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          transition-all
          duration-300
          ease-in-out
          z-50
          bg-opacity-20
          bg-gray-800
          backdrop-blur-lg
          border-r
          border-gray-700/30
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700/30">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            {isSidebarOpen ? 'CryptoPrediction' : 'CP'}
          </span>
        </div>

        {/* Menu Items */}
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`
                flex
                items-center
                px-6
                py-3
                cursor-pointer
                transition-all
                duration-200
                ${item.isActive
                  ? 'bg-indigo-500/10 border-r-2 border-indigo-500'
                  : 'hover:bg-white/5'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && (
                <span className={`
                  ml-3
                  text-sm
                  font-medium
                  ${item.isActive ? 'text-indigo-400' : 'text-gray-400'}
                `}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          className={`
            absolute
            -right-3
            top-8
            w-6
            h-6
            rounded-full
            bg-gray-800
            border
            border-gray-700
            flex
            items-center
            justify-center
            cursor-pointer
            transition-transform
            duration-300
            hover:bg-gray-700
          `}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={`
          transition-all
          duration-300
          ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-20'}
        `}
      >
        {/* Header */}
        <header
          className="h-16 px-6 flex items-center bg-opacity-20 bg-gray-800 backdrop-blur-lg border-b border-gray-700/30"
        >
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
              <span className="text-lg">🔔</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="rounded-xl overflow-hidden bg-gray-800 bg-opacity-30 backdrop-blur-lg border border-gray-700/30">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};