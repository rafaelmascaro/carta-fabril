var es          = require('event-stream');
var fs          = require('fs');
var del         = require('del');
var gulp        = require('gulp');
var rename      = require('gulp-rename');
var shell         = require('gulp-shell');
var open          = require('open');
var _             = require('lodash');
var express       = require('express');
var sass          = require('gulp-sass');
var watch         = require('gulp-watch');
var karma         = require('karma').server;
var runSequence   = require('run-sequence');
var minifyJS      = require('gulp-uglify');
var vinylPaths    = require('vinyl-paths');
var inject        = require('gulp-inject');
var concat        = require('gulp-concat');
var cssmin        = require('gulp-cssmin');
var livereload    = require('gulp-livereload');
var replace       = require('gulp-replace-task');
var connectLr     = require('connect-livereload');
var watchSequence = require('gulp-watch-sequence');

var isRelease,
    platform,
    defaultVersion = '0.0.0',
    defaultVersionCode = '001',
    defaultAppName = 'Carta Fabril', // "Carta Fabril HLG" para homologação e "Carta Fabril" para Produção
    defaultAppId = 'br.com.carta_fabril.app', // "br.com.carta_fabril.staging" para homologação e "br.com.carta_fabril.app" para Produção
    args = require('yargs')
             .alias('e', 'env')
             .alias('l', 'local')
             //.alias('l', 'live')
             //.alias('v', 'version')
             //.alias('i', 'id')
             //.alias('n', 'name')
             .argv;

var port = 8100;

var paths = {
  gulpFile:   'gulpfile.js',

  src: {
    assetsFile:  'src/assets.json',
    templates:   ['src/templates/**/**.*', 'src/lib/ionic-multiselect/dist/templates/**.*'],
    index:       'src/index.html',
    indexMobile: 'src/index.mobile.html',
    indexWeb:    'src/index.web.html',
    fonts:       ['src/fonts/**.*', 'src/lib/ionic/release/fonts/**.*'],
    imgs:        'src/img/**/**.*',
    path:        'src/',
    sass:        'src/sass/**/**.sass',
    scss:        'src/sass/**/**.scss',
    css:         'src/css/**/**.css',
    js:          'src/js/**/**.js'
  },

  dist: {
    templates:      'www/templates',
    scssFiles:      'www/css/**/**.scss',
    cssFiles:       'www/css/**/**.*',
    cssFile:        'www/css/application.css',
    jsFiles:        'www/js/**/**.*',
    jsFile:         'www/js/application.js',
    files:          'www/**/**.*',
    fonts:          'www/fonts',
    path:           'www/',
    imgs:           'www/img',
    css:            'www/css',
    js:             'www/js'
  },

  root: '.',

  config: {
    build:       "config/build.json",
    configXMLWeb:   "config/config.web.xml",
    configXMLMobile:   "config/config.mobile.xml"
  }
};

var read = function(path) {
  return fs.readFileSync(path, 'utf8')
};

var parse = function(content) {
  return JSON.parse(content)
};


// ********
// GULP WEB
// ********

gulp.task('web:run', function (callback) {
  isRelease = false;

  livereload.listen();
  
  platform = 'web';

  runSequence(
    'clean',
    'moveImgs',
    'moveFonts',
    'moveHTML',
    'moveCSS',
    'clearCSS',
    'moveJS',
    'replaceJS',
    'platformJS',
    'moveConfig',
    'inject',
    'watch',
    'serve',
    callback
  );
});

gulp.task('web:release', function (callback) {
  isRelease = true;
  
  platform = 'web';

  runSequence(
    'clean',
    'moveImgs',
    'moveFonts',
    'moveHTML',
    'moveCSS',
    'clearCSS',
    'moveJS',
    'replaceJS',
    'platformJS',
    'moveConfig',
    'inject',
    'moveBuild',
    callback
  );
});


// ********
// GULP RUN
// ********

