const { gulp, src, dest, watch, series, parallel } = require("gulp");
const fs = require("fs");
const path = require("path");
const merge = require("merge-stream");
const del = require("del");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const terser = require("gulp-terser-js");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const paths = {
  js: {
    src: "_src/js",
    dest: "dist/js",
    watch: "_src/js/**/*.js",
  },
  jsLib: {
    src: ["node_modules/swiped-events/dist/swiped-events.min.js"],
    dest: "dist/js/",
  },
  scss: {
    src: "_src/scss/*.scss",
    dest: "dist/css/",
    watch: "_src/scss/**/*.scss",
  },
  webfonts: {
    src: [
      "_src/webfonts/barlow/fonts/woff2/Barlow-Regular.woff2",
      "_src/webfonts/barlow/fonts/woff2/Barlow-Italic.woff2",
      "_src/webfonts/barlow/fonts/woff2/Barlow-Bold.woff2",
      "_src/webfonts/barlow/fonts/woff2/Barlow-BoldItalic.woff2",
      "_src/webfonts/barlow/fonts/woff/Barlow-Regular.woff",
      "_src/webfonts/barlow/fonts/woff/Barlow-Italic.woff",
      "_src/webfonts/barlow/fonts/woff/Barlow-Bold.woff",
      "_src/webfonts/barlow/fonts/woff/Barlow-BoldItalic.woff",
    ],
    dest: "dist/webfonts/",
  },
};

const options = {
  scss: {
    includePaths: "node_modules/",
    outputStyle: "compact",
    sourceComments: false,
  },
  jsLib: {
    name: "a2taLib",
  },
};

// Clean
// ***************************
function cleanDist(cb) {
  del.sync([paths.js.dest, paths.scss.dest]);
  return cb();
}

// SCSS
// ***************************
sass.compiler = require("node-sass");

function scssTask() {
  return src(paths.scss.src)
    .pipe(sass(options.scss).on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(paths.scss.dest))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([cssnano()]))
    .pipe(dest(paths.scss.dest));
}

// JS
// ***************************
// Compiler les fichiers js dans un sous-dossier
// et les rassembler dans un fichier unique portant le nom du dossier.
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
function jsTaskFolders(cb) {
  let folders = getFolders(paths.js.src);
  let tasks = folders.map(function (folder) {
    return src(path.join(paths.js.src, folder, "/*.js"))
      .pipe(concat(folder + ".js"))
      .pipe(dest(paths.js.dest))
      .pipe(terser())
      .on("error", function (error) {
        this.emit("end");
      })
      .pipe(rename(folder + ".min.js"))
      .pipe(dest(paths.js.dest));
  });
  merge(tasks);
  cb();
}

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

// Les fichiers situés au premier niveau sont compilés séparément.
function jsTaskRoot() {
  return src(paths.js.src + "/*.js")
    .pipe(dest(paths.js.dest))
    .pipe(terser())
    .on("error", function (error) {
      this.emit("end");
    })
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(paths.js.dest));
}

// Copie
// ***************************

function copieWebfonts() {
  return src(paths.webfonts.src).pipe(dest(paths.webfonts.dest));
}

function copieJsLib() {
  return src(paths.jsLib.src)
    .pipe(concat(options.jsLib.name + ".js"))
    .pipe(dest(paths.jsLib.dest));
}

// Watch
// ***************************
function watchFiles() {
  watch(paths.scss.watch, scssTask);
  watch(paths.js.watch, parallel(jsTaskFolders, jsTaskRoot));
}

exports.watch = series(
  cleanDist,
  parallel(copieJsLib, jsTaskFolders, jsTaskRoot, scssTask),
  watchFiles
);
exports.copieFonts = copieWebfonts;
exports.copieJsLib = copieJsLib;
exports.default = series(
  cleanDist,
  parallel(copieJsLib, jsTaskFolders, jsTaskRoot, scssTask)
);
