require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { notifyMingleStart } = require('./index');

const app = express();
const PORT = 3053;
const EVENTS_FILE = path.join(__dirname, 'events.json');

app.use(express.json());
app.use(cors());

// --- Data storage ---
let events = {};

function loadEvents() {
  try {
    events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
  } catch {
    events = {};
  }
}

function saveEvents() {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

loadEvents();

// --- Helpers ---
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getEvent(id) {
  return events[id];
}

// --- Routes ---

// POST /events — Create event
app.post('/events', (req, res) => {
  const { hostTgId, communityId, name, datetime, location } = req.body;
  
  if (!hostTgId || !name || !datetime || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = generateId();
  events[id] = {
    id,
    hostTgId,
    communityId: communityId || null,
    name,
    datetime,
    location,
    createdAt: new Date().toISOString(),
    attendees: {},  // userId -> { checkedIn: bool, verifications: [], mingles: [] }
    mingleActive: false,
    minglePairs: [],
    ended: false,
  };

  saveEvents();
  console.log(`✨ Event created: ${name} (${id})`);
  res.json({ success: true, event: events[id] });
});

// GET /events/:id — Get event details
app.get('/events/:id', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// POST /events/:id/checkin — User checks in
app.post('/events/:id/checkin', (req, res) => {
  const { userId } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  if (!event.attendees[userId]) {
    event.attendees[userId] = {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      verifications: [],
      mingles: [],
    };
  } else {
    event.attendees[userId].checkedIn = true;
    event.attendees[userId].checkedInAt = new Date().toISOString();
  }

  saveEvents();
  console.log(`✅ Check-in: User ${userId} at event ${event.name}`);
  res.json({ success: true, state: event.attendees[userId] });
});

// POST /events/:id/verify — User verifies with another attendee
app.post('/events/:id/verify', (req, res) => {
  const { userId, verifiedById } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!userId || !verifiedById) return res.status(400).json({ error: 'Missing userId or verifiedById' });
  if (userId === verifiedById) return res.status(400).json({ error: 'Cannot verify with yourself' });

  // Ensure both users are checked in
  if (!event.attendees[userId]?.checkedIn) {
    return res.status(400).json({ error: 'User not checked in' });
  }
  if (!event.attendees[verifiedById]?.checkedIn) {
    return res.status(400).json({ error: 'Verified user not checked in' });
  }

  // Add verification (avoid duplicates)
  if (!event.attendees[userId].verifications.includes(verifiedById)) {
    event.attendees[userId].verifications.push(verifiedById);
  }

  saveEvents();
  console.log(`🤝 Verification: User ${userId} verified by ${verifiedById}`);
  res.json({ success: true, state: event.attendees[userId] });
});

// POST /events/:id/mingle/start — Host starts mingle round
app.post('/events/:id/mingle/start', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Get all checked-in users
  const checkedInUsers = Object.keys(event.attendees).filter(
    uid => event.attendees[uid].checkedIn
  );

  if (checkedInUsers.length < 2) {
    return res.status(400).json({ error: 'Not enough attendees to start mingle' });
  }

  // Shuffle and pair
  const shuffled = [...checkedInUsers].sort(() => Math.random() - 0.5);
  const pairs = [];
  
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    pairs.push({ user1: shuffled[i], user2: shuffled[i + 1], matched: false });
  }

  // If odd number, last person gets a random match from existing pairs
  if (shuffled.length % 2 !== 0) {
    const lastPerson = shuffled[shuffled.length - 1];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    pairs.push({ user1: lastPerson, user2: randomPair.user1, matched: false });
  }

  event.mingleActive = true;
  event.minglePairs = pairs;

  // Assign mingle numbers to users
  pairs.forEach((pair, index) => {
    const num = index + 1;
    event.attendees[pair.user1].currentMingleNum = num;
    event.attendees[pair.user2].currentMingleNum = num;
  });

  saveEvents();
  console.log(`🎲 Mingle started at ${event.name}: ${pairs.length} pairs`);
  
  // Notify all checked-in users
  notifyMingleStart(event.id, event.name, checkedInUsers).catch(err => {
    console.error('Failed to send mingle notifications:', err);
  });
  
  res.json({ success: true, pairs, attendees: checkedInUsers });
});

// POST /events/:id/mingle/scan — User scans their mingle partner
app.post('/events/:id/mingle/scan', (req, res) => {
  const { userId, scannedId } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!event.mingleActive) return res.status(400).json({ error: 'Mingle not active' });
  if (!userId || !scannedId) return res.status(400).json({ error: 'Missing userId or scannedId' });

  const userNum = event.attendees[userId]?.currentMingleNum;
  const scannedNum = event.attendees[scannedId]?.currentMingleNum;

  if (!userNum || !scannedNum) {
    return res.status(400).json({ error: 'Users not in mingle round' });
  }

  if (userNum !== scannedNum) {
    return res.status(400).json({ error: 'Not your mingle match!' });
  }

  // Record mingle completion
  if (!event.attendees[userId].mingles.includes(scannedId)) {
    event.attendees[userId].mingles.push(scannedId);
  }

  // Mark pair as matched
  const pair = event.minglePairs.find(p => 
    (p.user1 === userId && p.user2 === scannedId) ||
    (p.user2 === userId && p.user1 === scannedId)
  );
  if (pair) pair.matched = true;

  saveEvents();
  console.log(`🎉 Mingle match: ${userId} ↔ ${scannedId}`);
  res.json({ success: true, match: true, state: event.attendees[userId] });
});

// POST /events/:id/end — Host ends event
app.post('/events/:id/end', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.ended = true;
  event.endedAt = new Date().toISOString();
  event.mingleActive = false;

  const attendeeCount = Object.keys(event.attendees).filter(uid => event.attendees[uid].checkedIn).length;
  const totalVerifications = Object.values(event.attendees).reduce((sum, a) => sum + a.verifications.length, 0);
  const totalMingles = Object.values(event.attendees).reduce((sum, a) => sum + a.mingles.length, 0);

  saveEvents();
  console.log(`🏁 Event ended: ${event.name}`);
  res.json({
    success: true,
    summary: {
      attendees: attendeeCount,
      verifications: totalVerifications,
      mingles: totalMingles,
    },
  });
});

// GET /events/:id/state/:userId — Get user's event state
app.get('/events/:id/state/:userId', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const state = event.attendees[req.params.userId] || {
    checkedIn: false,
    verifications: [],
    mingles: [],
  };

  res.json({
    ...state,
    isHost: event.hostTgId === req.params.userId,
    mingleActive: event.mingleActive,
    currentMingleNum: state.currentMingleNum || null,
    ended: event.ended,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Events API running on port ${PORT}`);
});
