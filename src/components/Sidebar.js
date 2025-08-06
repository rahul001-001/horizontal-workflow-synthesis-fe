import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <aside style={{
      width: '200px',
      backgroundColor: '#1e1e1e',
      color: '#eee',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Menu</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/upload" style={{ color: '#fff', textDecoration: 'none' }}>Upload</Link>
          <Link to="/results" style={{ color: '#fff', textDecoration: 'none' }}>Results</Link>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '2rem',
          color: '#fff',
          background: '#444',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
