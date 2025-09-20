"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/features/modal/Modal";
import { Button } from "@/components/ui/button";
import { useModalController } from "@/features/modal/controller";

const EXPERIENCE = ["1년 미만", "1–3년", "4–7년", "8년 이상"] as const;

const makeExperienceSchema = () => {
	const literals = EXPERIENCE.map((v) => z.literal(v)) as [
		z.ZodLiteral<(typeof EXPERIENCE)[number]>,
		...z.ZodLiteral<(typeof EXPERIENCE)[number]>[]
	];
	return z.preprocess(
		(v) => (typeof v === "string" && v.length === 0 ? undefined : v),
		z.union(literals)
	);
};

const schema = z.object({
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

type Values = z.infer<typeof schema>;

export default function DeveloperFormModal() {
	const controller = useModalController<Values>();
	const form = useForm<Values>({
		defaultValues: {
			name: "",
			email: "",
			experienceYears: "" as any,
			githubUrl: "",
		},
		resolver: zodResolver(schema) as any,
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const handleSubmit = form.handleSubmit(
		(v) => controller.resolve(v),
		() => {
			const keys = Object.keys(form.formState.errors) as Array<keyof Values>;
			if (keys[0]) form.setFocus(keys[0] as any);
		}
	);

	return (
		<Modal.Root>
			<Modal.Portal>
				<Modal.Overlay onPointerDownOutside={() => controller.close()} />
				<Modal.Content>
					<Modal.Title>신청 폼</Modal.Title>
					<Modal.Description>
						이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.
					</Modal.Description>
					<Modal.Body>
						<form
							id="__dev_form__"
							noValidate
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-800"
								>
									이름 / 닉네임
								</label>
								<input
									id="name"
									{...form.register("name")}
									aria-invalid={!!form.formState.errors.name}
									aria-describedby={
										form.formState.errors.name ? "error-name" : undefined
									}
									className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
								/>
								{form.formState.errors.name && (
									<p
										id="error-name"
										role="alert"
										className="mt-1 text-sm text-red-600"
									>
										{form.formState.errors.name.message as string}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-800"
								>
									이메일
								</label>
								<input
									id="email"
									type="email"
									{...form.register("email")}
									aria-invalid={!!form.formState.errors.email}
									aria-describedby={
										form.formState.errors.email ? "error-email" : undefined
									}
									className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
								/>
								{form.formState.errors.email && (
									<p
										id="error-email"
										role="alert"
										className="mt-1 text-sm text-red-600"
									>
										{form.formState.errors.email.message as string}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="experienceYears"
									className="block text-sm font-medium text-gray-800"
								>
									FE 경력 연차
								</label>
								<select
									id="experienceYears"
									{...form.register("experienceYears")}
									aria-invalid={!!form.formState.errors.experienceYears}
									aria-describedby={
										form.formState.errors.experienceYears
											? "error-exp"
											: undefined
									}
									className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
									defaultValue={""}
								>
									<option value="" disabled>
										선택하세요
									</option>
									{EXPERIENCE.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
								{form.formState.errors.experienceYears && (
									<p
										id="error-exp"
										role="alert"
										className="mt-1 text-sm text-red-600"
									>
										FE 경력 연차를 선택해 주세요.
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="githubUrl"
									className="block text-sm font-medium text-gray-800"
								>
									GitHub 링크 (선택)
								</label>
								<input
									id="githubUrl"
									type="url"
									{...form.register("githubUrl")}
									aria-invalid={!!form.formState.errors.githubUrl}
									aria-describedby={
										form.formState.errors.githubUrl ? "error-github" : undefined
									}
									className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
								/>
								{form.formState.errors.githubUrl && (
									<p
										id="error-github"
										role="alert"
										className="mt-1 text-sm text-red-600"
									>
										{form.formState.errors.githubUrl.message as string}
									</p>
								)}
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>
							<Button type="button" variant="secondary">
								취소
							</Button>
						</Modal.Close>
						<Button
							type="submit"
							form="__dev_form__"
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							제출하기
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Portal>
		</Modal.Root>
	);
}
