export type DocCategory =
	| 'language'
	| 'framework'
	| 'library'
	| 'tool'
	| 'database'
	| 'platform'
	| 'other';

export type DocSetMeta = {
	name: string;
	slug: string;
	type: string;
	version: string;
	release: string;
	mtime: number;
	category: DocCategory;
	links: { home?: string; code?: string };
};

export type DocGroup = {
	baseSlug: string;
	name: string;
	category: DocCategory;
	versions: DocSetMeta[];
	latestVersion: string;
};

export type DocEntry = {
	name: string;
	path: string;
	type: string;
};

export type DocType = {
	name: string;
	count: number;
	slug: string;
};

export type DocIndex = {
	entries: DocEntry[];
	types: DocType[];
};

export type InstalledDocSet = {
	slug: string;
	name: string;
	version: string;
	installedAt: number;
	entryCount: number;
	sizeBytes: number;
};

export type SearchResult = {
	id: string;
	docSlug: string;
	docName: string;
	entryName: string;
	entryPath: string;
	entryType: string;
	score: number;
};

export type Bookmark = {
	id: string;
	slug: string;
	path: string;
	name: string;
	docName: string;
	addedAt: number;
};

export type HistoryEntry = {
	id: string;
	slug: string;
	path: string;
	name: string;
	docName: string;
	viewedAt: number;
};
