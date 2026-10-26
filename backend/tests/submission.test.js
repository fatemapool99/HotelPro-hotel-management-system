const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
require('dotenv').config();

test('registration, permissions, capacity, concurrent reservations and cancellation', { skip: process.env.RUN_DB_TESTS !== 'true' }, async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  const app = require('../src/server');
  const User = require('../src/models/User');
  const Room = require('../src/models/Room');
  const Booking = require('../src/models/Booking');
  // All fixtures live in a separate uniquely named database.
  await mongoose.connect(process.env.MONGODB_URI, { dbName: `hotelpro_check_${crypto.randomUUID().replaceAll('-', '')}`, serverSelectionTimeoutMS: 8000 });
  let server;
  try {
    await Promise.all([User.init(), Room.init(), Booking.init()]);
    server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function call(route, method = 'GET', body, token) {
      const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
      return { status: response.status, data: await response.json() };
    }
    const credentials = { name: 'Submission Test', email: 'submission@example.com', phone: '9999999999', password: 'UniqueTestPassword123!', confirmPassword: 'UniqueTestPassword123!' };
    assert.equal((await call('/auth/register', 'POST', { ...credentials, role: 'admin' })).status, 201);
    const login = await call('/auth/login', 'POST', credentials);
    assert.equal(login.status, 200);
    assert.equal(login.data.user.role, 'user');
    assert.equal(login.data.user.password, undefined);
    const token = login.data.token;
    assert.equal((await call('/auth/users')).status, 401);
    assert.equal((await call('/auth/users', 'GET', null, token)).status, 403);
    const room = await Room.create({ title: 'Test Room', roomNumber: 'TEST-1', pricePerNight: 5400, capacity: { guests: 2 }, description: 'Test fixture', images: ['https://example.com/room.jpg'] });
    const request = { roomId: room.id, checkInDate: '2035-04-01', checkOutDate: '2035-04-03', guestInfo: { fullName: 'Submission Test', email: credentials.email, phone: credentials.phone, adults: 2, children: 0 }, paymentStatus: 'paid' };
    assert.equal((await call('/bookings', 'POST', { ...request, guestInfo: { ...request.guestInfo, adults: 3 } }, token)).status, 400);
    assert.equal((await call('/bookings', 'POST', { ...request, guestInfo: { ...request.guestInfo, adults: -1 } }, token)).status, 400);
    const results = await Promise.all(Array.from({ length: 6 }, () => call('/bookings', 'POST', request, token)));
    assert.equal(results.filter(r => r.status === 201).length, 1);
    assert.equal(results.filter(r => r.status === 409).length, 5);
    const booking = results.find(r => r.status === 201).data.booking;
    assert.equal(booking.totalPrice, 12096);
    assert.equal(booking.paymentStatus, 'pending');
    assert.equal((await call(`/bookings/${booking._id}/cancel`, 'PUT', {}, token)).status, 200);
    assert.equal((await call('/bookings', 'POST', request, token)).status, 201);
    assert.equal((await call('/bookings', 'POST', { ...request, checkInDate: '2035-04-03', checkOutDate: '2035-04-04' }, token)).status, 201);
    const user = await User.findOne({ email: credentials.email });
    user.role = 'admin'; await user.save();
    assert.equal((await call(`/bookings/admin/${booking._id}/status`, 'PUT', { status: 'confirmed' }, token)).status, 400);
    assert.equal((await call('/bookings/my-bookings', 'GET', null, token)).data.count, 3);
    await User.deleteOne({ _id: user._id });
    assert.equal((await call('/auth/me', 'GET', null, token)).status, 401);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await Promise.all([User.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({})]);
    await mongoose.disconnect();
  }
});
