export type ExperienceYears = "1년 미만" | "1–3년" | "4–7년" | "8년 이상";

export type FormValues = {
	name: string;
	email: string;
	experienceYears: ExperienceYears;
	githubUrl?: string;
};

export type OpenFormModalOptions = {
	title?: string;
	description?: string;
	initialValues?: Partial<FormValues>;
	validateEmailPattern?: RegExp;
	experienceOptions?: ExperienceYears[];
};
