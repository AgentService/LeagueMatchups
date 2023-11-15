// api/auth.mjs
import Debug from 'debug';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';

const debugApi = Debug('api');

const users = [
  { email: 'user@example.com', password: 'password123', name: 'John Doe' },
];

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  (email, password, done) => {
    debugApi(`Received email: ${email}, password: ${password}`);

    // Directly check hardcoded credentials
    if (email === 'user@example.com' && password === 'password123') {
      debugApi('Hardcoded credentials matched');
      return done(null, { email: 'user@example.com', name: 'John Doe' });
    } else {
      debugApi('Hardcoded credentials did not match');
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));

const router = express.Router();

// Mock user data



// Example server-side login route
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const user = req.user; // Your authenticated user
  const token = jwt.sign({ id: user.id }, 'your JWT secret', { expiresIn: '1h' });

  // Send both the user and the token in the response
  res.json({ user, token });
});

export default router;
