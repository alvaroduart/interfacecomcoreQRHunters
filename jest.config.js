/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@factories/(.*)$": "<rootDir>/src/core/factories/$1",
    "^@domain/(.*)$": "<rootDir>/src/core/domain/$1"
    ,"^@expo/vector-icons$": "<rootDir>/jest-mocks/vector-icons.js"
  },
  preset: 'jest-expo',
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],

};