exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    'spec/e2e/**/*.js'
  ],
  framework: 'jasmine',
  baseUrl: 'https://localhost',
  capabilities: {
    browserName: 'chrome',
    platform: 'ANY',
    version: ''
  },
  jasmineNodeOpts: {
    isVerbose: true,
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
