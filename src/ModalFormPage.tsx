import { useState } from "react";

import type { FormValues } from "@/features/form-modal/types";
import { openDeveloperFormModal } from "@/features/form-modal/useDeveloperFormModal";

import { Button } from "./components/ui/button";

const ModalFormPage = () => {
	const [lastResult, setLastResult] = useState<FormValues | null>(null);

	const handleModalFormOpen = async () => {
		const result = await openDeveloperFormModal();
		setLastResult(result as any);
	};

	return (
		<div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="mx-auto max-w-4xl">
				<header className="text-center py-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						접근성 친화적 모달 폼
					</h1>
					<p className="text-xl text-gray-600 mb-2">
						WCAG 2.2 AA 가이드라인을 준수하는 완전한 접근성 모달 폼
					</p>
					<p className="text-sm text-gray-500">
						키보드 내비게이션, 스크린리더 지원, 포커스 트랩 완벽 구현
					</p>
				</header>

				<div className="grid md:grid-cols-1 gap-8 mb-12">
					<div className="bg-white rounded-2xl p-8 shadow-lg">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							기본 모달 폼
						</h2>
						<p className="text-gray-600 mb-6">
							표준 신청 폼으로 이름, 이메일, 경력 연차를 입력받습니다.
						</p>
						<Button
							onClick={handleModalFormOpen}
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg rounded-xl"
						>
							기본 폼 열기
						</Button>
					</div>
				</div>

				{lastResult && (
					<div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
						<h3 className="text-lg font-semibold text-green-900 mb-3">
							✅ 제출 완료!
						</h3>
						<div className="bg-white rounded-lg p-4">
							<pre className="text-sm text-gray-700 overflow-auto">
								{JSON.stringify(lastResult, null, 2)}
							</pre>
						</div>
					</div>
				)}

				<div className="bg-white rounded-2xl p-8 shadow-lg">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">
						🔧 접근성 기능
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-semibold text-gray-900 mb-2">
								키보드 내비게이션
							</h3>
							<ul className="text-sm text-gray-600 space-y-1">
								<li>
									• <kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> /{" "}
									<kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Tab</kbd>{" "}
									포커스 순환
								</li>
								<li>
									• <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd>{" "}
									모달 닫기
								</li>
								<li>
									• <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>{" "}
									폼 제출
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 mb-2">
								스크린리더 지원
							</h3>
							<ul className="text-sm text-gray-600 space-y-1">
								<li>• 모달 열림 시 제목으로 포커스 이동</li>
								<li>• 검증 오류 즉시 발표</li>
								<li>• ARIA 속성 완벽 연결</li>
							</ul>
						</div>
					</div>
				</div>

				<footer className="text-center py-8 text-gray-500 text-sm">
					<p>Made with ❤️ using React, TypeScript, Radix UI, and TailwindCSS</p>
				</footer>
			</div>
		</div>
	);
};

export default ModalFormPage;
