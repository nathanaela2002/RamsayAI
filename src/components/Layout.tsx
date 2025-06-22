import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);
  
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="py-5 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/assets/ramsay.png" alt="Ramsay Logo" className="h-12 w-auto" />
          <h1 className="text-4xl font-bold">
            Ramsay<span className="text-primary">AI</span>
          </h1>
        </Link>
        <div className="relative flex items-center" ref={menuRef}>
          <button onClick={() => setOpen(!open)} className="text-black hover:text-primary transition-colors rounded-full p-2">
            <User size={22} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-md animate-fade-in">
              <button className="block px-5 py-3 text-base text-black hover:bg-gray-100 text-left rounded-full">Log out</button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-5 pb-20 overflow-y-auto animate-fade-in">
        {children}
      </main>
      
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50">
        {/* Bottom action removed as per UI simplification */}
      </div>
    </div>
  );
};

export default Layout;
