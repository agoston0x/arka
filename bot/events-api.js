require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const { notifyMingleStart } = require('./index');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const PORT = 3053;
const EVENTS_FILE = path.join(__dirname, 'events.json');

app.use(express.json());
app.use(cors());

// WebSocket connection management
const eventConnections = new Map(); // eventId -> Set of WebSocket clients

wss.on('connection', (ws, req, eventId) => {
  if (!eventConnections.has(eventId)) {
    eventConnections.set(eventId, new Set());
  }
  eventConnections.get(eventId).add(ws);
  
  console.log(`📡 WebSocket connected to event ${eventId}`);
  
  ws.on('close', () => {
    const clients = eventConnections.get(eventId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        eventConnections.delete(eventId);
      }
    }
    console.log(`📡 WebSocket disconnected from event ${eventId}`);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Broadcast to all clients connected to an event
function broadcastToEvent(eventId, message) {
  const clients = eventConnections.get(eventId);
  if (!clients) return;
  
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  const match = pathname.match(/^\/ws\/event\/([^\/]+)\/chat$/);
  
  if (match) {
    const eventId = match[1];
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, eventId);
    });
  } else {
    socket.destroy();
  }
});

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
  const { hostTgId, hostAddress, communityId, name, datetime, location, ephemeral } = req.body;
  
  // Accept either hostTgId OR hostAddress
  if ((!hostTgId && !hostAddress) || !name || !datetime || !location) {
    return res.status(400).json({ error: 'Missing required fields (need hostTgId or hostAddress)' });
  }

  const id = generateId();
  // Auto-check-in the host
  const hostId = hostTgId || hostAddress;
  const attendees = {};
  if (hostId) {
    attendees[hostId] = { checkedIn: true, checkedInAt: new Date().toISOString(), verifications: [], mingles: [], isHost: true };
  }

  events[id] = {
    id,
    hostTgId: hostTgId || null,
    hostAddress: hostAddress || null,
    communityId: communityId || null,
    name,
    datetime,
    location,
    ephemeral: ephemeral || false,
    createdAt: new Date().toISOString(),
    attendees,
    mingleActive: false,
    minglePairs: [],
    ended: false,
    chatMessages: [],
    poll: null,
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
  const { userId, userAddress } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const userKey = userId || userAddress;
  if (!userKey) return res.status(400).json({ error: 'Missing userId or userAddress' });

  if (!event.attendees[userKey]) {
    event.attendees[userKey] = {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      verifications: [],
      mingles: [],
    };
  } else {
    event.attendees[userKey].checkedIn = true;
    event.attendees[userKey].checkedInAt = new Date().toISOString();
  }

  saveEvents();
  console.log(`✅ Check-in: User ${userKey} at event ${event.name}`);
  res.json({ success: true, state: event.attendees[userKey] });
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
app.post('/events/:id/end', async (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.ended = true;
  event.endedAt = new Date().toISOString();
  event.mingleActive = false;
  
  // If ephemeral, delete data instead of archiving
  if (event.ephemeral) {
    console.log(`⚡ Ephemeral event ${event.name} ended — data will be deleted`);
    delete events[event.id];
    saveEvents();
    return res.json({
      success: true,
      ephemeral: true,
      message: 'Ephemeral event data deleted',
    });
  }

  const attendeeCount = Object.keys(event.attendees).filter(uid => event.attendees[uid].checkedIn).length;
  const totalVerifications = Object.values(event.attendees).reduce((sum, a) => sum + a.verifications.length, 0);
  const totalMingles = Object.values(event.attendees).reduce((sum, a) => sum + a.mingles.length, 0);

  // Archive to Arweave
  let arweaveTxId = null;
  let encryptionKey = null;
  
  try {
    const archiveData = {
      event: {
        id: event.id,
        name: event.name,
        datetime: event.datetime,
        location: event.location,
        createdAt: event.createdAt,
        endedAt: event.endedAt,
      },
      attendees: event.attendees,
      chatMessages: event.chatMessages || [],
      poll: event.poll,
      minglePairs: event.minglePairs,
      summary: {
        attendees: attendeeCount,
        verifications: totalVerifications,
        mingles: totalMingles,
      },
    };

    // Generate encryption key
    encryptionKey = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    
    let encrypted = cipher.update(JSON.stringify(archiveData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const encryptedBlob = JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
    });

    // Try Irys upload (devnet)
    try {
      const Irys = require('@irys/sdk').default;
      const irys = new Irys({
        url: 'https://devnet.irys.xyz',
        token: 'ethereum',
        key: process.env.IRYS_PRIVATE_KEY || crypto.randomBytes(32).toString('hex'),
      });
      
      const receipt = await irys.upload(encryptedBlob, {
        tags: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'App-Name', value: 'Arka' },
          { name: 'Event-Id', value: event.id },
        ],
      });
      
      arweaveTxId = receipt.id;
      console.log(`📦 Uploaded to Arweave: ${arweaveTxId}`);
    } catch (irysError) {
      console.error('Irys upload failed, using mock:', irysError.message);
      // Fallback: save locally and use mock TX ID
      const archivePath = path.join(__dirname, `archive-${event.id}.json`);
      fs.writeFileSync(archivePath, encryptedBlob);
      arweaveTxId = `MOCK_${crypto.randomBytes(16).toString('hex')}`;
      console.log(`📦 Archived locally: ${archivePath} (mock TX: ${arweaveTxId})`);
    }
  } catch (error) {
    console.error('Archive failed:', error);
  }

  event.arweaveTxId = arweaveTxId;
  event.encryptionKey = encryptionKey;

  saveEvents();
  console.log(`🏁 Event ended: ${event.name}`);
  res.json({
    success: true,
    summary: {
      attendees: attendeeCount,
      verifications: totalVerifications,
      mingles: totalMingles,
    },
    arweaveTxId,
    encryptionKey,
  });
});

