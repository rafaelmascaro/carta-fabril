module.exports = function (config) {
  config.set({
    basePath: './',
    files: [
      "src/lib/ionic/release/js/ionic.bundle.js",
      "src/lib/angular-animate/angular-animate.js",
      "src/lib/angular-sanitize/angular-sanitize.js",
      "src/lib/angular-mocks/angular-mocks.js",
      "src/lib/angular-ui-router/release/angular-ui-router.js",
      "src/lib/angular-input-masks/angular-input-masks-standalone.js",
      "src/lib/ngCordova/dist/ng-cordova.js",
      "src/lib/jsforce/build/jsforce.js",
      "src/lib/lodash/dist/lodash.js",
      "src/lib/angular-simple-logger/dist/angular-simple-logger.min.js",
      "src/lib/angular-google-maps/dist/angular-google-maps.js",
      "src/lib/skipped-periodic-values.js/dist/skipped-periodic-values.js",
      "src/lib/nearest-periodic-value.js/dist/nearest-periodic-value.js",
      "src/lib/contained-periodic-values.js/dist/contained-periodic-values.js",
      "src/lib/moment/moment.js",
      "src/lib/moment-business/dist/moment-business.js",
      "src/vendor/ionic-ion-drawer/ionic.contrib.drawer.js",
      "src/vendor/truncate.js",
      "src/js/**/*.js",
      "spec/mocks/**/*.js",
      "spec/unit/**/*.js",
      "src/lib/ionic-multiselect/dist/ionic-multiselect.js"
    ],
    vendor: [
      "src/lib/ionic-ion-drawer/ionic.contrib.drawer.js"
    ],
    autoWatch: false,
    crossOriginAttribute: false,
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-spec-reporter'
    ],
    reporters: ["spec"],
    specReporter: {
      lateReport: true, // When test faild - report it at the end of all tests
      maxLogLines: 10, // Max Error log lines to display
      suppressFailed: false, // Don't show failed tests
      suppressSuccess: false, // Don't show successful tests
      suppressSkipped: true, // Don't show skipped tests
      slowTestTime: 40, // Every test that is more slower than the slowest test is mark as slow
      fastTestTime: 20
    }
  });
};
