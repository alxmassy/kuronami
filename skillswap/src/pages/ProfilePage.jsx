import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Switch, FormControlLabel } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    location: '', 
    photoUrl: '', 
    skillsOffered: '',
    skillsWanted: '',
    availability: '',
    isPublic: true, 
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name || '',
        location: user.location || '', 
        photoUrl: user.photoUrl || '', 
        skillsOffered: user.skillsOffered?.join(', ') || '',
        skillsWanted: user.skillsWanted?.join(', ') || '',
        availability: user.availability || '',
        isPublic: user.isPublic || false, 
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormState(prevState => ({ ...prevState, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const profileData = {
        ...formState,
        skillsOffered: formState.skillsOffered.split(',').map(skill => skill.trim()).filter(Boolean),
        skillsWanted: formState.skillsWanted.split(',').map(skill => skill.trim()).filter(Boolean),
      };

      updateUser(profileData); 
      

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Error updating profile.');
    }
  };

  if (!user) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ my: 4 }}>
        Edit Your Profile
      </Typography>
      {message && <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{mb: 2}}>{message}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControlLabel
            control={
                <Switch
                    checked={formState.isPublic}
                    onChange={handleChange}
                    name="isPublic"
                />
            }
            label="Make Profile Public (so others can find you)"
            sx={{ mb: 1 }}
        />
        <TextField
          label="Name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Location (Optional)"
          name="location"
          value={formState.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          helperText="e.g., City, State"
        />
        
         <TextField
          label="Profile Photo URL (Optional)"
          name="photoUrl"
          value={formState.photoUrl}
          onChange={handleChange}
          fullWidth
          margin="normal"
          helperText="Paste a link to an image of you"
        />
        <TextField
          label="Skills I Offer (comma-separated)"
          name="skillsOffered"
          value={formState.skillsOffered}
          onChange={handleChange}
          fullWidth
          margin="normal"
          helperText="e.g., Guitar, Photoshop, Spanish"
        />
        <TextField
          label="Skills I Want (comma-separated)"
          name="skillsWanted"
          value={formState.skillsWanted}
          onChange={handleChange}
          fullWidth
          margin="normal"
          helperText="e.g., Public Speaking, Python"
        />
        <TextField
          label="Availability"
          name="availability"
          value={formState.availability}
          onChange={handleChange}
          fullWidth
          margin="normal"
          helperText="e.g., Weekends, Evenings after 7pm"
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;