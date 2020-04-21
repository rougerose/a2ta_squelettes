const { src, dest, series, watch } = require("gulp");
const del = require("del");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
// const cssnano = require("cssnano");
// const rename = require("gulp-rename");

sass.compiler = require("node-sass");

const options = {
	scss: {
		src: ["_src/scss/"],
		dest: "dist/css/",
		opts: {
			includePaths: "node_modules/",
			outputStyle: "compact",
			errLogToConsole: true,
		},
		watch: "_src/scss/**/*.scss",
	},
	css: {
		src: ["dist/css/"],
		dest: "dist/css/",
	},
};

function cleanTask() {
	return del([options.scss.dest]);
}

function scssTask(cb) {
	src(options.scss.src)
		.pipe(sass(options.scss.opts))
		.on("error", sass.logError)
		.pipe(dest(options.scss.dest));
	cb();
}

function postcssTask(cb) {
	var plugins = [autoprefixer()];
	src(options.css.src).pipe(postcss(plugins)).pipe(dest(options.css.dest));
	cb();
}

function watchTask() {
	watch(options.scss.watch, series(scssTask, postcssTask));
}

exports.watch = watchTask;
