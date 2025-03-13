export default {
    transform: {
      "^.+\\.jsx?$": "babel-jest",
    },
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    verbose: true,
  }
  
  