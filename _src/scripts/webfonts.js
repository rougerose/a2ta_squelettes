var fonts = {
	barlow_woff2: ['_src/webfonts/barlow/fonts/woff2/Barlow-Regular.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-Italic.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-Bold.woff2', '_src/webfonts/barlow/fonts/woff2/Barlow-BoldItalic.woff2'],
	barlow_woff: ['_src/webfonts/barlow/fonts/woff/Barlow-Regular.woff', '_src/webfonts/barlow/fonts/woff/Barlow-Italic.woff', '_src/webfonts/barlow/fonts/woff/Barlow-Bold.woff', '_src/webfonts/barlow/fonts/woff/Barlow-BoldItalic.woff'],
}

const cpy = require('cpy');
var barlow = fonts.barlow_woff2.concat(fonts.barlow_woff);

(async () => {
	await cpy(barlow, 'dist/webfonts/');
	// console.log('Files copied!');
})();
