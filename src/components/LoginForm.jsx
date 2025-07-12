import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const LoginForm = () => {
  return (
    <Box
      component="form"
      sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}
    >
      <Typography variant="h4">Login</Typography>
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
        Sign In
      </Button>
    </Box>
  );
};

export default LoginForm;