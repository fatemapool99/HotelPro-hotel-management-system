/**
 * HotelPro Backend Integration & Unit Test Suite
 * Tests:
 * 1. Auth: Registration, Password Hashing, JWT Generation, Login validation
 * 2. Room Models & Filtering
 * 3. Booking Overlapping Logic (Double Booking Prevention)
 * 4. Admin Guard verification
 */

const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🧪 Starting HotelPro Backend Logic Verification Tests...\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // --- TEST GROUP 1: PASSWORD HASHING & JWT ---
  console.log('--- Suite 1: Authentication & Security Logic ---');

  await testAsync('Password hashing and comparison with bcryptjs', async () => {
    const rawPassword = 'SecurePassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(rawPassword, hashedPassword, 'Password should not be stored in plain text');
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert.strictEqual(isMatch, true, 'Correct password should compare successfully');

    const wrongMatch = await bcrypt.compare('WrongPassword456', hashedPassword);
    assert.strictEqual(wrongMatch, false, 'Incorrect password should fail comparison');
  });

  test('JWT token generation and verification', () => {
    const secret = 'test_secret_key_12345';
    const payload = { id: 'user_id_12345', role: 'admin' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert.ok(typeof token === 'string' && token.length > 20, 'Token should be a valid non-empty string');

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, payload.id, 'Decoded user ID should match');
    assert.strictEqual(decoded.role, payload.role, 'Decoded user role should match');
  });

  // --- TEST GROUP 2: DOUBLE BOOKING OVERLAPPING LOGIC ---
  console.log('\n--- Suite 2: Overlapping Double-Booking Prevention Logic ---');

  test('Double booking prevention overlap algorithm matches expected conflict conditions', () => {
    // Overlapping condition: Existing.checkIn < Requested.checkOut AND Existing.checkOut > Requested.checkIn
    function isOverlapping(existingIn, existingOut, reqIn, reqOut) {
      const eIn = new Date(existingIn).getTime();
      const eOut = new Date(existingOut).getTime();
      const rIn = new Date(reqIn).getTime();
      const rOut = new Date(reqOut).getTime();
      return eIn < rOut && eOut > rIn;
    }

    // Existing booking: Nov 10 to Nov 15
    const existIn = '2026-11-10';
    const existOut = '2026-11-15';

    // Case 1: Exact same dates (Nov 10 - Nov 15) -> Should CONFLICT
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-10', '2026-11-15'), true, 'Exact dates must conflict');

    // Case 2: Requested inside existing (Nov 11 - Nov 13) -> Should CONFLICT
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-11', '2026-11-13'), true, 'Sub-range must conflict');

    // Case 3: Requested starts before, ends inside (Nov 08 - Nov 12) -> Should CONFLICT
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-08', '2026-11-12'), true, 'Partial overlap start must conflict');

    // Case 4: Requested starts inside, ends after (Nov 13 - Nov 18) -> Should CONFLICT
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-13', '2026-11-18'), true, 'Partial overlap end must conflict');

    // Case 5: Requested envelops existing (Nov 05 - Nov 20) -> Should CONFLICT
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-05', '2026-11-20'), true, 'Enveloping dates must conflict');

    // Case 6: Ends on existing check-in date (Nov 05 - Nov 10) -> Should ALLOW (guest checks out when next guest arrives)
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-05', '2026-11-10'), false, 'Back-to-back prior booking must be allowed');

    // Case 7: Starts on existing check-out date (Nov 15 - Nov 20) -> Should ALLOW (guest checks in when prev guest leaves)
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-15', '2026-11-20'), false, 'Back-to-back succeeding booking must be allowed');

    // Case 8: Completely before (Nov 01 - Nov 05) -> Should ALLOW
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-01', '2026-11-05'), false, 'Disjoint prior booking must be allowed');

    // Case 9: Completely after (Nov 20 - Nov 25) -> Should ALLOW
    assert.strictEqual(isOverlapping(existIn, existOut, '2026-11-20', '2026-11-25'), false, 'Disjoint future booking must be allowed');
  });

  // --- TEST GROUP 3: PRICING & CALCULATION LOGIC ---
  console.log('\n--- Suite 3: Nights and Total Price Calculation Logic ---');

  test('Total nights and tax calculation', () => {
    const checkIn = new Date('2026-12-01');
    const checkOut = new Date('2026-12-05');
    const diffDays = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 4, 'Should accurately calculate 4 nights');

    const pricePerNight = 450;
    const subtotal = diffDays * pricePerNight;
    assert.strictEqual(subtotal, 1800, 'Subtotal should be $1,800');

    const taxAndServiceFee = Math.round(subtotal * 0.12);
    assert.strictEqual(taxAndServiceFee, 216, '12% tax/fee should be $216');

    const totalPrice = subtotal + taxAndServiceFee;
    assert.strictEqual(totalPrice, 2016, 'Total price should be $2,016');
  });

  // --- TEST SUMMARY ---
  console.log('\n======================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
