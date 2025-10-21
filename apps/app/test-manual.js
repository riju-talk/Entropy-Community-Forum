#!/usr/bin/env node

/**
 * Manual test script for Entropy Community Forum
 * Tests: Auth flows, doubts creation, AI agent, credits system
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = { statusCode: res.statusCode, body: JSON.parse(body) };
          resolve(response);
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test 1: Check if server is running
async function testServerHealth() {
  console.log('\n🧪 Test 1: Server Health Check');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      return true;
    } else {
      console.log('❌ Server not responding');
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return false;
  }
}

// Test 2: Test communities API
async function testCommunitiesAPI() {
  console.log('\n🧪 Test 2: Communities API');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/communities',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Communities API working - Found ${response.body.length} communities`);
      return true;
    } else {
      console.log('❌ Communities API failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Communities API error:', error.message);
    return false;
  }
}

// Test 3: Test doubts API (GET)
async function testDoubtsAPI() {
  console.log('\n🧪 Test 3: Doubts API (GET)');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/doubts',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Doubts API working - Found ${response.body.length} doubts`);
      return true;
    } else {
      console.log('❌ Doubts API failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Doubts API error:', error.message);
    return false;
  }
}

// Test 4: Test AI Agent API (requires auth token)
async function testAIAgentAPI(authToken) {
  console.log('\n🧪 Test 4: AI Agent API');
  try {
    // First create a test doubt
    const createDoubtResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/doubts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      title: 'Test Question for AI',
      content: 'This is a test question to validate the AI agent functionality.',
      anonymous: false
    });

    if (createDoubtResponse.statusCode !== 200) {
      console.log('❌ Could not create test doubt for AI test');
      return false;
    }

    const doubtId = createDoubtResponse.body.id;
    console.log(`✅ Created test doubt: ${doubtId}`);

    // Now test AI agent with the doubt
    const aiResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai-agent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      doubtId: doubtId,
      prompt: 'Please provide a helpful answer to this test question.'
    });

    if (aiResponse.statusCode === 200 && aiResponse.body.reply) {
      console.log('✅ AI Agent working - Generated response');
      return true;
    } else {
      console.log('❌ AI Agent failed:', aiResponse.body?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ AI Agent error:', error.message);
    return false;
  }
}

// Test 5: Test credits system
async function testCreditsSystem(authToken) {
  console.log('\n🧪 Test 5: Credits System');
  try {
    // Check initial credits
    const creditsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/me/credits',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (creditsResponse.statusCode !== 200) {
      console.log('❌ Could not fetch credits');
      return false;
    }

    const initialCredits = creditsResponse.body.credits || 0;
    console.log(`✅ Initial credits: ${initialCredits}`);

    // Try to redeem credits (should fail if insufficient)
    const redeemResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/me/credits',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      action: 'test_redemption',
      amount: 1
    });

    if (redeemResponse.statusCode === 402) {
      console.log('✅ Credits redemption correctly rejected (insufficient credits)');
      return true;
    } else if (redeemResponse.statusCode === 200) {
      console.log(`✅ Credits redeemed successfully - New balance: ${redeemResponse.body.credits}`);
      return true;
    } else {
      console.log('❌ Credits system error:', redeemResponse.body?.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Credits system error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Entropy Community Forum Tests');
  console.log('=====================================');

  // Check if server is running first
  const serverRunning = await testServerHealth();
  if (!serverRunning) {
    console.log('\n❌ Tests aborted - Server not running');
    process.exit(1);
  }

  // Run all tests
  const results = [];

  results.push(await testCommunitiesAPI());
  results.push(await testDoubtsAPI());

  // For auth-dependent tests, you'd need to provide a valid Firebase ID token
  // For now, we'll skip these as they require manual auth setup
  console.log('\n⚠️  Auth-dependent tests (AI Agent, Credits) require manual token setup');
  console.log('   To run these tests:');
  console.log('   1. Sign in to get a Firebase ID token');
  console.log('   2. Run: AUTH_TOKEN=<your-token> node test-script.js');

  if (process.env.AUTH_TOKEN) {
    console.log('\n🔐 Running authenticated tests...');
    results.push(await testAIAgentAPI(process.env.AUTH_TOKEN));
    results.push(await testCreditsSystem(process.env.AUTH_TOKEN));
  }

  // Summary
  const passed = results.filter(r => r === true).length;
  const total = results.length;

  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
