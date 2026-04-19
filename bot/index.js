require('dotenv').config({ path: __dirname + '/.env' });

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://arka.social';
const USERS_FILE = path.join(__dirname, 'users.json');

const bot = new TelegramBot(TOKEN, { polling: true });

// --- User store ---
function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function addUser(chatId, firstName) {
  const users = loadUsers();
  if (!users[chatId]) {
    users[chatId] = { firstName, joinedAt: new Date().toISOString() };
    saveUsers(users);
    console.log(`+ New user: ${firstName} (${chatId})`);
    return true;
  }
  return false;
}

function getAllChatIds() {
  return Object.keys(loadUsers()).map(Number);
}

// /start command — welcome message with inline button + deep link handling
bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'there';
  const startParam = match[1]?.trim();
  console.log(`/start from ${firstName} (chatId: ${chatId}, param: ${startParam || 'none'})`);

  addUser(chatId, firstName);
  
  // Handle deep link: /start event_EVENT_ID
  if (startParam && startParam.startsWith('event_')) {
    const eventId = startParam.replace('event_', '');
    console.log(`🔗 Deep link to event: ${eventId}`);
    
    bot.sendMessage(chatId,
      `🎉 You've been invited to an event!

Tap the button below to view event details and RSVP.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📍 View Event', web_app: { url: `${WEBAPP_URL}/miniapp/event/${eventId}` } }],
          ],
        },
      }
    );
    return;
  }

  // Normal /start flow
  bot.sendMessage(chatId,
    `Hey ${firstName}! 👋\n\nWelcome to *arka* — real connections, real events.\n\nJoin communities, attend events, earn reputation. All on-chain.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open arka', web_app: { url: `${WEBAPP_URL}/miniapp` } }],
          [{ text: '📖 About', web_app: { url: `${WEBAPP_URL}/about` } }],
        ],
      },
    }
  );

  // Send update notifications after a short delay
  setTimeout(() => {
    bot.sendMessage(chatId, '🎉 *New Event: ETH Budapest Meetup*\nTomorrow, 18:00 · 23 attending\n\n_RSVP to earn reputation!_', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 View Event', web_app: { url: `${WEBAPP_URL}/miniapp/event/mock-eth-budapest` } }],
        ],
      },
    });
  }, 1500);

  setTimeout(() => {
    bot.sendMessage(chatId, '📈 *Weekly Update*\nYour reputation rose *+120* this week!\nYou\'re now *#3* in ETH Budapest.', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏆 View Leaderboard', web_app: { url: `${WEBAPP_URL}/miniapp` } }],
        ],
      },
    });
  }, 3000);
});

// /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `*arka* — Community engagement & reputation\n\n/start — Open arka\n/help — Show this help\n\nTap the menu button or use the button below to open the app.`,
    { parse_mode: 'Markdown' }
  );
});

// Set menu button and commands
async function setup() {
  try {
    await bot.setChatMenuButton({
      menu_button: JSON.stringify({
        type: 'web_app',
        text: 'Open arka',
        web_app: { url: `${WEBAPP_URL}/miniapp` },
      }),
    });
    console.log('✅ Menu button set');

    await bot.setMyCommands([
      { command: 'start', description: 'Welcome & open arka' },
      { command: 'help', description: 'Help & info' },
    ]);
    console.log('✅ Bot commands set');

    const users = loadUsers();
    console.log(`🤖 arka bot running — ${Object.keys(users).length} users — webapp: ${WEBAPP_URL}`);
  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

setup();

// --- Broadcast & notification helpers ---
async function broadcast(text, opts = {}) {
  const ids = getAllChatIds();
  let sent = 0;
  for (const chatId of ids) {
    try {
      await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${chatId}: ${err.message}`);
    }
    // Rate limit: 30 msgs/sec max for TG
    if (ids.length > 20) await new Promise(r => setTimeout(r, 50));
  }
  console.log(`📢 Broadcast sent to ${sent}/${ids.length} users`);
  return sent;
}

async function broadcastWithButton(text, buttonText = '🚀 Open arka', url = WEBAPP_URL) {
  return broadcast(text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: buttonText, web_app: { url } }],
      ],
    },
  });
}

// --- Mingle notification ---
async function notifyMingleStart(eventId, eventName, attendeeUserIds) {
  let sent = 0;
  for (const userId of attendeeUserIds) {
    try {
      await bot.sendMessage(userId, 
        `🎲 Mingle started at *${eventName}*! Find your match!`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open arka', web_app: { url: `${WEBAPP_URL}/miniapp/event/${eventId}` } }],
            ],
          },
        }
      );
      sent++;
    } catch (err) {
      console.error(`Failed to notify ${userId}: ${err.message}`);
    }
    // Rate limit
    if (attendeeUserIds.length > 20) await new Promise(r => setTimeout(r, 50));
  }
  console.log(`📣 Mingle notification sent to ${sent}/${attendeeUserIds.length} users`);
  return sent;
}

module.exports = {
  bot,
  broadcast,
  broadcastWithButton,
  notifyMingleStart,
  notify: (chatId, text, opts = {}) => bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts }),
  notifyWithButton: (chatId, text, buttonText = '🚀 Open arka') => {
    return bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: buttonText, web_app: { url: WEBAPP_URL } }],
        ],
      },
    });
  },
  getAllChatIds,
  loadUsers,
};
