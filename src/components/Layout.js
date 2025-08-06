// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { useEffect, useState } from 'react';
// import axios from '../utils/axiosInstance';
// import { useContext } from 'react';
// import { UserContext } from '../context/userContext';

// const Layout = ({ children }) => {
//   const navigate = useNavigate();

//   const token = localStorage.getItem('access');
//   let username = null;

// //   const [userInfo, setUserInfo] = useState(null);
//   const userInfo = useContext(UserContext);

//   const handleLogout = () => {
//     localStorage.removeItem('access');
//     navigate('/login');
//   };

//   return (
//     <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111' }}>
//     <header style={{
//       backgroundColor: '#222',
//       color: '#eee',
//       padding: '1rem',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center'
//     }}>
//         <div>
//         <strong>Logged in as:</strong>{' '}
//         <span style={{ color: '#ccc' }}>
//         {userInfo
//             ? `${userInfo.username} | ${userInfo.role}`
//             : 'Loading...'}
//         </span>
//         </div>
//         <div>
//           <button onClick={() => navigate('/dashboard')} style={{ marginRight: '1rem' }}>Dashboard</button>
//           <button onClick={() => navigate('/upload')} style={{ marginRight: '1rem' }}>Upload</button>
//           <button onClick={() => navigate('/results')} style={{ marginRight: '1rem' }}>Results</button>
//           <button onClick={() => navigate('/leaderboard')} style={{ marginRight: '1rem' }}>Leaderboard</button>
//           <button onClick={handleLogout}>Logout</button>
//         </div>
//       </header>
//       <main style={{ padding: '1rem' }}>
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import './Layout.css'; // 👈 Add this line

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const userInfo = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem('access');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div>
          <button onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/workflow')}>Workflows</button>
          <button onClick={() => navigate('/upload')}>Upload</button>
          <button onClick={() => navigate('/results')}>Results</button>
          <button onClick={() => navigate('/leaderboard')}>Leaderboard</button>
        </div>
        <div className="user-info">
          <strong>Logged in as:</strong>{' '}
          <span>{userInfo ? `${userInfo.username} | ${userInfo.role}` : 'Loading...'}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;

