'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, PlusCircle, Settings, Menu, X } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { calculateWeekNumber } from '@/lib/progress';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const currentWeek = createdAt ? calculateWeekNumber(createdAt) : 1;

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      color: 'text-goal'
    },
    { 
      label: 'Check-In', 
      icon: PlusCircle, 
      path: '/check-in',
      color: 'text-passive'
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      color: 'text-gray-600'
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleNavigate('/dashboard')}
                className="text-2xl font-bold transition-all"
                style={{ color: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#37B24D'}
              >
                zdebt
              </button>
              <div className="px-3 py-1 rounded-full" style={{ backgroundColor: '#74C0FC' }}>
                <span className="text-sm font-semibold" style={{ color: '#1C7ED6' }}>
                  Week {currentWeek}
                </span>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive 
                        ? '' 
                        : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? '#51CF66' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => handleNavigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-bold" style={{ color: '#37B24D' }}>zdebt</span>
              <div className="px-2 py-1 rounded-full" style={{ backgroundColor: '#74C0FC' }}>
                <span className="text-xs font-semibold" style={{ color: '#1C7ED6' }}>
                  Week {currentWeek}
                </span>
              </div>
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              style={{ color: '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive 
                        ? '' 
                        : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? '#51CF66' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

