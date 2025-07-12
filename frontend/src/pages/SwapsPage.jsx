import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Card, CardContent, CardActions, Button, Chip, Divider } from '@mui/material';
import { getMySwaps, updateSwapStatus, deleteSwap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FeedbackModal from '../components/FeedbackModal';

// Reusable Swap Card Component
const SwapCard = ({ swap, currentUserId, onRespond, onDelete, onLeaveFeedback }) => {
  const isReceiver = swap.receiver.id === currentUserId;
  const isRequester = swap.requester.id === currentUserId;
  const otherUser = isReceiver ? swap.requester : swap.receiver;

  return (
    <Card sx={{ mb: 2, borderLeft: 5, borderColor: swap.status === 'accepted' ? 'success.main' : swap.status === 'pending' ? 'warning.main' : 'error.main' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Swap with {otherUser.name}</Typography>
            <Chip label={swap.status} color={swap.status === 'accepted' ? 'success' : swap.status === 'pending' ? 'warning' : 'error'} size="small" />
        </Box>
        <Typography color="text.secondary">You offer: <strong>{swap.skillOfferedByRequester}</strong></Typography>
        <Typography color="text.secondary">You get: <strong>{swap.skillWantedByRequester}</strong></Typography>
      </CardContent>
      <CardActions>
        {isReceiver && swap.status === 'pending' && (
          <>
            <Button size="small" variant="contained" color="success" onClick={() => onRespond(swap.id, 'accepted')}>Accept</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onRespond(swap.id, 'rejected')}>Reject</Button>
          </>
        )}

        {isRequester && swap.status === 'pending' && (
          <Button size="small" variant="contained" color="error" onClick={() => onDelete(swap.id)}>Delete Request</Button>
        )}

        {swap.status === 'accepted' && (
            <Button size="small" variant="outlined" onClick={() => onLeaveFeedback(swap)}>Leave Feedback</Button>
        )}
      </CardActions>
    </Card>
  );
};
const SwapsPage = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSwapForFeedback, setSelectedSwapForFeedback] = useState(null);


  const fetchSwaps = useCallback(async () => {
    setLoading(true);
    try {
      const fakeApiResponse = [

          {id: 1, status: 'pending', skillOfferedByRequester: 'Baking', skillWantedByRequester: 'Guitar', requester: {id: 'user-456', name: 'Alice'}, receiver: {id: 'mock-user-123', name: 'Test User'}},

          {id: 2, status: 'pending', skillOfferedByRequester: 'Guitar', skillWantedByRequester: 'Photography', requester: {id: 'mock-user-123', name: 'Test User'}, receiver: {id: 'user-789', name: 'Bob'}},

          {id: 3, status: 'accepted', skillOfferedByRequester: 'Cooking', skillWantedByRequester: 'Web Design', requester: {id: 'user-xyz', name: 'Charlie'}, receiver: {id: 'mock-user-123', name: 'Test User'}},

          {id: 4, status: 'rejected', skillOfferedByRequester: 'Guitar', skillWantedByRequester: 'Yoga', requester: {id: 'mock-user-123', name: 'Test User'}, receiver: {id: 'user-abc', name: 'Diana'}},
      ];
      setSwaps(fakeApiResponse);

    } catch (error) {
      console.error("Failed to fetch swaps", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSwaps();
  }, [fetchSwaps]);
  
  const handleOpenFeedbackModal = (swap) => {
    setSelectedSwapForFeedback(swap);
    setFeedbackModalOpen(true);
  };
  const handleCloseFeedbackModal = () => setFeedbackModalOpen(false);

  const handleSubmitFeedback = (swapId, feedbackData) => {
    console.log(`Submitting feedback for swap ${swapId}:`, feedbackData);
  };

  const handleRespond = async (id, status) => {
    // await updateSwapStatus(id, status);
    console.log(`Responding to swap ${id} with status: ${status}`);
    fetchSwaps();
  };

  const handleDelete = async (id) => {
    // await deleteSwap(id);
    console.log(`Deleting swap ${id}`);
    fetchSwaps();
  };

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (!user) return null;

  const incomingRequests = swaps.filter(s => s.receiver.id === user.id && s.status === 'pending');
  const outgoingRequests = swaps.filter(s => s.requester.id === user.id && s.status === 'pending');
  const activeSwaps = swaps.filter(s => s.status === 'accepted');
  const pastSwaps = swaps.filter(s => s.status === 'rejected');

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>My Swaps</Typography>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>Incoming Requests</Typography>
        {incomingRequests.length > 0 ? incomingRequests.map(swap => 
            <SwapCard key={swap.id} swap={swap} currentUserId={user.id} onRespond={handleRespond} />
        ) : <Typography>No new incoming requests.</Typography>}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>Outgoing Requests</Typography>
        {outgoingRequests.length > 0 ? outgoingRequests.map(swap => 
            <SwapCard key={swap.id} swap={swap} currentUserId={user.id} onDelete={handleDelete} />
        ) : <Typography>No pending outgoing requests.</Typography>}
      </Box>
      
      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>Active & Completed Swaps</Typography>
        {activeSwaps.length > 0 ? activeSwaps.map(swap => 
            <SwapCard key={swap.id} swap={swap} currentUserId={user.id} onLeaveFeedback={handleOpenFeedbackModal} />
        ) : <Typography>No active swaps.</Typography>}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>Past & Rejected Swaps</Typography>
        {pastSwaps.length > 0 ? pastSwaps.map(swap => 
            <SwapCard key={swap.id} swap={swap} currentUserId={user.id} />
        ) : <Typography>No rejected swaps.</Typography>}
      </Box>

      <FeedbackModal 
        open={feedbackModalOpen}
        handleClose={handleCloseFeedbackModal}
        swap={selectedSwapForFeedback}
        onSubmitFeedback={handleSubmitFeedback}
      />

    </Container>
  );
};

export default SwapsPage;