gulp.task('android:run', function(callback) {
  
  platform = 'mobile';
  
  runSequence(
    'clean',
    'moveImgs',
    'moveFonts',
    'moveHTML',
    'moveCSS',
    'clearCSS',
    'moveJS',
    'replaceJS',
    'platformJS',
    'moveConfig',
    'inject',
    'android:deploy',
    callback
  );
});


// ************
// GULP RELEASE
// ************

gulp.task('android:release', function(callback) {
  isRelease = true;

  platform = 'mobile';

  runSequence(
    'clean',
    'moveImgs',
    'moveFonts',
    'moveHTML',
    'moveCSS',
    'clearCSS',    
    'moveJS',
    'replaceJS',
    'platformJS',
    'moveConfig',
    'inject',
    'android:release:build',
    'android:release:sign',
    'android:release:align',
    callback
  )
});

gulp.task('clean', function() {
  return gulp.src(paths.dist.files).pipe(vinylPaths(del));
});

gulp.task('clear', function() {
  var sources = [
    paths.dist.cssFiles,
    '!' + paths.dist.cssFile,

    paths.dist.jsFiles,
    '!' + paths.dist.jsFile
  ];

  return gulp.src(sources)
             .pipe(vinylPaths(del));
});


/*
 * IMGS
 */


gulp.task('moveImgs', function() {
  return gulp.src(paths.src.imgs)
             .pipe(gulp.dest(paths.dist.imgs));
});


/*
 * FONTS
 */


gulp.task('moveFonts', function() {
  return gulp.src(paths.src.fonts)
             .pipe(gulp.dest(paths.dist.fonts));
});


/*
 * STYLESHEETS
 */


gulp.task('moveCSS', function() {
  var assetsCSS = parse(read(paths.src.assetsFile)).css;

  var sources = _.map(assetsCSS, function(asset) {
    var css  = '.css';
    var sass = '.scss';
    var extension = '';

    var pathWithoutExtension = paths.src.path + asset;

    if (fs.existsSync(pathWithoutExtension + css)) {
      extension = css;
    } else if (fs.existsSync(pathWithoutExtension + sass)) {
      extension = sass;
    } else if (fs.existsSync(pathWithoutExtension + '.sass')) {
      extension = '.sass';
    } else {
      return '';
    }

    return pathWithoutExtension + extension;
  });
  // sources.push(paths.src.scss);
  // console.log(sources);
  return gulp.src(sources)
             .pipe(sass().on('error', sass.logError))
             .pipe(gulp.dest(paths.dist.css))
             .pipe(livereload())
});

gulp.task('moveHTML', function() {
  es.concat(
    gulp.src(paths.src.templates)
        .pipe(gulp.dest(paths.dist.templates))
        .pipe(livereload())
  )
});

gulp.task('clearCSS', function() {
  return gulp.src(paths.dist.scssFiles)
             .pipe(vinylPaths(del));
});

gulp.task('concatCSS', function() {
  return gulp.src(paths.dist.cssFiles)
             .pipe(concat('application.css'))
             .pipe(gulp.dest(paths.dist.css))
});

gulp.task('minifyCSS', function() {
  return gulp.src(paths.dist.cssFiles)
             .pipe(cssmin())
             .pipe(gulp.dest(paths.dist.css));
});


/*
 * JAVASCRIPTS
 */

gulp.task('moveBuild', function() {
  var dir = 'builds\\web\\release\\release_' + Date.now();

  return gulp.src(['www/**', 'app.js', 'Procfile', 'package.json'], { base: '.' })
             .pipe(gulp.dest(dir));
});

gulp.task('moveJS', function() {
  var assetsJS = parse(read(paths.src.assetsFile)).js;

  var sources  = _.map(assetsJS, function(asset) {
    return paths.src.path + asset + '.js';
  });

  return gulp.src(sources)
             .pipe(gulp.dest(paths.dist.js))
             .pipe(livereload())
});

gulp.task('platformJS', function(callback) {
  runSequence(
    'renameJS',
    'deleteJS',
    callback
  )
});

