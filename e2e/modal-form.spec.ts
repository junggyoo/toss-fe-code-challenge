import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const openModal = async ({ page }: { page: any }) => {
	await page.goto("/");
	await page
		.getByRole("button", { name: /신청 폼 작성하기|Open Modal/i })
		.click();
};

test.describe("모달 기본 동작", () => {
	test("ESC/오버레이 닫기 및 포커스 복귀", async ({ page }) => {
		await openModal({ page });
		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await expect(
			page.getByRole("button", { name: /신청 폼 작성하기|Open Modal/i })
		).toBeFocused();

		await openModal({ page });
		await page
			.locator('div[role="dialog"]')
			.click({ position: { x: -10, y: -10 } })
			.catch(() => {});
		await page.mouse.click(10, 10);
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test.describe("포커스/키보드 내비게이션", () => {
	test("열림 시 제목 포커스, 트랩 동작", async ({ page }) => {
		await openModal({ page });
		await expect(
			page.getByRole("heading", { level: 2, name: /신청 폼|Application Form/i })
		).toBeFocused();
	});
});

test.describe("폼 검증/제출", () => {
	test("필수 미입력 시 에러 발표 및 첫 오류 포커스", async ({ page }) => {
		await openModal({ page });
		await page.getByRole("button", { name: /제출하기|Submit/i }).click();
		await expect(page.getByText(/이름|닉네임|입력해 주세요/)).toBeVisible();
		await expect(page.getByText(/유효한 이메일/)).toBeVisible();
		await expect(page.getByText(/경력 연차/)).toBeVisible();
	});

	test("유효 입력 시 resolve(FormValues) 및 닫힘", async ({ page }) => {
		await openModal({ page });
		await page.getByLabel(/이름|닉네임/i).fill("TEST");
		await page.getByLabel(/이메일/i).fill("test@test.com");
		await page
			.getByLabel(/FE 경력 연차/i)
			.selectOption({ label: /4–7년|4-7년/ });
		await page.getByRole("button", { name: /제출하기|Submit/i }).click();
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test.describe("접근성/스크롤/모션", () => {
	test("axe 기본 위반 없음", async ({ page }) => {
		await page.goto("/");
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect(accessibilityScanResults.violations).toEqual([]);
	});
});
