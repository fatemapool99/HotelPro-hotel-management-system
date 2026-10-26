const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runLiveE2ETest() {
  console.log('🚀 Running Live HotelPro End-to-End System Tests against live backend & MongoDB...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'online');
    console.log('   ✅ Backend health check passed.');

    // 2. Room Listings
    console.log('\n2️⃣ Testing Room Listings...');
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    assert.strictEqual(roomsRes.status, 200);
    assert.ok(roomsData.rooms.length >= 8, 'Should have at least 8 rooms from seed');
    const testRoom = roomsData.rooms[0];
    console.log(`   ✅ Fetched ${roomsData.rooms.length} luxury rooms. Testing with: "${testRoom.title}" ($${testRoom.pricePerNight}/night)`);

    // 3. User Registration
    console.log('\n3️⃣ Testing User Registration...');
    const uniqueEmail = `guest_${Date.now()}@test.com`;
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Seraphina Vance',
        email: uniqueEmail,
        password: 'Password@123',
        phone: '+1 (555) 998-1122',
      }),
    });
    const registerData = await registerRes.json();
    assert.strictEqual(registerRes.status, 201);
    assert.ok(registerData.token, 'Should return JWT token');
    assert.strictEqual(registerData.user.email, uniqueEmail);
    console.log(`   ✅ User registered successfully with email: ${uniqueEmail}`);

    // 4. User Login
    console.log('\n4️⃣ Testing User Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginData.token, 'Should return valid JWT on login');
    const guestToken = loginData.token;
    console.log('   ✅ Login successful and JWT token acquired.');

    // 5. Check Room Availability
    console.log('\n5️⃣ Testing Check Room Availability...');
    const checkIn = '2026-11-20';
    const checkOut = '2026-11-24';
    const availRes = await fetch(`${BASE_URL}/rooms/${testRoom._id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
    const availData = await availRes.json();
    assert.strictEqual(availRes.status, 200);
    assert.strictEqual(availData.isAvailable, true, 'Room should be initially available for Nov 20-24');
    console.log('   ✅ Availability verification confirmed: Room is available.');

    // 6. Create Room Booking
    console.log('\n6️⃣ Testing Room Booking Flow...');
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestInfo: {
          fullName: 'Seraphina Vance',
          email: uniqueEmail,
          phone: '+1 (555) 998-1122',
          specialRequests: 'Oceanfront champagne welcome requested.',
          adults: 2,
          children: 0,
        },
        paymentStatus: 'paid',
      }),
    });
    const bookingData = await bookingRes.json();
    assert.strictEqual(bookingRes.status, 201);
    assert.strictEqual(bookingData.booking.totalNights, 4);
    const expectedSubtotal = 4 * testRoom.pricePerNight;
    const expectedTotal = expectedSubtotal + Math.round(expectedSubtotal * 0.12);
    assert.strictEqual(bookingData.booking.totalPrice, expectedTotal);
    const createdBookingId = bookingData.booking._id;
    console.log(`   ✅ Booking confirmed! Ref ID: #${createdBookingId} (Total: $${expectedTotal} for 4 nights).`);

    // 7. Test Double-Booking Prevention
    console.log('\n7️⃣ Testing Overlapping Double-Booking Prevention...');
    // Attempt to book overlapping dates: Nov 22 - Nov 26
    const conflictRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkInDate: '2026-11-22',
        checkOutDate: '2026-11-26',
        guestInfo: {
          fullName: 'Another Guest',
          email: 'conflict@test.com',
          phone: '+1 (555) 000-0000',
        },
      }),
    });
    assert.strictEqual(conflictRes.status, 409, 'Overlapping booking must return 409 Conflict');
    const conflictData = await conflictRes.json();
    console.log(`   ✅ Double booking successfully prevented! Message: "${conflictData.message}"`);

    // 8. Test My Bookings
    console.log('\n8️⃣ Testing "My Bookings" Retrieval...');
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    const myBookingsData = await myBookingsRes.json();
    assert.strictEqual(myBookingsRes.status, 200);
    assert.strictEqual(myBookingsData.bookings.length, 1);
    assert.strictEqual(myBookingsData.bookings[0]._id, createdBookingId);
    console.log('   ✅ User bookings list retrieved successfully.');

    // 9. Test Cancel Booking
    console.log('\n9️⃣ Testing Reservation Cancellation...');
    const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelData.booking.status, 'cancelled');
    console.log('   ✅ Reservation cancellation verified successfully.');

    // 10. Test Admin Authentication & Dashboard
    console.log('\n🔟 Testing Admin Authentication & Dashboard Operations...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hotelpro.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginData.user.role, 'admin');

    const adminStatsRes = await fetch(`${BASE_URL}/bookings/admin/stats`, {
      headers: { Authorization: `Bearer ${adminLoginData.token}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert.strictEqual(adminStatsRes.status, 200);
    assert.ok(adminStatsData.stats.totalRooms >= 8);
    console.log(`   ✅ Admin dashboard verified! Active rooms: ${adminStatsData.stats.totalRooms}, Total bookings: ${adminStatsData.stats.totalBookings}`);

    console.log('\n🎉 ALL LIVE END-TO-END TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (err) {
    console.error('\n❌ E2E Test Failed:', err);
    process.exit(1);
  }
}

runLiveE2ETest();
