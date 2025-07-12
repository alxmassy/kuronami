import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const RegistrationForm = ({ onSubmit }) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}
    >
      <Typography variant="h4">Register</Typography>

      <TextField
        label="Full Name"
        name="name"
        type="text"
        required
        fullWidth
      />
      <TextField
        label="Email Address"
        name="email"
        type="email"
        required
        fullWidth
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        fullWidth
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign Up
      </Button>
    </Box>
  );
};

export default RegistrationForm;
