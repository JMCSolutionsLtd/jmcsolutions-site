#!/usr/bin/env node
/**
 * Scoring validation script — verifies the scoring logic is correct.
 * Run: node scripts/validate-scoring.js
 */

function computeOverall(responses) {
  const answered = responses.filter((r) => r.score !== null && r.score !== undefined);
  if (answered.length === 0) return null;
  const sum = answered.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / (answered.length * 5)) * 100);
}

function computeCategory(responses, category) {
  const catResponses = responses.filter((r) => r.category === category && r.score !== null && r.score !== undefined);
  if (catResponses.length === 0) return null;
  const sum = catResponses.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / (catResponses.length * 5)) * 100);
}

function getColorBand(percent) {
  if (percent === null) return 'gray';
  if (percent <= 33) return 'red';
  if (percent < 66) return 'yellow';
  return 'green';
}

// ── Test Cases ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${label}: ${actual}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}: expected ${expected}, got ${actual}`);
    failed++;
  }
}

console.log('\n🧪 Scoring Validation Tests\n');

// Test 1: All 5s → 100%
console.log('Test 1: All scores = 5');
assert('overall', computeOverall([
  { score: 5 }, { score: 5 }, { score: 5 }, { score: 5 }, { score: 5 }
]), 100);
assert('color', getColorBand(100), 'green');

// Test 2: All 1s → 20%
console.log('Test 2: All scores = 1');
assert('overall', computeOverall([
  { score: 1 }, { score: 1 }, { score: 1 }
]), 20);
assert('color', getColorBand(20), 'red');

// Test 3: Mixed scores
console.log('Test 3: Mixed scores [1, 3, 5]');
assert('overall', computeOverall([
  { score: 1 }, { score: 3 }, { score: 5 }
]), 60); // 9 / 15 = 60%
assert('color', getColorBand(60), 'yellow');

// Test 4: No answers → null
console.log('Test 4: No answers');
assert('overall', computeOverall([]), null);
assert('color', getColorBand(null), 'gray');

// Test 5: Partial answers (some null)
console.log('Test 5: Partial answers [5, null, 3, null]');
assert('overall', computeOverall([
  { score: 5 }, { score: null }, { score: 3 }, { score: null }
]), 80); // 8/10 = 80%

// Test 6: Category-level scoring
console.log('Test 6: Category scoring');
const mixedResponses = [
  { score: 5, category: 'A' },
  { score: 3, category: 'A' },
  { score: 1, category: 'B' },
  { score: null, category: 'A' },
];
assert('category A', computeCategory(mixedResponses, 'A'), 80); // 8/10
assert('category B', computeCategory(mixedResponses, 'B'), 20); // 1/5
assert('category C (empty)', computeCategory(mixedResponses, 'C'), null);

// Test 7: Color band boundaries
console.log('Test 7: Color band boundaries');
assert('33% → red', getColorBand(33), 'red');
assert('34% → yellow', getColorBand(34), 'yellow');
assert('65% → yellow', getColorBand(65), 'yellow');
assert('66% → green', getColorBand(66), 'green');
assert('0% → red', getColorBand(0), 'red');

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
