// AI-coded (Claude) under the owner's /live exemption — see docs/live-dashboard.md
//
// Pure viewer-copy helpers for /live. No DOM.

import { localMs, type LiveSchedule } from './schedule';

const clockFmt = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	hour: 'numeric',
	minute: '2-digit',
});
const dayFmt = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	weekday: 'short',
	month: 'short',
	day: 'numeric',
});

/** ms epoch → '5:52 pm' */
export const clock = (ms: number): string => clockFmt.format(ms).toLowerCase();

/** '17:55' → '5:55' */
export const hm = (hhmm: string): string => {
	const [h, m] = hhmm.split(':').map(Number);
	return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** ms → 'H:MM:SS' (same-day waits) */
export const hms = (ms: number): string => {
	const s = Math.floor(Math.abs(ms) / 1000);
	return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** ms → 'M:SS' (segment countdown, overrun) */
export const mss = (ms: number): string => {
	const s = Math.floor(Math.abs(ms) / 1000);
	return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

/** 'Event 8 · Thu, Oct 1, 5:30pm' */
export const dayLabel = (s: LiveSchedule): string =>
	`${s.event} · ${dayFmt.format(localMs(s.date, s.agenda[0].start))}, ${hm(s.agenda[0].start)}pm`;

/** Next schedule strictly after `date`, by date. */
export const nextAfter = (all: LiveSchedule[], date: string): LiveSchedule | undefined =>
	all.filter((x) => x.date > date).sort((a, b) => a.date.localeCompare(b.date))[0];

/** ms → 'tomorrow' | 'in N days' (day granularity for idle waits) */
export const daysUntil = (ms: number): string => {
	const days = Math.round(ms / 86_400_000);
	return days <= 1 ? 'tomorrow' : `in ${days} days`;
};
