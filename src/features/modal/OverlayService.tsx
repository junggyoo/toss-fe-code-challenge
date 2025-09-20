"use client";
import { overlay } from "overlay-kit";
import { ModalControllerProvider, type ModalController } from "./controller";

export function openOverlay<T>(
	render: () => React.ReactNode
): Promise<T | null> {
	const active =
		(typeof document !== "undefined"
			? (document.activeElement as HTMLElement | null)
			: null) ?? null;
	return overlay.openAsync<T>(({ isOpen, close }) => {
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