gulp.task('renameJS', function() {
  var folders = ['www/js/*.mobile.*', 'www/js/*.web.*'];

  return gulp.src(folders, { sourcemaps: true })
                        .pipe(rename(function(filepath) {
                            if(platform === 'web') {
                              if(filepath.basename.indexOf('web') > 0) { filepath.basename = filepath.basename.replace('.web', ''); }
                              if(filepath.basename.indexOf('mobile') > 0) { filepath.extname = filepath.extname + '.delete'; }
                            }
                            else if(platform === 'mobile') {
                              if(filepath.basename.indexOf('mobile') > 0) { filepath.basename = filepath.basename.replace('.mobile', ''); }
                              if(filepath.basename.indexOf('web') > 0) { filepath.extname = filepath.extname + '.delete'; }
                            }
                          }))
                          .pipe(gulp.dest('www/js', { sourcemaps: true }));
});

gulp.task('deleteJS', function() {
  var folders = ['www/js/*.mobile.*', 'www/js/*.web.*'];

  return del(folders);
});

gulp.task('moveAndConcatJS', function() {
  var assetsJS = parse(read(paths.src.assetsFile)).js;

  var sources  = _.map(assetsJS, function(asset) {
    return paths.src.path + asset + '.js';
  });

  return gulp.src(sources)
             .pipe(concat('application.js'))
             .pipe(gulp.dest(paths.dist.js))
});

gulp.task('minifyJS', function() {
  return gulp.src(paths.dist.jsFiles)
             .pipe(minifyJS({ mangle: false }))
             .pipe(gulp.dest(paths.dist.js));
});

gulp.task('replaceJS', function() {
  var configs = parse(read("config/" + args.env + "." + platform + (args.l ? ".local" : "") + ".json"));

  var patterns = _.map(configs, function(value, key) {
    return { match: key, replacement: value };
  });

  var versions = parse(read("config/version.json"));

  patterns = patterns.concat(_.map(versions, function(value, key) {
    return { match: key, replacement: value };
  }));

  return gulp.src(paths.dist.jsFiles)
             .pipe(replace({ patterns: patterns }))
             .pipe(gulp.dest(paths.dist.js));
});

gulp.task('inject', function() {
    var assets = parse(read(paths.src.assetsFile));

    var sourcesCSS = _.map(assets.css, function(asset) {
      return paths.dist.css + '/' + _.last(asset.split('/')) + '.css';
    });

    sourcesCSS.push(paths.dist.cssFile);

    var sourcesJS = _.map(assets.js, function(asset) {
      return paths.dist.js + '/' + _.last(asset.split('/')) + '.js';
    });
    
    sourcesJS.push('!www/js/*.mobile.*');
    sourcesJS.push('!www/js/*.web.*');

    srcOptions    = { base: paths.dist, read: false };
    injectOptions = { ignorePath: paths.dist.path, addRootSlash: false };

    var stream = gulp;
                     
    if(platform === 'mobile') 
      stream = stream.src(paths.src.indexMobile);
                
    else if(platform === 'web')
      stream = stream.src(paths.src.indexWeb);

    return stream.pipe(rename('index.html'))
                 .pipe(inject(gulp.src(sourcesJS,  srcOptions), injectOptions))
                 .pipe(inject(gulp.src(sourcesCSS, srcOptions), injectOptions))
                 .pipe(gulp.dest(paths.dist.path));
});


/*
 * DEVICES
 */


gulp.task('moveConfig', function () {
  var version = args.version || defaultVersion,
      versionCode = args.versionCode || defaultVersionCode,
      appName = args.name || defaultAppName,
      appId = args.id || defaultAppId

  var patterns = [
    {
      match: 'version',
      replacement: version
    },
    {
      match: 'versionCode',
      replacement: versionCode
    },
    {
      match: 'appName',
      replacement: appName
    },
    {
      match: 'appId',
      replacement: appId
    }
  ]

  if(platform === 'web')
    return gulp.src(paths.config.configXMLWeb)
             .pipe(replace({ patterns: patterns }))
             .pipe(rename('config.xml'))
             .pipe(gulp.dest(paths.root));
  else if(platform === 'mobile')
    return gulp.src(paths.config.configXMLMobile)
            .pipe(replace({ patterns: patterns }))
            .pipe(rename('config.xml'))
            .pipe(gulp.dest(paths.root));
   
});

