import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from './utils/axiosInstance';
import { UserContext } from './context/userContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ResultsPageDetails from './pages/ResultsPageDetails';
import RequireAuth from './components/RequireAuth';
import LeaderboardPage from './pages/LeaderboardPage';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WorkflowListPage from './pages/WorkflowPage';
import WorkflowDetailsPage from './pages/WorkflowDetailsPage';

function App() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access');
      if (!token) return;

      try {
        const res = await axios.get('/users/me/');
        setUserInfo(res.data);
      } catch (err) {
        console.error('User fetch failed', err);
      }
    };

    fetchUser();
  }, []);

  const isAuthenticated = !!localStorage.getItem('access');

  return (
    <UserContext.Provider value={userInfo}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/workflow" element={isAuthenticated ? <WorkflowListPage /> : <Navigate to="/login" />} />
          <Route path="/workflows/:id" element={isAuthenticated ? <WorkflowDetailsPage /> : <Navigate to="/login" />} />
          <Route path="/upload" element={isAuthenticated ? <UploadPage /> : <Navigate to="/login" />} />
          <Route path="/results" element={<RequireAuth><ResultsPage /></RequireAuth>} />
          <Route path="/results/:id" element={<RequireAuth><ResultsPageDetails /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;

