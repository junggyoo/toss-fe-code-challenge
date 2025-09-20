"use client";
import { overlay } from "overlay-kit";
import { useRef } from "react";
import { ModalControllerProvider, type ModalController } from "./controller";

export function openOverlay<T>(
	render: () => React.ReactNode
): Promise<T | null> {
	console.log("openOverlay 호출됨");
	const active =
		(typeof document !== "undefined"
			? (document.activeElement as HTMLElement | null)
			: null) ?? null;
	return overlay.openAsync<T>(({ isOpen, close }) => {
		console.log("overlay.openAsync 콜백 실행, isOpen:", isOpen);
		const triggerRef = { current: active } as React.RefObject<HTMLElement>;
		const controller: ModalController<T> = {
			open: isOpen,
			setOpen: (next) => {
				if (!next) close(null as unknown as T);
			},
			triggerRef,
			resolve: (v) => close(v),
			close: () => close(null as unknown as T),
		};
		return (
			<ModalControllerProvider value={controller}>
				{render()}
			</ModalControllerProvider>
		);
	});
}