// GET /events/:id/state/:userId — Get user's event state (accepts userId or userAddress)
app.get('/events/:id/state/:userId', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const userKey = req.params.userId;
  const state = event.attendees[userKey] || {
    checkedIn: false,
    verifications: [],
    mingles: [],
  };

  res.json({
    ...state,
    isHost: event.hostTgId === userKey || event.hostAddress === userKey,
    mingleActive: event.mingleActive,
    currentMingleNum: state.currentMingleNum || null,
    ended: event.ended,
  });
});

// POST /events/:id/join — Auto-join event (for deep link flow)
app.post('/events/:id/join', (req, res) => {
  const { userId, userAddress } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const userKey = userId || userAddress;
  if (!userKey) return res.status(400).json({ error: 'Missing userId or userAddress' });

  if (!event.attendees[userKey]) {
    event.attendees[userKey] = {
      checkedIn: false,
      joined: true,
      joinedAt: new Date().toISOString(),
      verifications: [],
      mingles: [],
    };
  } else {
    event.attendees[userKey].joined = true;
    event.attendees[userKey].joinedAt = new Date().toISOString();
  }

  saveEvents();
  console.log(`🎫 User ${userKey} joined event ${event.name}`);
  res.json({ success: true, state: event.attendees[userKey] });
});

