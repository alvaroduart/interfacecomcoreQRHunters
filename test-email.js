// Simple test to check email validation
const testEmail = 'viniciusferreirarosario5@gmail.com';

// Implementing the regex from your Email class
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const isValid = emailRegex.test(testEmail);

console.log(`Email to test: "${testEmail}"`);
console.log(`Is valid according to regex: ${isValid}`);

// Let's check for any special characters that might be causing problems
console.log('\nCharacter breakdown:');
for (let i = 0; i < testEmail.length; i++) {
  const char = testEmail[i];
  const charCode = testEmail.charCodeAt(i);
  console.log(`Position ${i}: "${char}" (Unicode: ${charCode})`);
}

// Check for leading/trailing whitespace
console.log(`\nContains leading/trailing whitespace: ${testEmail !== testEmail.trim()}`);
console.log(`Length before trim: ${testEmail.length}, after trim: ${testEmail.trim().length}`);

// Check if it contains any spaces
console.log(`Contains spaces: ${testEmail.includes(' ')}`);
