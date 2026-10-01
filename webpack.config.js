const defaults = require("@wordpress/scripts/config/webpack.config.js");
const path = require("path");

module.exports = {
	...defaults,
	output: { ...defaults.output, path: path.resolve(process.cwd(), "blocks") },
};
