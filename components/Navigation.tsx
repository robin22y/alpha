'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Hidden admin access: long press counter
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressCountRef = useRef(0);
  const lastPressTimeRef = useRef(0);
  const isLongPressingRef = useRef(false);
  const pressStartTimeRef = useRef(0);
  const isPressingRef = useRef(false);
  const LONG_PRESS_DURATION = 2000; // 2 seconds
  const REQUIRED_PRESSES = 3;
  const PRESS_WINDOW = 5000; // 5 seconds to complete all presses

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
    // Don't navigate if we just completed a long press
    if (isLongPressingRef.current) {
      isLongPressingRef.current = false;
      return;
    }
    router.push(path);
    setMobileMenuOpen(false);
  };

  // Hidden admin access handler
  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    pressStartTimeRef.current = now;
    isPressingRef.current = true;
    
    // Reset if too much time passed since last press
    if (lastPressTimeRef.current > 0 && now - lastPressTimeRef.current > PRESS_WINDOW) {
      pressCountRef.current = 0;
    }
    
    // Start timer for long press detection
    longPressTimerRef.current = setTimeout(() => {
      // Check if we're still pressing
      if (isPressingRef.current) {
        // Long press completed!
        pressCountRef.current++;
        lastPressTimeRef.current = Date.now();
        
        console.log(`Long press ${pressCountRef.current} of ${REQUIRED_PRESSES} detected`);
        
        // Check if we've reached the required number of presses
        if (pressCountRef.current >= REQUIRED_PRESSES) {
          // Reset counter
          pressCountRef.current = 0;
          lastPressTimeRef.current = 0;
          isLongPressingRef.current = true;
          isPressingRef.current = false;
          
          console.log('Admin access triggered!');
          
          // Navigate to admin (password screen will show)
          router.push('/admin');
          
          // Reset flag after navigation
          setTimeout(() => {
            isLongPressingRef.current = false;
          }, 1000);
        }
      }
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isPressingRef.current = false;
    
    // Clear timer if user releases before long press completes
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <button 
                onMouseDown={(e) => {
                  handleLongPressStart(e);
                }}
                onMouseUp={(e) => {
                  handleLongPressEnd(e);
                  // Only navigate if not a long press
                  setTimeout(() => {
                    if (!isLongPressingRef.current && !longPressTimerRef.current) {
                      handleNavigate('/dashboard');
                    }
                  }, 50);
                }}
                onTouchStart={(e) => {
                  handleLongPressStart(e);
                }}
                onTouchEnd={(e) => {
                  handleLongPressEnd(e);
                  // Only navigate if not a long press
                  setTimeout(() => {
                    if (!isLongPressingRef.current && !longPressTimerRef.current) {
                      handleNavigate('/dashboard');
                    }
                  }, 50);
                }}
                className="text-2xl font-bold transition-all cursor-pointer"
                style={{ color: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2F9E44'}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#37B24D';
                  handleLongPressEnd();
                }}
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
              onMouseDown={(e) => {
                handleLongPressStart(e);
              }}
              onMouseUp={(e) => {
                handleLongPressEnd(e);
                // Only navigate if not a long press
                setTimeout(() => {
                  if (!isLongPressingRef.current && !longPressTimerRef.current) {
                    handleNavigate('/dashboard');
                  }
                }, 50);
              }}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={(e) => {
                handleLongPressStart(e);
              }}
              onTouchEnd={(e) => {
                handleLongPressEnd(e);
                // Only navigate if not a long press
                setTimeout(() => {
                  if (!isLongPressingRef.current && !longPressTimerRef.current) {
                    handleNavigate('/dashboard');
                  }
                }, 50);
              }}
              className="flex items-center gap-2 cursor-pointer"
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

