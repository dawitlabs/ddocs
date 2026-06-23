import catalogData from '$lib/data/catalog.json';

export function load() {
	return { catalog: catalogData };
}
