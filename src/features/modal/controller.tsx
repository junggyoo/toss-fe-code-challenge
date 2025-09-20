"use client";
import { createContext, useContext, type RefObject } from "react";

export type ModalController<T = unknown> = {
	open: boolean;
	setOpen: (open: boolean) => void;
	triggerRef: RefObject<HTMLElement | null>;
	resolve: (value: T) => void;
	close: () => void;
};

const ModalControllerContext = createContext<ModalController<any> | null>(null);

export function useModalController<T = unknown>(): ModalController<T> {
	const ctx = useContext(ModalControllerContext);
	if (!ctx)
		throw new Error(
			"useModalController must be used within <ModalControllerProvider>"
		);
	return ctx as ModalController<T>;
}

export const ModalControllerProvider = ModalControllerContext.Provider;
