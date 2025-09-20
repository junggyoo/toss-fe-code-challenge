import { Button } from "./components/ui/button";

const ModalFormPage = () => {
	const handleModalFormOpen = async () => {
		const result = await openFormModal();
	};

	return (
		<div>
			ModalFormPage
			<Button onClick={handleModalFormOpen}>Open Modal</Button>
		</div>
	);
};

export default ModalFormPage;
