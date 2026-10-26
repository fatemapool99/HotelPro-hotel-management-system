const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runSkillWalletTests() {
  console.log('🧪 Starting Official SkillWallet Complete Workflow Verification Tests...\n');

  try {
    // =========================================================================
    // WORKFLOW 1: Visitor → SignUp → Login → UserHome
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 WORKFLOW 1: Visitor → SignUp → Login → UserHome');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1.1 Visitor can explore rooms without logging in
    console.log('1.1 Visitor exploring homepage & rooms catalog without login...');
    const visitorRoomsRes = await fetch(`${BASE_URL}/rooms`);
    const visitorRooms = await visitorRoomsRes.json();
    assert.strictEqual(visitorRoomsRes.status, 200, 'Rooms should be publicly accessible');
    assert.ok(visitorRooms.rooms.length > 0, 'Visitor should see rooms listing');
    console.log(`    ✅ Visitor can explore ${visitorRooms.rooms.length} rooms without authentication.`);

    // 1.2 Test SignUp Validation (password mismatch)
    console.log('1.2 Testing SignUp validation (password mismatch)...');
    const mismatchEmail = `mismatch_${Date.now()}@test.com`;
    const mismatchRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Mismatch',
        email: mismatchEmail,
        phone: '+91 98200 00100',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456!',
      }),
    });
    assert.strictEqual(mismatchRes.status, 400, 'Should reject mismatched passwords');
    console.log('    ✅ Password mismatch validation properly rejected.');

    // 1.3 Test Successful SignUp
    console.log('1.3 Testing User Registration with full required fields...');
    const userEmail = `skillwallet_guest_${Date.now()}@test.com`;
    const userPhone = '+91 98201 34567';
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Deshmukh',
        email: userEmail,
        phone: userPhone,
        password: 'SecurePass@123',
        confirmPassword: 'SecurePass@123',
      }),
    });
    const registerData = await registerRes.json();
    assert.strictEqual(registerRes.status, 201, 'User should be created');
    assert.strictEqual(registerData.success, true);
    assert.strictEqual(registerData.user.role, 'user', 'Public registration must only create ordinary user role');
    assert.strictEqual(registerData.user.phone, userPhone);
    console.log(`    ✅ Ordinary user registered successfully (Role: ${registerData.user.role}, Phone: ${registerData.user.phone}).`);

    // 1.4 Test Login and Role-Based Redirection to UserHome
    console.log('1.4 Testing User Login & Verification for UserHome routing...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'SecurePass@123',
      }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginData.token, 'Should receive valid JWT');
    assert.strictEqual(loginData.user.role, 'user', 'Should confirm role is user for UserHome redirection');
    const userToken = loginData.token;
    console.log(`    ✅ Login successful! Ordinary user is routed to UserHome ("Hi, ${loginData.user.name}").`);

    // =========================================================================
    // WORKFLOW 2: UserHome → View Rooms → Book Room → My Bookings → Cancel Booking
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 WORKFLOW 2: UserHome → View Rooms → Book Room → My Bookings → Cancel Booking');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 2.1 View Available Rooms on UserHome
    console.log('2.1 Retrieving available rooms from MongoDB...');
    const userHomeRoomsRes = await fetch(`${BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const userHomeRooms = await userHomeRoomsRes.json();
    assert.strictEqual(userHomeRoomsRes.status, 200);
    const chosenRoom = userHomeRooms.rooms[0];
    console.log(`    ✅ Retrieved rooms on UserHome. Chosen: "${chosenRoom.title}" (${chosenRoom.roomType}) - $${chosenRoom.pricePerNight}/night`);

    // 2.2 Book Room with dates
    console.log('2.2 Reserving room with check-in, check-out, and guest details...');
    const checkIn = '2026-12-10';
    const checkOut = '2026-12-14';
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        roomId: chosenRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestInfo: {
          fullName: 'Ananya Deshmukh',
          email: userEmail,
          phone: userPhone,
          specialRequests: 'High floor sea view room',
          adults: 2,
          children: 0,
        },
        paymentStatus: 'pay_at_hotel',
      }),
    });
    const bookData = await bookRes.json();
    assert.strictEqual(bookRes.status, 201, 'Booking should be confirmed');
    const bookingId = bookData.booking._id;
    assert.strictEqual(bookData.booking.totalNights, 4);
    assert.strictEqual(bookData.booking.status, 'confirmed');
    assert.strictEqual(bookData.booking.guestInfo.phone, userPhone);
    console.log(`    ✅ Booking created! ID: #${bookingId}, Status: ${bookData.booking.status}, Total: ₹${bookData.booking.totalPrice}`);

    // 2.3 Prevent Overlapping Double-Booking
    console.log('2.3 Verifying overlapping reservation prevention on same room...');
    const doubleBookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        roomId: chosenRoom._id,
        checkInDate: '2026-12-12',
        checkOutDate: '2026-12-16',
        guestInfo: {
          fullName: 'Another Guest',
          email: 'another@example.com',
          phone: '+91 98200 99999',
        },
      }),
    });
    assert.strictEqual(doubleBookRes.status, 409, 'Overlapping booking must be rejected with 409 Conflict');
    console.log('    ✅ Overlapping reservation successfully prevented with 409 Conflict!');

    // 2.4 Verify My Bookings contains the booking details
    console.log('2.4 Retrieving user booking history from My Bookings...');
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const myBookingsData = await myBookingsRes.json();
    assert.strictEqual(myBookingsRes.status, 200);
    const foundBooking = myBookingsData.bookings.find((b) => b._id === bookingId);
    assert.ok(foundBooking, 'Created booking must be present in My Bookings');
    assert.ok(foundBooking.room, 'Room details must be populated');
    assert.strictEqual(foundBooking.guestInfo.phone, userPhone, 'Customer phone number must be displayed');
    console.log(`    ✅ Found booking in My Bookings with customer phone: ${foundBooking.guestInfo.phone}.`);

    // 2.5 Cancel Booking
    console.log('2.5 Cancelling the reservation and updating status in MongoDB...');
    const cancelRes = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelData.booking.status, 'cancelled');
    console.log(`    ✅ Reservation status updated to "${cancelData.booking.status}".`);

    // 2.6 Prevent Repeated Cancellation
    console.log('2.6 Testing prevention of repeated cancellation...');
    const repeatCancelRes = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(repeatCancelRes.status, 400, 'Should reject repeating cancellation');
    console.log('    ✅ Repeated cancellation blocked as expected.');

    // =========================================================================
    // WORKFLOW 3: Admin Login → AdminHome → All Bookings → All Rooms → Add Room → All Users
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 WORKFLOW 3: Admin Login → AdminHome (4 Tabs: Bookings, Rooms, Add Room, Users)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 3.1 Admin Login
    console.log('3.1 Admin Authentication...');
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
    assert.strictEqual(adminLoginData.user.role, 'admin', 'Must be administrator');
    const adminToken = adminLoginData.token;
    console.log(`    ✅ Admin logged in: ${adminLoginData.user.name} (Role: ${adminLoginData.user.role}) routed to AdminHome.`);

    // 3.2 Tab 1: All Bookings
    console.log('3.2 Tab 1: Fetching all user reservations...');
    const allBookingsRes = await fetch(`${BASE_URL}/bookings/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allBookingsData = await allBookingsRes.json();
    assert.strictEqual(allBookingsRes.status, 200);
    assert.ok(allBookingsData.bookings.length > 0);
    console.log(`    ✅ Tab 1 All Bookings: Loaded ${allBookingsData.bookings.length} reservations.`);

    // 3.3 Tab 2: All Rooms
    console.log('3.3 Tab 2: Fetching all rooms stored in MongoDB...');
    const allRoomsRes = await fetch(`${BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allRoomsData = await allRoomsRes.json();
    assert.strictEqual(allRoomsRes.status, 200);
    const initialRoomsCount = allRoomsData.rooms.length;
    console.log(`    ✅ Tab 2 All Rooms: Loaded ${initialRoomsCount} rooms from MongoDB.`);

    // 3.4 Tab 3: Add Room
    console.log('3.4 Tab 3: Adding new room via Admin form and saving to MongoDB...');
    const uniqueRoomNumber = `SW-${Date.now().toString().slice(-4)}`;
    const newRoomPayload = {
      title: 'Royal Sea-View Penthouse Suite',
      roomType: 'Presidential Suite',
      pricePerNight: 26000,
      capacity: { guests: 4, beds: 2, bedType: 'King Bed' },
      size: '980 sq ft',
      description: 'Exclusive penthouse with panoramic Arabian Sea and skyline views, floor-to-ceiling glass, and wrap-around terrace.',
      amenities: ['Arabian Sea View', 'Private Jacuzzi', 'Butler Service', 'High-Speed Wi-Fi', 'Complimentary Breakfast'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
      roomNumber: uniqueRoomNumber,
      floor: 12,
      featured: true,
    };
    const addRoomRes = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newRoomPayload),
    });
    const addRoomData = await addRoomRes.json();
    assert.strictEqual(addRoomRes.status, 201, 'Should create new room in MongoDB');
    console.log(`    ✅ Tab 3 Add Room: Created room "${addRoomData.room.title}" (Suite ${uniqueRoomNumber}) in MongoDB.`);

    // Verify the newly added room now appears in all room listings
    const verifyRoomsRes = await fetch(`${BASE_URL}/rooms`);
    const verifyRoomsData = await verifyRoomsRes.json();
    assert.strictEqual(verifyRoomsData.rooms.length, initialRoomsCount + 1, 'Room count must increase by 1');
    const addedRoomFound = verifyRoomsData.rooms.find((r) => r.roomNumber === uniqueRoomNumber);
    assert.ok(addedRoomFound, 'Newly added room must appear in room catalog');
    console.log('    ✅ Newly added room verified in public room catalog!');

    // 3.5 Tab 4: All Users
    console.log('3.5 Tab 4: Fetching registered users (verifying password protection)...');
    const allUsersRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allUsersData = await allUsersRes.json();
    assert.strictEqual(allUsersRes.status, 200);
    assert.ok(allUsersData.users.length >= 2, 'Should have at least admin and registered users');
    for (const u of allUsersData.users) {
      assert.strictEqual(u.password, undefined, 'Password must NOT be exposed');
      assert.ok(u.name, 'User must have name');
      assert.ok(u.email, 'User must have email');
      assert.ok(u.role, 'User must have role');
    }
    console.log(`    ✅ Tab 4 All Users: Loaded ${allUsersData.users.length} users with zero password exposure.`);

    console.log('\n=========================================================');
    console.log('🎉 ALL SKILLWALLET WORKFLOW REQUIREMENTS VERIFIED & PASSED!');
    console.log('=========================================================\n');
  } catch (err) {
    console.error('\n❌ SkillWallet Workflow Test Failure:', err);
    process.exit(1);
  }
}

runSkillWalletTests();
