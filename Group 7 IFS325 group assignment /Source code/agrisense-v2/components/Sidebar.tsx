
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary text-white'
            : 'text-on-surface-secondary hover:bg-slate-200 hover:text-on-surface'
        }`
      }
    >
      <span className="material-symbols-outlined mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-surface border-r border-slate-200 p-4 flex flex-col">
      <div className="flex items-center mb-8">
         <span className="material-symbols-outlined text-4xl text-primary mr-2">spa</span>
        <h1 className="text-2xl font-bold text-on-surface">AgriSense</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem to="/" icon="home" label="Home" />
        <NavItem to="/dashboard" icon="analytics" label="Dashboard" />
        <NavItem to="/recommendations" icon="recommend" label="Recommendations" />
        <NavItem to="/ask-ai" icon="question_answer" label="Ask AI" />
      </nav>
      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-on-surface-secondary hover:bg-slate-200 hover:text-on-surface rounded-lg transition-colors duration-200"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
