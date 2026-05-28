/**
 * Simple Load Test - Node.js based
 * Run with: npm run load-test
 * 
 * This simulates load testing without needing k6 installed.
 * For production, use k6: https://k6.io/docs/getting-started/installation/
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test configuration
const CONFIG = {
  duration: 60000, // 1 minute
  users: 10,       // concurrent users
  rampUp: 5000,    // 5 seconds ramp up
};

console.log(`
╔═══════════════════════════════════════════════════════════╗
║              El Bohío - Load Test (Node.js)               ║
╚═══════════════════════════════════════════════════════════╝
Base URL: ${BASE_URL}
Duration: ${CONFIG.duration / 1000}s
Users: ${CONFIG.users}
`);

const metrics = {
  requests: 0,
  errors: 0,
  totalDuration: 0,
  startTime: Date.now(),
};

const results = [];

async function makeRequest(name, url) {
  const start = Date.now();
  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    const success = res.ok;
    
    metrics.requests++;
    if (!success) metrics.errors++;
    metrics.totalDuration += duration;
    
    results.push({ name, status: res.status, duration, success });
    return { success, duration, status: res.status };
  } catch (err) {
    metrics.errors++;
    metrics.requests++;
    const duration = Date.now() - start;
    results.push({ name, status: 0, duration, success: false, error: err.message });
    return { success: false, duration, error: err.message };
  }
}

async function userSession(userId) {
  const endTime = Date.now() + CONFIG.duration;
  
  while (Date.now() < endTime) {
    // Test health endpoint
    await makeRequest('GET /health', `${BASE_URL}/health`);
    
    // Test menu endpoint
    await makeRequest('GET /api/menu/full', `${BASE_URL}/api/menu/full`);
    
    // Test categories endpoint
    await makeRequest('GET /api/menu/categories', `${BASE_URL}/api/menu/categories`);
    
    // Random delay between requests (100-500ms)
    await new Promise(r => setTimeout(r, 100 + Math.random() * 400));
  }
}

async function runLoadTest() {
  console.log(`\n🚀 Starting load test with ${CONFIG.users} concurrent users...\n`);
  
  const startTime = Date.now();
  
  // Create user sessions
  const sessions = Array.from({ length: CONFIG.users }, (_, i) => 
    userSession(i).catch(err => console.error(`User ${i} error:`, err))
  );
  
  await Promise.all(sessions);
  
  const actualDuration = Date.now() - startTime;
  
  // Calculate statistics
  const successRequests = results.filter(r => r.success).length;
  const failedRequests = results.filter(r => !r.success).length;
  const avgDuration = metrics.totalDuration / metrics.requests;
  const rps = metrics.requests / (actualDuration / 1000);
  
  // Get percentiles
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.50)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
  const max = durations[durations.length - 1] || 0;
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    📊 RESULTS                             ║
╚═══════════════════════════════════════════════════════════╝

  Total Requests:    ${metrics.requests}
  Successful:        ${successRequests} (${((successRequests/metrics.requests)*100).toFixed(1)}%)
  Failed:            ${failedRequests} (${((failedRequests/metrics.requests)*100).toFixed(1)}%)

  Duration:          ${(actualDuration/1000).toFixed(1)}s
  RPS:               ${rps.toFixed(2)} req/s

  Response Times:
    Average:         ${avgDuration.toFixed(0)}ms
    p50 (median):    ${p50.toFixed(0)}ms
    p95:             ${p95.toFixed(0)}ms
    p99:             ${p99.toFixed(0)}ms
    Max:             ${max.toFixed(0)}ms
`);

  // Check thresholds
  const p95Pass = p95 < 500;
  const errorRatePass = (failedRequests / metrics.requests) < 0.1;
  
  console.log('  Threshold Checks:');
  console.log(`    p95 < 500ms:      ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${p95.toFixed(0)}ms)`);
  console.log(`    Error rate < 10%: ${errorRatePass ? '✅ PASS' : '❌ FAIL'} (${((failedRequests/metrics.requests)*100).toFixed(1)}%)`);
  console.log('');
  
  // Endpoint breakdown
  console.log('  Endpoint Breakdown:');
  const byEndpoint = {};
  results.forEach(r => {
    if (!byEndpoint[r.name]) byEndpoint[r.name] = { count: 0, errors: 0, totalDuration: 0 };
    byEndpoint[r.name].count++;
    if (!r.success) byEndpoint[r.name].errors++;
    byEndpoint[r.name].totalDuration += r.duration;
  });
  
  Object.entries(byEndpoint).forEach(([endpoint, data]) => {
    const avg = data.totalDuration / data.count;
    const errorPct = (data.errors / data.count * 100).toFixed(1);
    console.log(`    ${endpoint}: ${data.count} req, avg ${avg.toFixed(0)}ms, ${errorPct}% errors`);
  });
  
  console.log('\n✅ Load test completed!\n');
  
  process.exit(errorRatePass && p95Pass ? 0 : 1);
}

// Check if server is running first
async function checkServer() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (err) {
    console.log('❌ Server not running at', BASE_URL);
    console.log('   Please start the backend first: cd backend && npm run dev\n');
    return false;
  }
}

checkServer().then(ok => {
  if (ok) runLoadTest();
  else process.exit(1);
});