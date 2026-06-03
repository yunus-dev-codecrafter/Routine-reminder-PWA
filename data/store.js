const fs = require('fs').promises;
const path = require('path');

const ROUTINES_FILE = path.join(__dirname, 'routines.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'subscriptions.json');

async function ensureFile(filePath) {
  try {
    // If file exists, do nothing
    await fs.access(filePath);
  } catch (err) {
    // File doesn't exist — initialize with empty array
    try {
      await fs.writeFile(filePath, '[]', { encoding: 'utf8' });
    } catch (writeErr) {
      console.error(`Failed to initialize ${filePath}:`, writeErr.message);
      // swallow to avoid crashing the process
    }
  }
}

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, { encoding: 'utf8' });
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err.message);
    return [];
  }
}

async function writeJsonArray(filePath, arr) {
  try {
    if (!Array.isArray(arr)) throw new Error('Data must be an array');
    const tmp = JSON.stringify(arr, null, 2);
    await fs.writeFile(filePath, tmp, { encoding: 'utf8' });
    return true;
  } catch (err) {
    console.error(`Failed to write ${filePath}:`, err.message);
    return false;
  }
}

module.exports = {
  init: async function init() {
    await ensureFile(ROUTINES_FILE);
    await ensureFile(SUBSCRIPTIONS_FILE);
  },

  // Routines
  getRoutines: async function () {
    return readJsonArray(ROUTINES_FILE);
  },
  saveRoutines: async function (arr) {
    return writeJsonArray(ROUTINES_FILE, arr);
  },

  // Subscriptions
  getSubscriptions: async function () {
    return readJsonArray(SUBSCRIPTIONS_FILE);
  },
  saveSubscriptions: async function (arr) {
    return writeJsonArray(SUBSCRIPTIONS_FILE, arr);
  },
};
