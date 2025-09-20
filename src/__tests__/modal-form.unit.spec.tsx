import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImperativeFormModal } from "@/features/form-modal/ImperativeFormModal";
import type {
	FormValues,
	OpenFormModalOptions,
} from "@/features/form-modal/types";

// Mock refs
const mockTriggerRef = { current: null as HTMLElement | null };

describe("ImperativeFormModal", () => {
	const defaultProps = {
		open: true,
		onOpenChange: vi.fn(),
		onResolve: vi.fn(),
		triggerRef: mockTriggerRef,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock focus method
		mockTriggerRef.current = {
			focus: vi.fn(),
		} as any;
	});

	afterEach(() => {
		document.body.style.overflow = "";
	});

	it("모달이 열릴 때 배경 스크롤을 잠근다", () => {
		render(<ImperativeFormModal {...defaultProps} />);
		expect(document.body.style.overflow).toBe("hidden");
	});

	it("필수 필드가 비어있을 때 검증 오류를 표시한다", async () => {
		const user = userEvent.setup();
		render(<ImperativeFormModal {...defaultProps} />);

		const submitButton = screen.getByRole("button", { name: /제출하기/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("이름 또는 닉네임을 입력해 주세요.")
			).toBeInTheDocument();
			expect(
				screen.getByText("유효한 이메일 주소를 입력해 주세요.")
			).toBeInTheDocument();
			expect(
				screen.getByText("FE 경력 연차를 선택해 주세요.")
			).toBeInTheDocument();
		});
	});

	it("유효한 데이터로 제출 시 onResolve를 호출한다", async () => {
		const user = userEvent.setup();
		const onResolve = vi.fn();
		render(<ImperativeFormModal {...defaultProps} onResolve={onResolve} />);

		// 필수 필드 입력
		await user.type(screen.getByLabelText(/이름.*닉네임/i), "테스트");
		await user.type(screen.getByLabelText(/이메일/i), "test@example.com");
		await user.selectOptions(screen.getByLabelText(/FE 경력 연차/i), "1–3년");

		const submitButton = screen.getByRole("button", { name: /제출하기/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(onResolve).toHaveBeenCalledWith({
				name: "테스트",
				email: "test@example.com",
				experienceYears: "1–3년",
				githubUrl: "",
			});
		});
	});

	it("잘못된 이메일 형식 시 오류를 표시한다", async () => {
		const user = userEvent.setup();
		render(<ImperativeFormModal {...defaultProps} />);

		await user.type(screen.getByLabelText(/이름.*닉네임/i), "테스트");
		await user.type(screen.getByLabelText(/이메일/i), "invalid-email");
		await user.selectOptions(screen.getByLabelText(/FE 경력 연차/i), "1–3년");

		const submitButton = screen.getByRole("button", { name: /제출하기/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("유효한 이메일 주소를 입력해 주세요.")
			).toBeInTheDocument();
		});
	});

	it("GitHub URL 검증이 올바르게 동작한다", async () => {
		const user = userEvent.setup();
		render(<ImperativeFormModal {...defaultProps} />);

		await user.type(screen.getByLabelText(/이름.*닉네임/i), "테스트");
		await user.type(screen.getByLabelText(/이메일/i), "test@example.com");
		await user.selectOptions(screen.getByLabelText(/FE 경력 연차/i), "1–3년");
		await user.type(screen.getByLabelText(/GitHub 링크/i), "invalid-url");

		const submitButton = screen.getByRole("button", { name: /제출하기/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("유효한 URL을 입력해 주세요.")
			).toBeInTheDocument();
		});
	});

	it("취소 버튼 클릭 시 null로 resolve한다", async () => {
		const user = userEvent.setup();
		const onResolve = vi.fn();
		render(<ImperativeFormModal {...defaultProps} onResolve={onResolve} />);

		const cancelButton = screen.getByRole("button", { name: /취소/i });
		await user.click(cancelButton);

		expect(onResolve).toHaveBeenCalledWith(null);
	});

	it("커스텀 옵션이 올바르게 적용된다", () => {
		const options: OpenFormModalOptions = {
			title: "커스텀 제목",
			description: "커스텀 설명",
			experienceOptions: ["1년 미만", "1–3년"],
		};

		render(<ImperativeFormModal {...defaultProps} options={options} />);

		expect(screen.getByText("커스텀 제목")).toBeInTheDocument();
		expect(screen.getByText("커스텀 설명")).toBeInTheDocument();

		const select = screen.getByLabelText(/FE 경력 연차/i);
		expect(select).toBeInTheDocument();
		// 커스텀 옵션만 있는지 확인
		expect(
			screen.getByRole("option", { name: "1년 미만" })
		).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "1–3년" })).toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "4–7년" })
		).not.toBeInTheDocument();
	});
});