// POST /events/:id/mingle/quick — Quick mingle scan (no mingle round needed)
app.post('/events/:id/mingle/quick', (req, res) => {
  const { userId, partnerId } = req.body;
  const event = getEvent(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!userId || !partnerId) return res.status(400).json({ error: 'Missing userId or partnerId' });

  // Auto-join both users if not already
  for (const uid of [userId, partnerId]) {
    if (!event.attendees[uid]) {
      event.attendees[uid] = { checkedIn: true, checkedInAt: new Date().toISOString(), joined: true, verifications: [], mingles: [], rep: 0 };
    }
    if (!event.attendees[uid].rep) event.attendees[uid].rep = 0;
  }

  // Record mingle
  if (!event.attendees[userId].mingles.includes(partnerId)) {
    event.attendees[userId].mingles.push(partnerId);
    event.attendees[userId].rep = (event.attendees[userId].rep || 0) + 50;
  }
  if (!event.attendees[partnerId].mingles.includes(userId)) {
    event.attendees[partnerId].mingles.push(userId);
    event.attendees[partnerId].rep = (event.attendees[partnerId].rep || 0) + 50;
  }

  saveEvents();
  console.log(`🤝 Quick mingle: ${userId} ↔ ${partnerId} (+50 rep each)`);
  res.json({
    success: true,
    userRep: event.attendees[userId].rep,
    partnerRep: event.attendees[partnerId].rep,
    attendeeCount: Object.keys(event.attendees).length,
  });
});

// POST /events/:id/chat — Send chat message
app.post('/events/:id/chat', (req, res) => {
  const { userId, username, text } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!userId || !text) return res.status(400).json({ error: 'Missing userId or text' });

  const message = {
    type: 'chat',
    userId,
    username: username || 'Anonymous',
    text,
    timestamp: new Date().toISOString(),
  };

  if (!event.chatMessages) event.chatMessages = [];
  event.chatMessages.push(message);
  saveEvents();

  // Broadcast to all connected clients
  broadcastToEvent(event.id, message);
  
  console.log(`💬 Chat message in ${event.name}: ${username}: ${text}`);
  res.json({ success: true, message });
});

// GET /events/:id/chat — Get chat history
app.get('/events/:id/chat', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ messages: event.chatMessages || [] });
});

// POST /events/:id/poll — Create poll
app.post('/events/:id/poll', (req, res) => {
  const { question, options } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }

  event.poll = {
    question,
    options: options.map((opt, i) => ({ id: i, text: opt, votes: [] })),
    createdAt: new Date().toISOString(),
  };
  saveEvents();

  // Broadcast to all connected clients
  broadcastToEvent(event.id, { type: 'poll_created', poll: event.poll });
  
  // Notify checked-in attendees via Telegram
  const checkedInUsers = Object.keys(event.attendees).filter(
    uid => event.attendees[uid].checkedIn
  );
  
  console.log(`📊 Poll created in ${event.name}: ${question}`);
  res.json({ success: true, poll: event.poll });
});

// POST /events/:id/poll/vote — Vote in poll
app.post('/events/:id/poll/vote', (req, res) => {
  const { userId, optionIndex } = req.body;
  const event = getEvent(req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!event.poll) return res.status(404).json({ error: 'No active poll' });
  if (userId === undefined || optionIndex === undefined) {
    return res.status(400).json({ error: 'Missing userId or optionIndex' });
  }

  const option = event.poll.options[optionIndex];
  if (!option) return res.status(400).json({ error: 'Invalid option index' });

  // Remove any existing vote from this user
  event.poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(v => v !== userId);
  });

  // Add new vote
  option.votes.push(userId);
  saveEvents();

  // Broadcast updated results
  broadcastToEvent(event.id, { type: 'poll_updated', poll: event.poll });
  
  console.log(`📊 Poll vote in ${event.name}: User ${userId} voted for option ${optionIndex}`);
  res.json({ success: true, poll: event.poll });
});

// GET /events/:id/poll — Get poll results
app.get('/events/:id/poll', (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!event.poll) return res.status(404).json({ error: 'No active poll' });
  res.json({ poll: event.poll });
});

// POST /communities — Create community
app.post('/communities', (req, res) => {
  const { name, description, location, creatorAddress } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  
  console.log(`🏘️ Community created: ${name} by ${creatorAddress}`);
  res.json({ success: true, community: { name, description, location, creatorAddress } });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Events API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}/ws/event/:eventId/chat`);
});
