import { createRoot } from "react-dom/client";
import { StrictMode, useRef, useState } from "react";
import { ImperativeFormModal } from "./ImperativeFormModal";
import type { FormValues, OpenFormModalOptions } from "./types";

let isOpenGlobal = false;

export function openFormModal(
	options?: OpenFormModalOptions
): Promise<FormValues | null> {
	if (isOpenGlobal) return Promise.resolve(null);
	isOpenGlobal = true;

	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	return new Promise((resolve) => {
		const App = () => {
			const triggerRef = useRef<HTMLElement>(
				document.activeElement as HTMLElement
			);
			const [open, setOpen] = useState(true);

			const handleResolve = (value: FormValues | null) => {
				isOpenGlobal = false;
				resolve(value);
				setTimeout(() => {
					root.unmount();
					container.remove();
				}, 0);
			};

			return (
				<ImperativeFormModal
					open={open}
					onOpenChange={setOpen}
					onResolve={handleResolve}
					options={options}
					triggerRef={triggerRef}
				/>
			);
		};

		root.render(
			<StrictMode>
				<App />
			</StrictMode>
		);
	});
}

declare global {
	interface Window {
		openFormModal?: typeof openFormModal;
	}
}

// 개발 편의를 위해 전역에 노출 (사용자는 import 사용 권장)
if (typeof window !== "undefined") {
	window.openFormModal = openFormModal;
}
