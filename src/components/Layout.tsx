
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, BookOpen, User, Utensils } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-cookify-dark text-white flex flex-col">
      <header className="p-5 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold">
            COOKIFY<span className="text-cookify-blue">AI</span>
          </h1>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/" className="text-white hover:text-cookify-blue transition-colors">
            <Home size={22} />
          </Link>
          <Link to="/search" className="text-white hover:text-cookify-blue transition-colors">
            <Search size={22} />
          </Link>
          <Link to="/saved" className="text-white hover:text-cookify-blue transition-colors">
            <BookOpen size={22} />
          </Link>
          <Link to="/profile" className="text-white hover:text-cookify-blue transition-colors">
            <User size={22} />
          </Link>
        </div>
      </header>
      
      <main className="flex-1 p-5 pb-20 overflow-y-auto animate-fade-in">
        {children}
      </main>
      
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50">
        <Link 
          to="/macros"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-cookify-blue text-white shadow-lg hover:bg-blue-500 transition-all"
        >
          <Utensils size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Layout;
