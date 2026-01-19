import React from 'react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="w-64 border-r min-h-screen p-4">
      <nav className="space-y-2">
        <NavLink to="/" className="block p-2 hover:bg-gray-100 rounded">Dashboard</NavLink>
        <NavLink to="/new" className="block p-2 hover:bg-gray-100 rounded">New Screening</NavLink>
        <NavLink to="/settings" className="block p-2 hover:bg-gray-100 rounded">Settings</NavLink>
      </nav>
    </aside>
  );
}
