/**
 * @type {import("eslint").Linter.Config}
 */

module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"prettier",
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier"],
	env: {
		es2022: true,
	},
	overrides: [
		{
			files: ["**/*.cjs"],
			env: {
				node: true,
			},
		},
	],
};
