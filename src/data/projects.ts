export type Project = {
	name: string;
	summary: string[];
	languages: string[];
	repoLink: string;
	status: 'current' | 'past';
};

export const projects: Project[] = [
	{
		name: 'Battleship',
		summary: [
			`We're building the classic Battleship game. Groups are split by language — each team has a group lead and works on its own branch in the repo.`,
			`No progress reports here — the branch history is the progress report. Check out your group's branch to see where things stand.`,
		],
		languages: ['JavaScript', 'Python', 'Java'],
		repoLink: 'https://github.com/codeclubrdu/battleship',
		status: 'current',
	},
];

export const currentProjects = projects.filter((p) => p.status === 'current');

export const pastProjects = projects.filter((p) => p.status === 'past');
