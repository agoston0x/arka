const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, 'events.json');

// Create mock event
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(18, 0, 0, 0);

const mockEvent = {
  id: 'mock-eth-budapest',
  hostTgId: '6515296517',
  communityId: null,
  name: 'ETH Budapest Meetup',
  datetime: tomorrow.toISOString(),
  location: 'Central Budapest - TBD',
  createdAt: new Date().toISOString(),
  attendees: {},
  mingleActive: false,
  minglePairs: [],
  ended: false,
};

const events = {
  'mock-eth-budapest': mockEvent,
};

fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
console.log('✅ Mock event created: ETH Budapest Meetup');
console.log(`   Event ID: mock-eth-budapest`);
console.log(`   Host: Agoston (6515296517)`);
console.log(`   Date: ${tomorrow.toLocaleString()}`);
