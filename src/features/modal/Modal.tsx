import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import React, {
	createContext,
	useContext,
	useEffect,
	useId,
	useRef,
} from "react";

import { useModalController } from "./controller";

const MetaContext = createContext<{
	titleId: string;
	descId: string;
	initialFocusRef?: React.RefObject<HTMLElement | null>;
} | null>(null);
const useMeta = () => {
	const v = useContext(MetaContext);
	if (!v) throw new Error("Modal subcomponents must be used within Modal.Root");
	return v;
};

function Root({ children }: { children: React.ReactNode }) {
	const { open, setOpen, close, triggerRef } = useModalController();
	const titleId = useId();
	const descId = useId();
	const initialFocusRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!open) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [open]);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(n) => {
				if (n) return setOpen(true);
				// 포커스 복귀 우선
				triggerRef.current?.focus();
				close();
			}}
		>
			<MetaContext.Provider value={{ titleId, descId, initialFocusRef }}>
				{children}
			</MetaContext.Provider>
		</Dialog.Root>
	);
}

function Portal({ children }: { children: React.ReactNode }) {
	return <Dialog.Portal>{children}</Dialog.Portal>;
}

function Overlay({
	onPointerDownOutside,
}: {
	onPointerDownOutside?: () => void;
}) {
	return (
		<Dialog.Overlay
			className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out motion-reduce:transition-none"
			onClick={() => onPointerDownOutside?.()}
		/>
	);
}

function Content({ children }: { children: React.ReactNode }) {
	const { titleId, descId, initialFocusRef } = useMeta();
	const { triggerRef } = useModalController();
	const fallbackTitleRef = useRef<HTMLHeadingElement>(null);
	return (
		<Dialog.Content
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-describedby={descId}
			className="fixed left-1/2 top-1/2 w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 motion-reduce:transition-none max-h-[80vh] overflow-auto"
			onOpenAutoFocus={(e) => {
				e.preventDefault();
				(initialFocusRef?.current ?? fallbackTitleRef.current)?.focus();
			}}
			onEscapeKeyDown={() => triggerRef.current?.focus()}
		>
			<VisuallyHidden.Root>
				<Dialog.Title>모달</Dialog.Title>
				<Dialog.Description>설명</Dialog.Description>
			</VisuallyHidden.Root>
			<Title id={titleId} ref={fallbackTitleRef as any} />
			<Description id={descId} />
			{children}
		</Dialog.Content>
	);
}

const Title = React.forwardRef<
	HTMLHeadingElement,
	{ id?: string; children?: React.ReactNode }
>(({ id, children }, ref) => (
	<h2
		id={id}
		ref={ref}
		tabIndex={-1}
		className="text-2xl font-extrabold tracking-tight focus:outline-none"
	>
		{children}
	</h2>
));

function Description({
	id,
	children,
}: {
	id?: string;
	children?: React.ReactNode;
}) {
	return (
		<p id={id} className="text-sm text-gray-600">
			{children}
		</p>
	);
}

function Body({ children }: { children: React.ReactNode }) {
	return <div className="mt-6">{children}</div>;
}
function Footer({ children }: { children: React.ReactNode }) {
	return (
		<div className="mt-6 flex items-center justify-end gap-3">{children}</div>
	);
}

function Close({ children }: { children: React.ReactNode }) {
	const { close } = useModalController();
	return (
		<Dialog.Close asChild onClick={close as any}>
			{children as any}
		</Dialog.Close>
	);
}

export const Modal = {
	Root,
	Portal,
	Overlay,
	Content,
	Title,
	Description,
	Body,
	Footer,
	Close,
};
export default Modal;
