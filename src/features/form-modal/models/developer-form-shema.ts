import { z } from "zod";

export const EXPERIENCE = ["1년 미만", "1–3년", "4–7년", "8년 이상"] as const;

export type ExperienceYears = "1년 미만" | "1–3년" | "4–7년" | "8년 이상";

const makeExperienceSchema = (): z.ZodType<ExperienceYears> => {
	const literals = EXPERIENCE.map((v) => z.literal(v)) as [
		z.ZodLiteral<(typeof EXPERIENCE)[number]>,
		...z.ZodLiteral<(typeof EXPERIENCE)[number]>[]
	];
	return z.preprocess(
		(v) => (typeof v === "string" && v.length === 0 ? undefined : v),
		z.union(literals)
	);
};

export const developerFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "이름 또는 닉네임을 입력해 주세요." }),
	email: z
		.string()
		.trim()
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
			message: "유효한 이메일 주소를 입력해 주세요.",
		}),
	experienceYears: makeExperienceSchema(),
	githubUrl: z
		.string()
		.trim()
		.optional()
		.refine((v) => !v || /^https?:\/\/.+/.test(v), {
			message: "유효한 URL을 입력해 주세요.",
		}),
});

export type DeveloperFormValues = z.infer<typeof developerFormSchema>;
