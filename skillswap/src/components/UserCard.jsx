import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Chip, Box, Avatar, Rating } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
const UserCard = ({ user, onRequestSwap }) => {
  const averageRating = user.ratings?.reduce((acc, curr) => acc + curr.score, 0) / user.ratings?.length || 0;

  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar src={user.photoUrl} sx={{ width: 80, height: 80 }}>
          {user.name.charAt(0)}
        </Avatar>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="div">
              {user.name}
            </Typography>
            {averageRating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={averageRating} precision={0.5} readOnly />
                    <Typography variant="body2" color="text.secondary" ml={1}>({user.ratings.length})</Typography>
                </Box>
            )}
          </Box>
          
          {user.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1.5 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{user.location}</Typography>
            </Box>
          )}

          <Box mt={1}>
            <Typography variant="body1" fontWeight="bold">Offers:</Typography>
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              user.skillsOffered.map(skill => <Chip label={skill} key={skill} sx={{ mr: 0.5, mb: 0.5 }} color="primary" />)
            ) : (<Typography variant="body2" color="text.secondary">No skills offered yet.</Typography>)}
          </Box>
          <Box mt={1}>
            <Typography variant="body1" fontWeight="bold">Wants:</Typography>
            {user.skillsWanted && user.skillsWanted.length > 0 ? (
              user.skillsWanted.map(skill => <Chip label={skill} key={skill} variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)
            ) : (<Typography variant="body2" color="text.secondary">No skills wanted yet.</Typography>)}
          </Box>
        </CardContent>
        <CardActions sx={{ alignSelf: 'flex-end', p: 2 }}>
          <Button size="small" variant="contained" onClick={() => onRequestSwap(user)}>Request Swap</Button>
        </CardActions>
      </Box>
    </Card>
  );
};

export default UserCard;