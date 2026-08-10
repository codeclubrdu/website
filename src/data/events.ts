export type Agenda = {
	time: string;
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

export const events: Event[] = [
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
				{ time: '5:30–5:50', item: 'Social + pizza + Find the bug challenge' },
				{ time: '5:50–5:55', item: 'Find the bug walkthrough' },
				{ time: '5:55–6:00', item: 'Welcome and goal setting' },
				{ time: '6:00–6:45', item: 'Projects breakout (battleship part 2)' },
				{ time: '6:45–7:00', item: 'Wrap up and raffle draw' },
			],
			callToAction: 'Want to share something cool as a talk or lead a project? DM me!',
		},
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
				{ time: '5:30–5:50', item: 'Social + pizza + Find the bug challenge' },
				{ time: '5:50–5:55', item: 'Find the bug walkthrough' },
				{ time: '5:55–6:05', item: 'Projects kickoff' },
				{ time: '6:05–6:55', item: 'Projects breakout' },
				{ time: '6:55–7:00', item: 'Wrap up and group goal set' },
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
