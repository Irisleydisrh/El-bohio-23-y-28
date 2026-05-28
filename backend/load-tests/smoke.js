import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestDuration = new Trend('request_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 30 },  // Ramp up to 30 users
    { duration: '1m', target: 30 },   // Stay at 30 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be < 500ms
    errors: ['rate<0.1'],               // Error rate should be < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test scenarios
export default function () {
  // 1. Health check
  testHealth();

  // 2. Get menu (public endpoint)
  testGetMenu();

  // 3. Get categories
  testGetCategories();

  // Random wait between requests (1-3 seconds)
  sleep(Math.random() * 2 + 1);
}

function testHealth() {
  const res = http.get(`${BASE_URL}/health`);
  
  const success = check(res, {
    'health status is 200': (r) => r.status === 200,
    'health returns ok': (r) => {
      try {
        return JSON.parse(r.body).status === 'ok';
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  requestDuration.add(res.timings.duration);
  
  if (!success) {
    console.log(`Health check failed: ${res.status} - ${res.body}`);
  }
}

function testGetMenu() {
  const res = http.get(`${BASE_URL}/api/menu/full`);
  
  const success = check(res, {
    'menu status is 200': (r) => r.status === 200,
    'menu returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  requestDuration.add(res.timings.duration);
  
  if (!success) {
    console.log(`Menu fetch failed: ${res.status} - ${res.body}`);
  }
}

function testGetCategories() {
  const res = http.get(`${BASE_URL}/api/menu/categories`);
  
  const success = check(res, {
    'categories status is 200': (r) => r.status === 200,
    'categories returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  requestDuration.add(res.timings.duration);
  
  if (!success) {
    console.log(`Categories fetch failed: ${res.status} - ${res.body}`);
  }
}

// Summary handler
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

// Simple text summary
function textSummary(data, options) {
  const indent = options.indent || '';
  const metrics = data.metrics;
  
  let output = `\n${indent}=== Load Test Results ===\n\n`;
  
  // HTTP metrics
  if (metrics.http_req_duration) {
    const dur = metrics.http_req_duration;
    output += `${indent}Request Duration:\n`;
    output += `${indent}  avg: ${dur.values.avg.toFixed(2)}ms\n`;
    output += `${indent}  p95: ${dur.values['p(95)'].toFixed(2)}ms\n`;
    output += `${indent}  max: ${dur.values.max.toFixed(2)}ms\n\n`;
  }
  
  // Error rate
  if (metrics.errors) {
    const err = metrics.errors.values;
    output += `${indent}Error Rate: ${(err.rate * 100).toFixed(2)}%\n`;
    output += `${indent}Total Errors: ${err.passes + err.failed}\n\n`;
  }
  
  // Request counts
  if (metrics.http_reqs) {
    output += `${indent}Total Requests: ${metrics.http_reqs.values.count}\n`;
    output += `${indent}RPS: ${metrics.http_reqs.values.rate.toFixed(2)}\n`;
  }
  
  return output;
}