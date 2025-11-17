'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, Home } from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export default function Sidebar({ 
  userName = 'amanuel', 
  userEmail = 'amanuel@gmail.com',
  userAvatar 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      name: 'Account Information',
      href: '/account',
      icon: User,
      active: pathname === '/account',
    },
  ];

  return (
    <div className="w-64 bg-blue-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-white font-medium text-lg mb-4">Profile</h2>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center mb-3 overflow-hidden">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt={userName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="text-white font-medium text-lg">{userName}</h3>
          <p className="text-blue-200 text-sm mt-1">{userEmail}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      item.active
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

