const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let mongodProcess = null;
const TEST_PORT = 27099;
const TEST_DB_PATH = path.join('/tmp', `medicare_test_db_${Date.now()}`);

const connectTestDB = async () => {
  if (!fs.existsSync(TEST_DB_PATH)) {
    fs.mkdirSync(TEST_DB_PATH, { recursive: true });
  }

  mongodProcess = spawn('/opt/homebrew/bin/mongod', [
    '--dbpath', TEST_DB_PATH,
    '--port', String(TEST_PORT),
    '--bind_ip', '127.0.0.1',
    '--quiet',
  ]);

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout waiting for test MongoDB to start'));
    }, 10000);

    const onData = (data) => {
      const output = data.toString();
      if (output.includes('Waiting for connections') || output.includes('"msg":"Waiting for connections"')) {
        clearTimeout(timer);
        resolve();
      }
    };

    mongodProcess.stdout.on('data', onData);
    mongodProcess.stderr.on('data', onData);
    mongodProcess.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  const uri = `mongodb://127.0.0.1:${TEST_PORT}/medicare_test_db`;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
};

const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (err) {}

  if (mongodProcess) {
    mongodProcess.stdout.destroy();
    mongodProcess.stderr.destroy();
    mongodProcess.kill('SIGINT');
    mongodProcess = null;
  }

  try {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.rmSync(TEST_DB_PATH, { recursive: true, force: true });
    }
  } catch (err) {}
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

module.exports = { connectTestDB, closeTestDB, clearTestDB };
