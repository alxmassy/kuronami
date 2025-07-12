import React, { useState } from 'react';
import { Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { createSwap } from '../services/api';
import { useAuth } from '../context/AuthContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const SwapRequestModal = ({ open, handleClose, targetUser }) => {
  const { user } = useAuth();
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!mySkill || !theirSkill) {
      setError('Please select a skill from both lists.');
      return;
    }
    setError('');
    try {
      await createSwap({
        receiverId: targetUser.id,
        skillOfferedByRequester: mySkill,
        skillWantedByRequester: theirSkill,
      });
      handleClose(); // Close modal on success
    } catch (err) {
      setError('Failed to create swap request. Please try again.');
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Request Swap with {targetUser?.name}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Skill You'll Offer</InputLabel>
          <Select value={mySkill} label="Skill You'll Offer" onChange={(e) => setMySkill(e.target.value)}>
            {user?.skillsOffered?.map(skill => (
              <MenuItem key={skill} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Skill You Want</InputLabel>
          <Select value={theirSkill} label="Skill You Want" onChange={(e) => setTheirSkill(e.target.value)}>
            {targetUser?.skillsOffered?.map(skill => (
              <MenuItem key={skill} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && <FormHelperText error sx={{mt: 2}}>{error}</FormHelperText>}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ ml: 1 }}>Send Request</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SwapRequestModal;