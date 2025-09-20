import { openOverlay } from "@/features/modal/OverlayService";

import DeveloperFormModal from "./DeveloperFormModal";

export const useDeveloperFormModal = () => {
	const openDeveloperFormModal = () =>
		openOverlay(() => <DeveloperFormModal />);
	return { openDeveloperFormModal };
};
