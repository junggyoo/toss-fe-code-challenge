import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z, type ZodType } from "zod";
import { Button } from "@/components/ui/button";
import type {
	FormValues,
	OpenFormModalOptions,
	ExperienceYears,
} from "./types";

const DEFAULT_EXPERIENCE_OPTIONS: ExperienceYears[] = [
	"1년 미만",
	"1–3년",
	"4–7년",
	"8년 이상",
];

const makeExperienceSchema = (
	allowed: readonly ExperienceYears[]
): ZodType<ExperienceYears> => {
	const literals = allowed.map((v) => z.literal(v)) as [
		z.ZodLiteral<ExperienceYears>,
		...z.ZodLiteral<ExperienceYears>[]
	];
	return z.preprocess(
		(v) => (typeof v === "string" && v.length === 0 ? undefined : v),
		z.union(literals)
	);
};

const createSchema = (
	pattern?: RegExp,
	allowed?: readonly ExperienceYears[]
): ZodType<FormValues> =>
	z.object({
		name: z
			.string()
			.trim()
			.min(1, { message: "이름 또는 닉네임을 입력해 주세요." }),
		email: z
			.string()
			.trim()
			.min(1, { message: "유효한 이메일 주소를 입력해 주세요." })
			.regex(pattern ?? /^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
				message: "유효한 이메일 주소를 입력해 주세요.",
			}),
		experienceYears: makeExperienceSchema(
			allowed ?? DEFAULT_EXPERIENCE_OPTIONS
		),
		githubUrl: z
			.string()
			.trim()
			.optional()
			.refine((v) => !v || /^https?:\/\/.+/.test(v), {
				message: "유효한 URL을 입력해 주세요.",
			}),
	}) as ZodType<FormValues>;

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onResolve: (value: FormValues | null) => void;
	options?: OpenFormModalOptions;
	triggerRef: RefObject<HTMLElement | null>;
};

export function ImperativeFormModal({
	open,
	onOpenChange,
	onResolve,
	options,
	triggerRef,
}: Props) {
	const titleRef = useRef<HTMLHeadingElement>(null);
	const [isMounted, setIsMounted] = useState(false);

	// Scroll lock
	useEffect(() => {
		if (open) {
			const original = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = original;
			};
		}
	}, [open]);

	useEffect(() => setIsMounted(true), []);

	const experienceOptions =
		options?.experienceOptions ?? DEFAULT_EXPERIENCE_OPTIONS;
	const schema = useMemo(
		() => createSchema(options?.validateEmailPattern, experienceOptions),
		[options?.validateEmailPattern, experienceOptions]
	);
	const resolver: Resolver<FormValues> = useMemo(() => {
		return async (values) => {
			const parsed = (schema as ZodType<FormValues>).safeParse(values);
			if (parsed.success) {
				return { values: parsed.data, errors: {} } as const;
			}
			const errors: Record<string, any> = {};
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? "root");
				errors[key] = { type: issue.code, message: issue.message };
			}
			return { values: {}, errors } as const;
		};
	}, [schema]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setFocus,
	} = useForm<FormValues>({
		resolver,
		defaultValues: {
			name: "",
			email: "",
			githubUrl: "",
			...(options?.initialValues ?? {}),
		},
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const closeAndResolve = (value: FormValues | null) => {
		onOpenChange(false);
		onResolve(value);
		// 포커스 복귀
		setTimeout(() => {
			triggerRef.current?.focus();
		}, 0);
	};

	const onSubmit = handleSubmit(
		(values) => closeAndResolve(values),
		() => {
			// 첫 오류 필드 포커스
			const firstKey = Object.keys(errors)[0] as keyof FormValues | undefined;
			if (firstKey) setFocus(firstKey as any);
		}
	);

	const title = options?.title ?? "신청 폼";
	const description =
		options?.description ??
		"이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.";

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) =>
				next ? onOpenChange(true) : closeAndResolve(null)
			}
		>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out motion-reduce:transition-none"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeAndResolve(null);
					}}
				/>
				<Dialog.Content
					role="dialog"
					aria-modal="true"
					aria-labelledby="modalTitle"
					aria-describedby="modalDesc"
					className="fixed left-1/2 top-1/2 w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 motion-reduce:transition-none max-h-[80vh] overflow-auto"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						// 제목으로 포커스 이동
						titleRef.current?.focus();
					}}
				>
					<VisuallyHidden.Root>
						<Dialog.Title>접근성 모달</Dialog.Title>
						<Dialog.Description>폼 입력을 위한 모달입니다.</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="space-y-1">
						<h2
							ref={titleRef}
							id="modalTitle"
							className="text-2xl font-extrabold tracking-tight focus:outline-none"
							tabIndex={-1}
						>
							{title}
						</h2>
						<p id="modalDesc" className="text-sm text-gray-600">
							{description}
						</p>
					</div>

					<form
						className="mt-6 space-y-4"
						onSubmit={onSubmit}
						noValidate
						aria-describedby="formErrors"
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
								{...register("name")}
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? "error-name" : undefined}
								className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
							{errors.name && (
								<p
									id="error-name"
									role="alert"
									className="mt-1 text-sm text-red-600"
								>
									{errors.name.message as string}
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
								{...register("email")}
								aria-invalid={!!errors.email}
								aria-describedby={errors.email ? "error-email" : undefined}
								className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
							{errors.email && (
								<p
									id="error-email"
									role="alert"
									className="mt-1 text-sm text-red-600"
								>
									{errors.email.message as string}
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
								{...register("experienceYears")}
								aria-invalid={!!errors.experienceYears}
								aria-describedby={
									errors.experienceYears ? "error-exp" : undefined
								}
								className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
								defaultValue={""}
							>
								<option value="" disabled>
									선택하세요
								</option>
								{experienceOptions.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
							{errors.experienceYears && (
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
								placeholder="https://github.com/username"
								{...register("githubUrl")}
								aria-invalid={!!errors.githubUrl}
								aria-describedby={errors.githubUrl ? "error-github" : undefined}
								className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
							{errors.githubUrl && (
								<p
									id="error-github"
									role="alert"
									className="mt-1 text-sm text-red-600"
								>
									{errors.githubUrl.message as string}
								</p>
							)}
						</div>

						<div className="mt-6 flex items-center justify-end gap-3">
							<Dialog.Close asChild>
								<Button type="button" variant="secondary">
									취소
								</Button>
							</Dialog.Close>
							<Button
								type="submit"
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								제출하기
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
