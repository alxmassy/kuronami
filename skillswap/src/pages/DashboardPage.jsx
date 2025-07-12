import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Box, CircularProgress } from '@mui/material';
import UserCard from '../components/UserCard';
import SwapRequestModal from '../components/SwapRequestModal';
import { getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = searchTerm ? { skill: searchTerm } : {};
        const response = await getAllUsers(params);
        // Filter out the current user from the list
        const filteredUsers = response.data.filter(user => user.id !== currentUser.id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
      setLoading(false);
    };

    const timerId = setTimeout(() => {
        fetchUsers();
    }, 500);

    return () => clearTimeout(timerId);

  }, [searchTerm, currentUser.id]);

  const handleRequestSwap = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        Browse and Swap Skills
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search by skill offered"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        users.map(user => (
          <UserCard key={user.id} user={user} onRequestSwap={handleRequestSwap} />
        ))
      )}
       {users.length === 0 && !loading && (
        <Typography>No users found. Try a different search.</Typography>
      )}
      {selectedUser && (
        <SwapRequestModal
          open={modalOpen}
          handleClose={handleCloseModal}
          targetUser={selectedUser}
        />
      )}
    </Container>
  );
};

export default DashboardPage;