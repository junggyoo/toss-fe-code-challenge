import "modern-normalize";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ModalFormPage from "./ModalFormPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ModalFormPage />
	</StrictMode>
);
