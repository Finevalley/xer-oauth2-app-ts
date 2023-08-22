/**
 * @type {import('prettier').Options}
 * @type {import('prettier').Config}
 * @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig}
 */

module.exports = {
	$schema: "http://json.schemastore.org/prettierrc",
	useTabs: true,
	trailingComma: "all",
	semi: true,
	singleQuote: false,
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: "always",
	endOfLine: "lf",
	plugins: [
		"prettier-plugin-packagejson",
		"@ianvs/prettier-plugin-sort-imports",
	],
	overrides: [
		{
			files: ".*rc",
			options: {
				parser: "json",
			},
		},
		{
			files: ".nvmrc",
			options: {
				parser: "yaml",
			},
		},
		{
			files: ".funcignore",
			options: {
				parser: "yaml",
			},
		},
		{
			files: ["src/*.ts", "src/*.tsx", "src/*.js", "src/*.jsx"],
			options: {
				importOrder: [
					"<BUILTIN_MODULES>",
					"<THIRD_PARTY_MODULES>",
					"^[.]", // relative imports
				],
				importOrderSeparation: true,
				importOrderSortSpecifiers: true,
			},
		},
	],
};
