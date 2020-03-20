var fonts = {
	barlow: ['_src/webfonts/barlow/fonts/woff2/Barlow-Regular.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-Italic.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-Bold.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-BoldItalic.woff2'],
}

const cpy = require('cpy');

(async () => {
	await cpy(fonts.barlow, 'dist/webfonts/');
	// console.log('Files copied!');
})();
