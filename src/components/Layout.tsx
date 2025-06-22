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
      <header className="py-3 px-5 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold">
            Ramsay<span className="text-primary">AI</span>
          </h1>
        </Link>
        <div className="relative flex items-center" ref={menuRef}>
          <button onClick={() => setOpen(!open)} className="text-black hover:text-primary transition-colors">
            <User size={22} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-md animate-fade-in">
              <button className="block px-4 py-2 text-sm text-black hover:bg-gray-100 w-full text-left">Log out</button>
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