gulp.task('android:deploy', shell.task([
  'ionic cordova run android --device' + (args.live ? ' -l -c -s' : '')
]));

gulp.task('android:release:build', shell.task([
  'ionic cordova build android --release'
]));

gulp.task('android:release:sign', function() {
  var config = parse(read(paths.config.build)),
      commands = [];

  commands.push('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificates/google-play-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk cartafabril -storepass ' + config.android.storepass);

  return gulp.src('').pipe(shell(commands))
});

gulp.task('android:release:align', function() {
  var dir = 'builds\\android\\release\\',
      commands = [ ],
      createdFiles = [];

  if(!fs.existsSync('builds')) {
    fs.mkdirSync('builds');
  }

  if(!fs.existsSync('builds\\android')) {
    fs.mkdirSync('builds\\android');
  }

  if(!fs.existsSync('builds\\android\\release')) {
    fs.mkdirSync('builds\\android\\release');
  }

  commands.push('utils\\zipalign -v 4 platforms\\android\\build\\outputs\\apk\\android-release-unsigned.apk ' + dir + 'release_' + Date.now() + '.apk')

  return gulp.src('').pipe(shell(commands.concat(createdFiles)))
});


/*
 * TESTS
 */


gulp.task('test:unit', function (done) {
  karma.start({
    singleRun: true,
    configFile: __dirname + '/spec/karma.conf.js'
  }, function () {
    done();
    process.exit(0);
  });
})

gulp.task('test:e2e', shell.task([
  'webdriver-manager start &>/dev/null &',
  'protractor spec/protractor.conf.js'
], { PATH: process.env.PATH }))


/*
 * OTHERS
 */


gulp.task('deliver', function (callback) {
  args.env = args.env || 'staging'

  runSequence(
    'clean',
    'moveImgs',
    'moveFonts',
    'moveHTML',
    'moveCSS',
    'clearCSS',
    'moveJS',
    'replaceJS',
    'inject',
    'upload',
    callback
  );
});


gulp.task('upload', shell.task([
  'ionic upload',
  'git tag -f delivered',
  'git push --tags -f'
]))

gulp.task('watch', function() {
  // FONTS
  gulp.watch(paths.src.fonts, function() {
    gulp.start('moveFonts');
  });

  // IMGS
  gulp.watch(paths.src.imgs, function() {
    gulp.start('moveImgs');
  });

  // CSS
  var cssSources = [
    paths.src.css,
    paths.src.sass,
    paths.src.scss,
    paths.src.assetsFile
  ];

  gulp.watch(cssSources, function() {
    gulp.start('moveCSS')
  });

  // JS
  var jsSources = [
    paths.src.js,
    paths.src.assetsFile
  ];

  var queue = watchSequence(300);

  watch(
    jsSources,
    { name: 'JS', emitOnGlob: false },
    queue.getHandler('moveJS', 'replaceJS', 'inject')
  );

  // HTML
  var htmlSources = [
    paths.src.indexWeb,
    paths.src.templates
  ];

  gulp.watch(htmlSources, function() {
    gulp.start('inject');
    gulp.start('moveHTML');
  });

  // INJECT
  var injectSources = [
    paths.src.assetsFile,
    paths.src.index
  ];

  gulp.watch(injectSources, function() {
    gulp.start('inject');
  });
});

gulp.task('serve', function() {
  var configs = parse(read("config/" + args.env + "." + platform + (args.l ? ".local" : "") + ".json"));

  require('./localhost.js')(configs);
  open('https://localhost/');
});
