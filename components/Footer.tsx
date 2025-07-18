import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer: React.FC = () => {
    const { user } = useAuth();
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Annapoorna Examination App. All Rights Reserved.</p>
        <p>An <a href="https://annapoornainfo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Annapoorna Infotech</a> Venture.</p>
        {user && user.role === 'admin' && (
            <div className="mt-2">
                <Link to="/admin" className="text-slate-400 hover:text-cyan-600 transition-colors">Admin Panel</Link>
            </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;