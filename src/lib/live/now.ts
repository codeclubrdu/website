// AI-coded (Claude) under the owner's /live exemption — see CONTRIBUTING.md
//
// Client-only: mounts the NOW deck. Listens to `live:tick`; on `segmentChanged` it destroys the
// running reveal instance and inits a fresh one for `<date>/<NN>`, or shows the idle logo when
// no deck exists. Import this from a <script> only — reveal touches `document` on import.
//
// Slides are presenter-driven (arrow keys / space); only the segment switch is clock-driven.

import Reveal, { type RevealApi, type RevealConfig } from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown';
import 'reveal.js/reveal.css';
import { deckKey } from './decks';
import { LIVE_TICK } from './tick';

const OPTIONS: RevealConfig = {
	embedded: true,
	keyboard: true,
	hash: false,
	respondToHashChanges: false,
	controls: false,
	progress: false,
	touch: false,
	autoSlide: 0,
	loop: false,
	transition: 'fade',
	backgroundTransition: 'none',
	width: 960,
	height: 660,
	margin: 0.06,
	center: true,
};

export const mountNow = (): void => {
	const host = document.querySelector<HTMLElement>('[data-now-deck]');
	if (!host) return;
	const el = host.querySelector<HTMLElement>('[data-now-reveal]')!;
	const slides = el.querySelector<HTMLElement>('.slides')!;

	let deck: RevealApi | null = null;

	const teardown = (): void => {
		deck?.destroy();
		deck = null;
		slides.replaceChildren();
		el.hidden = true;
		host.dataset.hasDeck = '';
	};

	const show = (key: string): void => {
		const tpl = host.querySelector<HTMLTemplateElement>(`template[data-deck="${key}"]`);
		teardown();
		if (!tpl) return;
		slides.append(tpl.content.cloneNode(true));
		el.hidden = false;
		host.dataset.hasDeck = 'true';
		deck = new Reveal(el, { ...OPTIONS, plugins: [Markdown] });
		void deck.initialize();
	};

	document.addEventListener(LIVE_TICK, (e) => {
		const { schedule, state, segmentChanged } = e.detail;
		if (!segmentChanged) return;
		if (!schedule || !state || state.phase !== 'during' || state.segmentIndex === null) {
			teardown();
			return;
		}
		show(deckKey(schedule.date, state.segmentIndex));
	});
};
