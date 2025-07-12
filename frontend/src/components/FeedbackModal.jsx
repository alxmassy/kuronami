import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Rating } from '@mui/material';
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
const FeedbackModal = ({ open, handleClose, swap, onSubmitFeedback }) => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmitFeedback(swap.id, { score: rating, comment });
    handleClose();
  };
  if (!swap) return null;
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Leave Feedback for your swap
        </Typography>
        <Typography sx={{ mt: 2 }}>How was your experience with {swap.requester.name}?</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          sx={{ my: 2 }}
        />
        <TextField
          label="Add a comment (optional)"
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ ml: 1 }}>Submit Feedback</Button>
        </Box>
      </Box>
    </Modal>
  );
};
export default FeedbackModal;