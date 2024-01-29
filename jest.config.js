module.exports = {
	moduleFileExtensions: ['js', 'json', 'vue'],
	transform: {
	  '^.+\\.vue$': 'vue-jest',
	  '^.+\\.js$': 'babel-jest',
	},
	testMatch: ['**/tests/unit/**/*.spec.js'],
	// Setup to handle path aliases
	moduleNameMapper: {
	  '^@/(.*)$': '<rootDir>/src/$1', // Adjust according to your path alias setup
	},
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/out/'],
	setupFiles: ['<rootDir>/jest.setup.js'],

  };
