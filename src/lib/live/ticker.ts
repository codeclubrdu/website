// AI-coded (Claude) under the owner's /live exemption — see docs/live-dashboard.md
//
// Client-only: owns the TICKER strip. Listens to `live:tick` (no interval of its own).
// On schedule change it builds one "run" (every agenda item + the call to action), measures it
// once fonts are ready, then tiles enough copies to cover the strip plus one run so a CSS
// `translateX(0 → -run)` loop is seamless. On `segmentChanged` it re-tags the current segment
// in every copy. Under prefers-reduced-motion (unless `?motion=1`) the CSS animation is off,
// so the track pages one strip-width every 8s instead.

import { hm } from './format';
import type { LiveSchedule } from './schedule';
import { LIVE_TICK, type LiveTick } from './tick';

const PAGE_MS = 8000;

const reducedMotion = (): boolean =>
	matchMedia('(prefers-reduced-motion: reduce)').matches &&
	document.documentElement.dataset.motion !== 'force';

export const mountTicker = (): void => {
	const track = document.querySelector<HTMLElement>('[data-ticker-track]');
	if (!track) return;
	const strip = track.parentElement!;

	let builtFor: string | null = null;
	let runWidth = 0;
	let current = -1;

	const tag = (i: number): void => {
		current = i;
		for (const el of track.querySelectorAll<HTMLElement>('[data-index]')) {
			el.dataset.state = Number(el.dataset.index) === i ? 'now' : '';
		}
	};

	const build = (schedule: LiveSchedule | null): void => {
		track.replaceChildren();
		track.classList.remove('is-ready');
		track.style.removeProperty('--ticker-run');
		track.style.removeProperty('transform');
		runWidth = 0;
		if (!schedule) return;

		const run = document.createElement('span');
		run.className = 'ticker-run';
		schedule.agenda.forEach((seg, i) => {
			const item = document.createElement('span');
			item.dataset.index = String(i);
			item.textContent = `${hm(seg.start)} ${seg.item}`;
			run.append(item);
		});
		const cta = document.createElement('span');
		cta.className = 'ticker-cta';
		cta.textContent = schedule.callToAction;
		run.append(cta);
		track.append(run);

		// Silkscreen decides the width; measure after it loads. offsetWidth ignores the canvas scale.
		void document.fonts.ready.then(() => {
			if (track.firstElementChild !== run) return; // schedule changed meanwhile
			runWidth = run.offsetWidth;
			const copies = Math.max(2, Math.ceil(strip.clientWidth / runWidth) + 1);
			for (let k = 1; k < copies; k++) track.append(run.cloneNode(true));
			track.style.setProperty('--ticker-run', `${runWidth}px`);
			track.classList.add('is-ready');
			tag(current);
		});
	};

	// Reduced-motion fallback: step through the run one strip-width at a time.
	const page = (): void => {
		if (!runWidth || !reducedMotion()) {
			track.style.removeProperty('transform');
			return;
		}
		const view = strip.clientWidth;
		const pages = Math.max(1, Math.ceil(runWidth / view));
		const p = Math.floor(Date.now() / PAGE_MS) % pages;
		track.style.transform = `translateX(${-p * view}px)`;
	};

	document.addEventListener(LIVE_TICK, (e) => {
		const { schedule, state, segmentChanged } = e.detail as LiveTick;
		const dateKey = schedule?.date ?? null;
		if (dateKey !== builtFor) {
			build(schedule);
			builtFor = dateKey;
		}
		if (segmentChanged) tag(state?.phase === 'during' ? (state.segmentIndex ?? -1) : -1);
		page();
	});
};
