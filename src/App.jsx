import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SwapsPage from './pages/SwapsPage';
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';
import { Box } from '@mui/material';

function App() {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ p: 3 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/swaps" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} />
        </Routes>
      </Box>
    </>
  );
}

export default App;