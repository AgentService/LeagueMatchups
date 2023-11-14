// api/auth.mjs
import Debug from 'debug';
import express from 'express';
const debugApi = Debug('api');

const router = express.Router();

// Mock user data
const users = [
  { email: 'user@example.com', password: 'password123', name: 'John Doe' },
];

router.post('/login', (req, res) => {
  debugApi('Login request received');
  const { email, password } = req.body;
  debugApi(`Login request for ${email}`);
  const user = users.find(u => u.email === email && u.password === password);
  debugApi(`User found: ${user}`);
  if (user) {
    // User found and password matches
    debugApi(`Login successful for ${email}`);
    res.json({ message: 'Login successful', user: { name: user.name, email } });
  } else {
    // User not found or password does not match
    debugApi(`Login failed for ${email}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});


export default router;
