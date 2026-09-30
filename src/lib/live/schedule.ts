// AI-coded (Claude) under the owner's /live exemption — see docs/live-dashboard.md
//
// Pure + isomorphic (no DOM). Validates every event's agenda at module scope so a bad
// time fails `pnpm build` instead of the venue TV.

import { events, type Agenda, type Event } from '../../data/events';

export type LiveSchedule = {
	event: string;
	/** ISO date, YYYY-MM-DD */
	date: string;
	/** Event window, 24h 'HH:MM' local. Parsed from `Event.time`. */
	windowStart: string;
	windowEnd: string;
	/** Venue line shown while waiting, e.g. '150 Fayetteville - 13th Floor'. */
	place: string;
	agenda: Agenda[];
	callToAction: string;
};

export type Phase = 'before' | 'during' | 'after' | 'idle';

export type LiveState = {
	phase: Phase;
	segmentIndex: number | null;
	/**
	 * before/idle: ms until the first segment starts.
	 * during: ms until the current segment ends (never negative).
	 * after: ms until the final end — negative once past it.
	 */
	msToSegmentEnd: number;
};

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (hhmm: string, where: string): number => {
	const m = HHMM.exec(hhmm);
	if (!m) throw new Error(`[live] ${where}: bad time '${hhmm}', want 24h 'HH:MM'`);
	return Number(m[1]) * 60 + Number(m[2]);
};

/** '5:30p-7:00p' → ['17:30', '19:00'] */
const parseWindow = (time: string, where: string): [string, string] => {
	const m = /^(\d{1,2}):(\d{2})([ap])-(\d{1,2}):(\d{2})([ap])$/.exec(time.trim());
	if (!m) throw new Error(`[live] ${where}: cannot parse Event.time '${time}'`);
	const to24 = (h: string, mm: string, ap: string): string => {
		const hour = (Number(h) % 12) + (ap === 'p' ? 12 : 0);
		return `${String(hour).padStart(2, '0')}:${mm}`;
	};
	return [to24(m[1], m[2], m[3]), to24(m[4], m[5], m[6])];
};

export const buildSchedule = (e: Event): LiveSchedule => {
	const where = `${e.event} (${e.date})`;
	const [windowStart, windowEnd] = parseWindow(e.time, where);
	const wStart = toMinutes(windowStart, where);
	const wEnd = toMinutes(windowEnd, where);
	const { agenda } = e.details;
	if (agenda.length === 0) throw new Error(`[live] ${where}: empty agenda`);

	agenda.forEach((seg, i) => {
		const label = `${where} agenda[${i}] '${seg.item}'`;
		const start = toMinutes(seg.start, label);
		const end = toMinutes(seg.end, label);
		if (end <= start) throw new Error(`[live] ${label}: end ${seg.end} <= start ${seg.start}`);
		if (start < wStart || end > wEnd)
			throw new Error(`[live] ${label}: outside event window ${windowStart}-${windowEnd}`);
		const prev = agenda[i - 1];
		if (prev && prev.end !== seg.start)
			throw new Error(
				`[live] ${label}: starts ${seg.start} but previous segment ends ${prev.end} (agenda must be contiguous)`,
			);
	});

	return {
		event: e.event,
		date: e.date,
		windowStart,
		windowEnd,
		place: e.place,
		agenda,
		callToAction: e.details.callToAction,
	};
};

/** All events, validated. Importing this module is the build-time check. */
export const schedules: LiveSchedule[] = events.map(buildSchedule);

/** Local-time ms for 'HH:MM' on the schedule's date (DST-safe: built via Date(y, m, d, h, mm)). */
export const localMs = (date: string, hhmm: string): number => {
	const [y, mo, d] = date.split('-').map(Number);
	const [h, mi] = hhmm.split(':').map(Number);
	return new Date(y, mo - 1, d, h, mi).getTime();
};

/**
 * Pick which event /live shows.
 * `dateParam` (?date=) wins → else an event on `todayISO` → else next upcoming by date.
 * `eventDay` is false only for the upcoming fallback (drives the 'idle' phase).
 */
export const selectSchedule = (
	all: LiveSchedule[],
	todayISO: string,
	dateParam: string | null,
): { schedule: LiveSchedule; eventDay: boolean } | null => {
	if (dateParam) {
		const s = all.find((x) => x.date === dateParam);
		if (s) return { schedule: s, eventDay: true };
	}
	const today = all.find((x) => x.date === todayISO);
	if (today) return { schedule: today, eventDay: true };
	const upcoming = all
		.filter((x) => x.date > todayISO)
		.sort((a, b) => a.date.localeCompare(b.date));
	return upcoming[0] ? { schedule: upcoming[0], eventDay: false } : null;
};

export const computeState = (schedule: LiveSchedule, nowMs: number, eventDay = true): LiveState => {
	const { date, agenda } = schedule;
	const firstStart = localMs(date, agenda[0].start);
	const finalEnd = localMs(date, agenda[agenda.length - 1].end);

	if (nowMs < firstStart) {
		return {
			phase: eventDay ? 'before' : 'idle',
			segmentIndex: null,
			msToSegmentEnd: firstStart - nowMs,
		};
	}
	if (nowMs >= finalEnd) {
		return { phase: 'after', segmentIndex: null, msToSegmentEnd: finalEnd - nowMs };
	}
	// Contiguous agenda guarantees exactly one segment contains now.
	const segmentIndex = agenda.findIndex(
		(seg) => nowMs >= localMs(date, seg.start) && nowMs < localMs(date, seg.end),
	);
	return {
		phase: 'during',
		segmentIndex,
		msToSegmentEnd: localMs(date, agenda[segmentIndex].end) - nowMs,
	};
};
