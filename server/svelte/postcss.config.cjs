import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const mode = process.env.NODE_ENV;
const dev = mode === "development";

const config = {
	plugins: [
		autoprefixer(),

		!dev && cssnano({
			preset: "default",
		}),
	],
};

module.exports = config;