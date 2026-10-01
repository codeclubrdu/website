/** `start` / `end` are 24h 'HH:MM' local (America/New_York). */
export type Agenda = {
	start: string;
	end: string;
	item: string;
};

export type Detail = {
	notes: string[];
	agenda: Agenda[];
	callToAction: string;
};

export type Event = {
	event: string;
	/** ISO date, YYYY-MM-DD */
	date: string;
	time: string;
	place: string;
	address: string;
	city: string;
	meetupLink: string;
	details: Detail;
	recap?: string[];
};

const ordinal = (n: number): string => {
	const suffixes = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
};

export const formatDay = (date: string): string => {
	const [year, month, day] = date.split('-').map(Number);
	const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
		new Date(year, month - 1, day),
	);
	return `${monthName} ${day}${ordinal(day)}`;
};

const format12h = (hhmm: string): string => {
	const [h, m] = hhmm.split(':').map(Number);
	return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
};

/** '17:30','17:50' → '5:30–5:50' */
export const formatRange = (start: string, end: string): string =>
	`${format12h(start)}–${format12h(end)}`;

export const events: Event[] = [
	{
		event: 'Event 8',
		date: '2026-10-01',
		time: '5:30p-7:00p',
		place: '150 Fayetteville - 13th Floor',
		address: '150 Fayetteville St Floor 13',
		city: 'Raleigh, NC',
		meetupLink: 'https://www.meetup.com/code-club-rdu/events/316599364',
		details: {
			notes: [
				'This meeting is hands-on-keyboard so make sure to bring your laptops!',
				'For returning attendees we are meeting on the 13th floor, not the 4th.',
				'Clone the Battleship repo before the event — hop in the Discord if you need help getting set up.',
			],
			agenda: [
				{ start: '17:30', end: '17:50', item: 'Social + pizza' },
				{ start: '17:50', end: '17:55', item: 'Cool tech presentation' },
				{ start: '17:55', end: '18:00', item: 'Welcome and goal setting' },
				{ start: '18:00', end: '18:45', item: 'Projects breakout' },
				{ start: '18:45', end: '19:00', item: 'Wrap up' },
			],
			callToAction: 'Want to share something cool as a talk or lead a project? DM me!',
		},
	},
	{
		event: 'Event 7',
		date: '2026-09-03',
		time: '5:30p-7:00p',
		place: '150 Fayetteville - 13th Floor',
		address: '150 Fayetteville St Floor 13',
		city: 'Raleigh, NC',
		meetupLink:
			'https://www.meetup.com/code-club-rdu/events/316017741/?utm_medium=referral&utm_campaign=share-btn_savedevents_share_modal&utm_source=link&utm_version=v2&member_id=241752342',
		details: {
			notes: [
				`It's Battleship part 2! New folks are welcome — teams will absorb you even if you missed part 1.`,
				'This meeting is hands-on-keyboard so make sure to bring your laptops!',
				'For returning attendees we are meeting on the 13th floor, not the 4th.',
				'Clone the Battleship repo before the event — hop in the Discord if you need help getting set up.',
				`Raffle drawing at this event: post a photo of a flyer you hung up or bring a friend to earn entries. Prize is a wireless keyboard/controller!`,
			],
			agenda: [
				{ start: '17:30', end: '17:50', item: 'Social + pizza + Find the bug challenge' },
				{ start: '17:50', end: '17:55', item: 'Find the bug walkthrough' },
				{ start: '17:55', end: '18:00', item: 'Welcome and goal setting' },
				{ start: '18:00', end: '18:45', item: 'Projects breakout (battleship part 2)' },
				{ start: '18:45', end: '19:00', item: 'Wrap up and raffle draw' },
			],
			callToAction: 'Want to share something cool as a talk or lead a project? DM me!',
		},
		recap: [
			`Code Club RDU Event 7 - I may be so bold as to declare this the most hands-on programming event to date! We had around 13 people attend with 6 first-time attendees. 2 of which were referred outside of meetup.com! Thanks for sharing and talking about Code Club y'all.`,
			`The club went back for round two on the 13th floor to write the classic game Battleship. Everyone broke out into two groups - JavaScript and Python. Each group went with a mob approach instead of smaller groups - about 6 people for each language group. The result was one driver and a lot of great questions and answers fired from all sides. Some watched, read ahead, while others typed along. I personally feel it was pretty effective but I would love to hear others thoughts on the matter.`,
			`In goal setting a common thread emerged yet again in which people attended to socialize and meet with other people over a common interest.`,
			`No photo this event but it was still one to remember. I'm excited for next event where we can continue to share ideas and learn together. If anyone has any feedback send me a message or put it in discord.`,
		],
	},
	{
		event: 'Event 6',
		date: '2026-08-06',
		time: '5:30p-7:00p',
		place: '150 Fayetteville - 13th Floor',
		address: '150 Fayetteville St Floor 13',
		city: 'Raleigh, NC',
		meetupLink: 'https://www.meetup.com/code-club-rdu/events/315790401',
		details: {
			notes: [
				'This meeting is hands-on-keyboard so make sure to bring your laptops!',
				'For returning attendees we are meeting on the 13th floor, not the 4th.',
			],
			agenda: [
				{ start: '17:30', end: '17:50', item: 'Social + pizza + Find the bug challenge' },
				{ start: '17:50', end: '17:55', item: 'Find the bug walkthrough' },
				{ start: '17:55', end: '18:05', item: 'Projects kickoff' },
				{ start: '18:05', end: '18:55', item: 'Projects breakout' },
				{ start: '18:55', end: '19:00', item: 'Wrap up and group goal set' },
			],
			callToAction: 'Want to share something cool as a talk or lead a project? DM me!',
		},
		recap: [
			`In Code Club RDU's sixth iteration the group got together and tried our hand at coding battleship. We broke out into groups of 2-4 in JavaScript, Python, and a surprise addition Java.`,
			`We all met on the 13th floor of 150 Fayetteville and I think everyone really enjoyed the space! The extra room, outlets, and desks were a welcome addition.`,
			`Great progress was made across all teams although we had a small hiccup of getting everyone set up with write permissions to GitHub, lesson learned.`,
			`We discussed our goals for the session and it was really interesting to hear how so many cluber's (trying it out) goal was to meet other coders and connect. We also had an open forum to discuss potential added sessions for us to get together more regularly than once a month. Keep the conversation going on discord!`,
			`Lastly as a call to action we all picked up flyers to hang up at your fav local place. It could be a coffee shop, school, anywhere. Code Club RDU is trying to expand. Anyone who posts a picture of the flyer posted or who brings a friend to next month's event get's a special code club surprise and is entered into a raffle for a wireless keyboard/controller.`,
			`Join us for part 2 of battleship, it's going to be a fun one - even if you missed part 1!`,
		],
	},
];

const todayISO = new Date().toLocaleDateString('sv');

const isPast = (e: Event): boolean => e.date < todayISO || !!e.recap;

const byDate = (a: Event, b: Event): number => a.date.localeCompare(b.date);

export const upcomingEvents = events.filter((e) => !isPast(e)).sort(byDate);

export const pastEvents = events.filter(isPast).sort((a, b) => byDate(b, a));

export const nextEvent: Event | undefined = upcomingEvents[0];
