const { src, dest, series, watch, parallel } = require("gulp");
const del = require("del");
const lazypipe = require("lazypipe");
const flatmap = require("gulp-flatmap");
const rename = require("gulp-rename");
// CSS
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
// JS
const terser = require("gulp-terser");
const concat = require("gulp-concat");

sass.compiler = require("node-sass");

const options = {
	watch: {
		src: "_src/",
	},
	scss: {
		src: "_src/scss/**/*.scss",
		dest: "dist/css/",
		opts: {
			includePaths: "node_modules/",
			outputStyle: "compact",
			errLogToConsole: true,
		},
	},
	js: {
		src: "_src/javascript/*",
		dest: "dist/javascript/",
	},
	jsLib: {
		src: ["node_modules/swiped-events/dist/swiped-events.min.js"],
		dest: "dist/javascript/",
	},
};

const cleanDist = function (done) {
	del.sync([options.scss.dest, options.js.dest]);
	return done();
};

const jsTasks = lazypipe()
	.pipe(dest, options.js.dest)
	.pipe(rename, { suffix: ".min" })
	.pipe(terser)
	.pipe(dest, options.js.dest);

const buildScripts = function (done) {
	return src(options.js.src).pipe(
		flatmap(function (stream, file) {
			if (file.isDirectory()) {
				src(file.path + "/*.js")
					.pipe(concat(file.relative + ".js"))
					.pipe(jsTasks());
				return stream;
			}
			return stream.pipe(jsTasks());
		})
	);
};

const buildJsLib = function (done) {
	return src(options.jsLib.src)
		.pipe(concat("a2taLib.js"))
		.pipe(dest(options.jsLib.dest));
};

const buildStyles = function (done) {
	return src(options.scss.src)
		.pipe(sass(options.scss.opts))
		.pipe(postcss([autoprefixer()]))
		.pipe(dest(options.scss.dest))
		.pipe(rename({ suffix: ".min" }))
		.pipe(postcss([cssnano]))
		.pipe(dest(options.scss.dest));
};

const watchSource = function (done) {
	watch(options.watch.src, series(exports.default));
	done();
};

exports.default = series(
	cleanDist,
	parallel(buildScripts, buildJsLib, buildStyles)
);
exports.watch = series(exports.default, watchSource);
exports.clean = cleanDist;
exports.buildLib = buildJsLib;
exports.buildJs = buildScripts;
exports.buildStyles = buildStyles;
