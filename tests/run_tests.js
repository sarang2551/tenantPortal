const { execSync } = require('child_process');

async function runTests() {
  const numTests = 1;
  const command = 'npx mocha --no-timeouts --forbid-only tests/front_test.js';
  for (let i = 0; i < numTests; i++) {
    try {
      console.log(`Running test iteration ${i + 1}`);
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('Test run failed:', error);
      process.exit(1);
    }
  }
}

runTests()