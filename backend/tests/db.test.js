const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

test('database cold starts share a connection, reuse it, and retry failed connections', async () => {
  const originalConnect = mongoose.connect;
  const originalUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'mongodb://example.invalid/test';
  let calls = 0;
  let resolveConnection;
  try {
    mongoose.connect = () => {
      calls++;
      return new Promise(resolve => { resolveConnection = resolve; });
    };
    const first = connectDB();
    const second = connectDB();
    assert.equal(calls, 1);
    resolveConnection(mongoose);
    await Promise.all([first, second]);

    mongoose.connection.readyState = 1;
    await connectDB();
    assert.equal(calls, 1);
    mongoose.connection.readyState = 0;

    mongoose.connect = async () => { calls++; throw new Error('offline'); };
    await assert.rejects(connectDB(), /offline/);
    mongoose.connect = async () => { calls++; return mongoose; };
    await connectDB();
    assert.equal(calls, 3);
  } finally {
    mongoose.connect = originalConnect;
    mongoose.connection.readyState = 0;
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
  }
});
