import { OverlayProvider } from "overlay-kit";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
	ModalControllerProvider,
	type ModalController,
} from "@/features/modal/controller";
import DeveloperFormModal from "@/features/form-modal/ui/DeveloperFormModal";
import type { DeveloperFormValues } from "@/features/form-modal/models/developer-form-shema";

const createMockController = (
	overrides = {}
): ModalController<DeveloperFormValues> => ({
	open: true,
	setOpen: vi.fn(),
	triggerRef: { current: null },
	resolve: vi.fn(),
	close: vi.fn(),
	...overrides,
});

const renderWithProviders = (controller = createMockController()) => {
	return render(
		<OverlayProvider>
			<ModalControllerProvider value={controller}>
				<DeveloperFormModal />
			</ModalControllerProvider>
		</OverlayProvider>
	);
};

describe("DeveloperFormModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.style.overflow = "";
	});

	it("모달이 열릴 때 배경 스크롤을 잠근다", () => {
		renderWithProviders();
		expect(document.body.style.overflow).toBe("hidden");
	});

	it("필수 필드가 비어있을 때 검증 오류를 표시한다", async () => {
		const user = userEvent.setup();
		renderWithProviders();

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

	it("유효한 데이터로 제출 시 resolve를 호출한다", async () => {
		const user = userEvent.setup();
		const mockResolve = vi.fn();
		const controller = createMockController({ resolve: mockResolve });
		renderWithProviders(controller);

		// 필수 필드 입력
		await user.type(screen.getByLabelText(/이름.*닉네임/i), "테스트");
		await user.type(screen.getByLabelText(/이메일/i), "test@example.com");
		await user.selectOptions(screen.getByLabelText(/FE 경력 연차/i), "1–3년");

		const submitButton = screen.getByRole("button", { name: /제출하기/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockResolve).toHaveBeenCalledWith({
				name: "테스트",
				email: "test@example.com",
				experienceYears: "1–3년",
				githubUrl: "",
			});
		});
	});

	it("잘못된 이메일 형식 시 오류를 표시한다", async () => {
		const user = userEvent.setup();
		renderWithProviders();

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
		renderWithProviders();

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

	it("취소 버튼 클릭 시 close를 호출한다", async () => {
		const user = userEvent.setup();
		const mockClose = vi.fn();
		const controller = createMockController({ close: mockClose });
		renderWithProviders(controller);

		const cancelButton = screen.getByRole("button", { name: /취소/i });
		await user.click(cancelButton);

		expect(mockClose).toHaveBeenCalled();
	});

	it("기본 제목과 설명이 표시된다", () => {
		renderWithProviders();

		expect(screen.getByText("신청 폼")).toBeInTheDocument();
		expect(
			screen.getByText("이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.")
		).toBeInTheDocument();
	});

	it("경력 연차 옵션이 올바르게 표시된다", () => {
		renderWithProviders();

		const select = screen.getByLabelText(/FE 경력 연차/i);
		expect(select).toBeInTheDocument();

		// 기본 옵션들이 있는지 확인
		expect(
			screen.getByRole("option", { name: "1년 미만" })
		).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "1–3년" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "4–7년" })).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "8년 이상" })
		).toBeInTheDocument();
	});
});
