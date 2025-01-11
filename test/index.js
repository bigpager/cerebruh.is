const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

async function runTests() {
  console.log('🧪 Starting tests...');
  
  // Test 1: Verify build directory exists
  console.log('\n📁 Testing build directory...');
  const buildExists = fs.existsSync(path.join(__dirname, '../build'));
  assert.ok(buildExists, 'Build directory should exist');
  console.log('✅ Build directory exists');

  // Test 2: Verify index.html exists in build
  console.log('\n📄 Testing index.html...');
  const indexExists = fs.existsSync(path.join(__dirname, '../build/index.html'));
  assert.ok(indexExists, 'index.html should exist in build directory');
  console.log('✅ index.html exists in build');

  // Test 3: Verify content integrity
  console.log('\n🔍 Testing content integrity...');
  const content = fs.readFileSync(path.join(__dirname, '../build/index.html'), 'utf8');
  assert.ok(content.includes('🧠✨🤖'), 'index.html should contain our emoji content');
  console.log('✅ Content integrity verified');

  // Test 4: Verify valid HTML structure
  console.log('\n🏗️ Testing HTML structure...');
  const validTags = ['<html>', '<body>', '<h1>', '</h1>', '</body>', '</html>'];
  validTags.forEach(tag => {
    assert.ok(content.includes(tag), `HTML should contain ${tag}`);
  });
  console.log('✅ HTML structure verified');

  // Test 5: Visual test with Puppeteer
  console.log('\n🖼️ Running visual tests...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const indexPath = path.join(__dirname, '../build/index.html');
  await page.goto('file://' + indexPath);

  // Verify content is visible
  const h1Content = await page.$eval('h1', el => el.innerText);
  assert.equal(h1Content, '🧠✨🤖', 'H1 should contain our emoji content');
  
  await browser.close();
  console.log('✅ Visual tests passed');

  console.log('\n✨ All tests passed successfully! ✨');
}

runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});