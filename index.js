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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}`);
});
