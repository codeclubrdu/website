// AI-coded (Claude) under the owner's /live exemption — see CONTRIBUTING.md
//
// `live:tick` contract. live.astro dispatches one CustomEvent<LiveTick> on `document`
// every second (and immediately after the dev panel changes the clock). Anything that
// needs the engine (NOW deck, TICKER) listens instead of running its own interval.

import type { LiveSchedule, LiveState } from './schedule';

export type LiveTick = {
	/** Virtual now (rehearsal-aware), ms epoch. */
	now: number;
	/** Picked event, or null when nothing is upcoming. */
	schedule: LiveSchedule | null;
	/** Null iff `schedule` is null. */
	state: LiveState | null;
	/** Every event, for "next event" lookups. */
	all: LiveSchedule[];
	/** True on the first tick and whenever schedule or segmentIndex changed since the last one. */
	segmentChanged: boolean;
};

export const LIVE_TICK = 'live:tick';

declare global {
	interface DocumentEventMap {
		[LIVE_TICK]: CustomEvent<LiveTick>;
	}
}

export const dispatchTick = (detail: LiveTick): void => {
	document.dispatchEvent(new CustomEvent<LiveTick>(LIVE_TICK, { detail }));
};
