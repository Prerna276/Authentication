/* eslint-disable linebreak-style */
const express = require('express');
const multer = require('multer'); 
const authenicate = express.Router();
const User = require('../models/user.model');
const upload = multer({ dest: 'uploads/' });
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;


authenicate.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const user = new User({ username, password });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Login
  authenicate.post('/login', async (req, res) => {
    try {
      const { username} = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        await User.updateOne({username}, {isLoggedIn: true})
        return res.status(200).json({ message: 'Sucessfully logged in' });
      }
      res.status(500).json({ message: 'UserName or password is incorrect' });
      
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Logout
  authenicate.post('/logout', async(req, res) => {
    //this should be handled from UI mostly
    await User.updateOne({username}, {isLoggedIn: false})
    res.status(200).json({ message: 'Logged out successfully' });
  });
  
  // Get profile details
  authenicate.get('/profile', async(req, res) => {
    //this should be handled from UI mostly
    const { username} = req.body;
    const User = await User.findOne({ username }).select('-password');
    if (existingUser) {
        return res.status(200).json({ data: User });
    }
    res.status(500).json({ message: 'Profile not found' });
  });
  
  // Edit profile
  authenicate.put('/profile/update', async (req, res) => {
    try {
      const { name, bio, phone, email, password, public } = req.body;
      const user = req.user;
      if (name) user.name = name;
      if (bio) user.bio = bio;
      if (phone) user.phone = phone;
      if (email) user.email = email;
      if (password) user.password = password;
      if (public !== undefined) user.public = public; // Set profile visibility
      await user.save();
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get public profiles
  authenicate.get('/public-profiles', async (req, res) => {
    try {
      const publicProfiles = await User.find({ public: true }).select('-password');
      res.status(200).json({ publicProfiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user profile by ID (admin only)
  authenicate.get('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.public || req.user.isAdmin) {
        return res.status(200).json({ user });
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
authenicate.post('/upload-photo',  upload.single('photo'), async (req, res) => {
    try {
      const { photoUrl } = req.body;
      const user = req.user;
  
      // Update user's photo URL
      user.photoUrl = photoUrl;
      await user.save();
  
      res.status(200).json({ message: 'Photo uploaded successfully', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Logic to handle Google authentication
    // Check if user exists in database or create a new user
    User.findOne({ googleId: profile.id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value
        });
        newUser.save((err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }
    });
  }));
  
  // Configure Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_authenicate_ID,
    clientSecret: FACEBOOK_authenicate_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // Logic to handle Facebook authentication
    // Check if user exists in database or create a new user
    User.findOne({ facebookId: profile.id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          facebookId: profile.id,
          displayName: profile.displayName,
          email: profile.emails ? profile.emails[0].value : null
        });
        newUser.save((err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }
    });
  }));
  
  // Configure Twitter Strategy
  passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  (accessToken, tokenSecret, profile, done) => {
    // Logic to handle Twitter authentication
    // Check if user exists in database or create a new user
    User.findOne({ twitterId: profile.id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          twitterId: profile.id,
          displayName: profile.displayName
        });
        newUser.save((err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }
    });
  }));
  
  // Configure GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Logic to handle GitHub authentication
    // Check if user exists in database or create a new user
    User.findOne({ githubId: profile.id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          githubId: profile.id,
          displayName: profile.displayName,
          email: profile.emails ? profile.emails[0].value : null
        });
        newUser.save((err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }
    });
  }));
  
  // Route for Google authentication
  authenicate.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  // Route for handling Google callback
  authenicate.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect to profile page or return JWT token
      res.redirect('/profile');
    });

    
module.exports = authenicate;