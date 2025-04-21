import React from 'react';
import { Link, useLocation } from 'wouter';

const Header: React.FC = () => {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <span className="material-icons text-primary mr-2">medication</span>
            <h1 className="text-xl font-bold text-neutral-500">MedRemind</h1>
          </div>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/">
            <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${location === '/' ? 'text-primary font-medium' : 'text-neutral-400 hover:text-primary'}`}>
              <span className="material-icons text-sm mr-1">home</span>
              <span>Home</span>
            </div>
          </Link>
          <Link href="/calendar">
            <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${location === '/calendar' ? 'text-primary font-medium' : 'text-neutral-400 hover:text-primary'}`}>
              <span className="material-icons text-sm mr-1">calendar_month</span>
              <span>Calendar</span>
            </div>
          </Link>
          <button className="p-2 rounded-full hover:bg-neutral-100" aria-label="User profile">
            <span className="material-icons text-neutral-400">account_circle</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
