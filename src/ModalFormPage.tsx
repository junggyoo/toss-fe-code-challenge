import { Button } from "./components/ui/button";
import { openFormModal } from "@/features/form-modal/openFormModal";

const ModalFormPage = () => {
	const handleModalFormOpen = async () => {
		const result = await openFormModal();
	};

	return (
		<div className="grid min-h-dvh place-items-center p-6">
			<h1 className="sr-only">접근성 모달 폼 데모</h1>
			<Button
				onClick={handleModalFormOpen}
				className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg rounded-xl"
			>
				신청 폼 작성하기
			</Button>
		</div>
	);
};

export default ModalFormPage;
