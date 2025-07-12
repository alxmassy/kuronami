// Import necessary modules
const express = require('express');
const { PrismaClient } = require('@prisma/client'); 
const cors = require('cors');
const prisma = new PrismaClient();
const app = express();
// For authentication
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware'); 

// Middleware
app.use(cors());
app.use(express.json());

// --------- ROUTES --------- 

// To get the current user profile (secured) - GET /api/users/me
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const userFromDb = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                skillsOffered: true,
                skillsWanted: true,
                availability: true,
                isPublic: true,
            }
        });

        if (!userFromDb) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userForFrontend = {
            ...userFromDb,
            skillsOffered: userFromDb.skillsOffered.split(',').filter(skill => skill),
            skillsWanted: userFromDb.skillsWanted.split(',').filter(skill => skill),
        };

        res.json(userForFrontend);
    
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile (secured) - PUT /api/users/me
app.put('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, skillsOffered, skillsWanted, availability, isPublic } = req.body;

        const dataToUpdate = {
            name,
            availability,
            isPublic,
            skillsOffered: Array.isArray(skillsOffered) ? skillsOffered.join(',') : undefined,
            skillsWanted: Array.isArray(skillsWanted) ? skillsWanted.join(',') : undefined
        };

        const updatedUserFromDb = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                skillsOffered: true,
                skillsWanted: true,
                availability: true,
                isPublic: true,
            }
        });

        const userForFrontend = {
            ...updatedUserFromDb,
            skillsOffered: updatedUserFromDb.skillsOffered.split(',').filter(skill => skill),
            skillsWanted: updatedUserFromDb.skillsWanted.split(',').filter(skill => skill),
        };

        res.json(userForFrontend);
    
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});     

// Test route for API -
app.get('/', (req, res) => {
    res.send('Skill Swap API is running');
});

// User registration route - POST api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({where: { email }});
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating User Database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id},
            'YOUR_SECRET_KEY', // Hardcoded for Hackathon
            { expiresIn: '24h' }
        );

        res.status(201).json({token});

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login route - POST api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
            { userId: user.id },
            'YOUR_SECRET_KEY', // Hardcoded for Hackathon
            { expiresIn: '24h' }
        );

        res.status(200).json({ token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (public) - GET /api/users
app.get('/api/users', async (req, res) => {
    try {
        const {skill} = req.query;
        const whereCondition = {
            isPublic: true
        };
        if (skill) {
            whereCondition.skillsOffered = {
                contains: skill,
            };
        }
        const usersFromDb = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                name: true,
                skillsOffered: true,
                skillsWanted: true,
                availability: true,
                isPublic: true,
            }
        });
        const usersForFrontend = usersFromDb.map(user => ({
            ...user,
            skillsOffered: user.skillsOffered.split(',').filter(s => s),
            skillsWanted: user.skillsWanted.split(',').filter(s => s),
        }));
        res.json(usersForFrontend);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new swap request (secured) - POST /api/swaps
app.post('/api/swaps', authenticateToken, async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const { receiverId, skillOfferedByRequester, skillWantedByRequester } = req.body;
    if (requesterId === receiverId) {
      return res.status(400).json({ message: "You cannot create a swap with yourself." });
    }
    // Create the swap request in the database
    const newSwap = await prisma.swap.create({
      data: {
        requesterId,
        receiverId,
        skillOfferedByRequester,
        skillWantedByRequester,
        status: 'pending',
      },
    });
    res.status(201).json(newSwap);
  } catch (error) {
    console.error("Create swap error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all swap requests for the current user (secured) - GET /api/swaps/me
app.get('/api/swaps/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const incomingSwaps = await prisma.swap.findMany({
      where: { receiverId: userId },
      include: { requester: { select: { id: true, name: true } } },
    });
    const outgoingSwaps = await prisma.swap.findMany({
      where: { requesterId: userId },
      include: { receiver: { select: { id: true, name: true } } },
    });
    res.json({incoming: incomingSwaps, outgoing: outgoingSwaps});
  } catch (error) {
    console.error("Get swaps error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Accept or reject a swap request (secured) - PUT /api/swaps/:id
app.put('/api/swaps/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const swapId = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ message: "Invalid status." });
    }
    const swapToUpdate = await prisma.swap.findUnique({ where: { id: swapId } });
    if (!swapToUpdate || swapToUpdate.receiverId !== userId) {
      return res.status(403).json({ message: "Forbidden: You cannot modify this swap." });
    }
    
    // Ensure you can't accept/reject a non-pending swap
    if (swapToUpdate.status !== 'pending') {
        return res.status(400).json({ message: `This swap is already ${swapToUpdate.status}.` });
    }
    const updatedSwap = await prisma.swap.update({
      where: { id: swapId },
      data: { status },
    });
    res.json(updatedSwap);
  } catch (error) {
    console.error("Update swap error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a swap request (secured) - DELETE /api/swaps/:id
app.delete('/api/swaps/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const swapId = parseInt(req.params.id);

    const swapToDelete = await prisma.swap.findUnique({ where: { id: swapId } });

    // SECURITY CHECK: Ensure the current user is the one who made the request
    if (!swapToDelete || swapToDelete.requesterId !== userId) {
      return res.status(403).json({ message: "Forbidden: You cannot delete this swap." });
    }

    // STATUS CHECK: You can only delete pending requests
    if (swapToDelete.status !== 'pending') {
      return res.status(400).json({ message: "Cannot delete a swap that is no longer pending." });
    }

    // Delete the swap
    await prisma.swap.delete({ where: { id: swapId } });

    res.sendStatus(204);
  } catch (error) {
    console.error("Delete swap error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}`);
});
