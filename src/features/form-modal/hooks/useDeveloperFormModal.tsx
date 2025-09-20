"use client";
import { openOverlay } from "@/features/modal/OverlayService";
import DeveloperFormModal from "@/features/form-modal/ui/DeveloperFormModal";

export const useDeveloperFormModal = () => {
	const openDeveloperFormModal = () =>
		openOverlay(() => <DeveloperFormModal />);
	return { openDeveloperFormModal };
};

export function openDeveloperFormModal() {
	return openOverlay(() => <DeveloperFormModal />);
}