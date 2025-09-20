export type ExperienceYears = "1년 미만" | "1–3년" | "4–7년" | "8년 이상";

export type FormValues = {
	name: string;
	email: string;
	experienceYears: ExperienceYears;
	githubUrl?: string;
};
