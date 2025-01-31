// config.js или constants.js
const ASSETS_PATH = require('path').resolve(__dirname, './assets');
const IMAGES_PATH = require('path').resolve(ASSETS_PATH, 'images');

module.exports = {
    ASSETS_PATH,
    IMAGES_PATH
};