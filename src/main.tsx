import "modern-normalize";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OverlayProvider } from "overlay-kit";
import ModalFormPage from "./ModalFormPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<OverlayProvider>
			<ModalFormPage />
		</OverlayProvider>
	</StrictMode>
);
