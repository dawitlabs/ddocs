import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CATALOG_URL = 'https://devdocs.io/docs/docs.json';
const OUTPUT_PATH = join(dirname(import.meta.dirname ?? '.'), 'src', 'lib', 'data', 'catalog.json');

const CATEGORY_MAP: Record<string, string> = {
	bash: 'language',
	c: 'language',
	cpp: 'language',
	clojure: 'language',
	coffeescript: 'language',
	crystal: 'language',
	css: 'language',
	d: 'language',
	dart: 'language',
	elisp: 'language',
	elixir: 'language',
	erlang: 'language',
	go: 'language',
	groovy: 'language',
	haskell: 'language',
	html: 'language',
	java: 'language',
	javascript: 'language',
	julia: 'language',
	kotlin: 'language',
	lua: 'language',
	nushell: 'language',
	ocaml: 'language',
	octave: 'language',
	odin: 'language',
	perl: 'language',
	php: 'language',
	python: 'language',
	r: 'language',
	ruby: 'language',
	rust: 'language',
	scala: 'language',
	swift: 'language',
	tcl_tk: 'language',
	typescript: 'language',
	zig: 'language',
	zsh: 'language',

	angular: 'framework',
	astro: 'framework',
	backbone: 'framework',
	bootstrap: 'framework',
	cakephp: 'framework',
	capacitor: 'framework',
	cordova: 'framework',
	django: 'framework',
	drupal: 'framework',
	electron: 'framework',
	ember: 'framework',
	express: 'framework',
	falcon: 'framework',
	fastapi: 'framework',
	flask: 'framework',
	gatsby: 'framework',
	godot: 'framework',
	hapi: 'framework',
	hugo: 'framework',
	ionic: 'framework',
	jekyll: 'framework',
	knockout: 'framework',
	laravel: 'framework',
	lit: 'framework',
	love: 'framework',
	meteor: 'framework',
	nextjs: 'framework',
	nuxt: 'framework',
	phalcon: 'framework',
	phoenix: 'framework',
	react: 'framework',
	react_native: 'framework',
	remix: 'framework',
	ruby_on_rails: 'framework',
	sinatra: 'framework',
	spring_boot: 'framework',
	svelte: 'framework',
	symfony: 'framework',
	tailwindcss: 'framework',
	vue: 'framework',
	wordpress: 'framework',
	yii: 'framework',

	async: 'library',
	axios: 'library',
	bluebird: 'library',
	chai: 'library',
	d3: 'library',
	enzyme: 'library',
	immutable: 'library',
	jquery: 'library',
	lodash: 'library',
	mobx: 'library',
	moment: 'library',
	pug: 'library',
	ramda: 'library',
	react_router: 'library',
	redux: 'library',
	rxjs: 'library',
	sinon: 'library',
	socketio: 'library',
	underscore: 'library',
	vueuse: 'library',
	vuex: 'library',

	ansible: 'tool',
	babel: 'tool',
	bazel: 'tool',
	bower: 'tool',
	bundler: 'tool',
	cmake: 'tool',
	codeception: 'tool',
	composer: 'tool',
	cypress: 'tool',
	docker: 'tool',
	esbuild: 'tool',
	eslint: 'tool',
	git: 'tool',
	gnu_make: 'tool',
	gnuplot: 'tool',
	graphite: 'tool',
	grunt: 'tool',
	gulp: 'tool',
	jasmine: 'tool',
	jest: 'tool',
	jq: 'tool',
	jsdoc: 'tool',
	kubectl: 'tool',
	less: 'tool',
	mocha: 'tool',
	nix: 'tool',
	npm: 'tool',
	opentofu: 'tool',
	playwright: 'tool',
	postcss: 'tool',
	prettier: 'tool',
	puma: 'tool',
	rollup: 'tool',
	sass: 'tool',
	terraform: 'tool',
	vagrant: 'tool',
	vite: 'tool',
	vitest: 'tool',
	webpack: 'tool',
	yarn: 'tool',

	couchdb: 'database',
	duckdb: 'database',
	mariadb: 'database',
	mongoose: 'database',
	mysql: 'database',
	postgres: 'database',
	redis: 'database',
	rethinkdb: 'database',
	sequelize: 'database',
	sqlite: 'database',

	apache_http_server: 'platform',
	deno: 'platform',
	dom: 'platform',
	dom_events: 'platform',
	gtk: 'platform',
	hammerspoon: 'platform',
	kubernetes: 'platform',
	node: 'platform',
	openjdk: 'platform',
	qt: 'platform',
	web_extensions: 'platform',
};

async function main() {
	console.log('Fetching DevDocs catalog...');
	const res = await fetch(CATALOG_URL);
	if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`);

	const raw = (await res.json()) as Array<{
		name: string;
		slug: string;
		type: string;
		version?: string;
		release?: string;
		mtime: number;
		links?: { home?: string; code?: string };
		db_size?: number;
	}>;

	const catalog = raw.map((doc) => ({
		name: doc.name,
		slug: doc.slug,
		type: doc.type ?? doc.slug,
		version: doc.version ?? '',
		release: doc.release ?? '',
		mtime: doc.mtime,
		category: CATEGORY_MAP[doc.type] ?? 'other',
		links: doc.links ?? {},
	}));

	mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
	writeFileSync(OUTPUT_PATH, JSON.stringify(catalog));

	console.log(`Wrote ${catalog.length} doc sets to ${OUTPUT_PATH}`);

	const categories: Record<string, number> = {};
	for (const doc of catalog) {
		categories[doc.category] = (categories[doc.category] ?? 0) + 1;
	}
	console.log('Categories:', categories);
}

if (existsSync(OUTPUT_PATH)) {
	console.log(`Catalog already exists at ${OUTPUT_PATH}, skipping fetch. Delete to re-fetch.`);
} else {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
