// AI-coded (Claude) under the owner's /live exemption — see CONTRIBUTING.md
//
// Build-time index of NOW decks. `src/data/live/<date>/<NN>.md` (NN = 00-based agenda
// index) is read raw and keyed `<date>/<NN>`. Missing key → Now.astro shows the idle logo.

const files = import.meta.glob('/src/data/live/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

export const deckKey = (date: string, segmentIndex: number): string =>
	`${date}/${String(segmentIndex).padStart(2, '0')}`;

/** `{ '2026-10-01/00': '# …', … }` — reveal markdown, `---` between slides. */
export const decks: Record<string, string> = Object.fromEntries(
	Object.entries(files).map(([path, md]) => {
		const m = /\/src\/data\/live\/(\d{4}-\d{2}-\d{2})\/(\d{2})\.md$/.exec(path);
		if (!m) throw new Error(`live deck path must be src/data/live/<date>/<NN>.md: ${path}`);
		return [`${m[1]}/${m[2]}`, md];
	}),
);
