import { useState, type FormEvent } from "react";
import { IoMdClose } from "react-icons/io";
import MDEditor from "@uiw/react-md-editor";

interface SendAnnouncementModalProps {
	onClose: () => void;
	onSend: (subject: string, content: string) => void;
	loading: boolean;
}

const SendAnnouncementModal = ({
	onClose,
	onSend,
	loading,
}: SendAnnouncementModalProps) => {
	const [subject, setSubject] = useState<string>("");
	const [content, setContent] = useState<string>("");

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!subject.trim() || !content.trim()) return;
		onSend(subject, content);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center px-6"
			role="dialog"
		>
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
				<button
					onClick={onClose}
					disabled={loading}
					className="absolute right-4 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 disabled:opacity-50"
				>
					<IoMdClose className="h-8 w-8 hover:text-gray-600 cursor-pointer" />
				</button>

				<h2 className="text-2xl text-acloblue font-semibold mb-6">
					Send Announcement to All Subscribers
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Subject <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Enter email subject"
							className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-acloblue"
							required
							disabled={loading}
						/>
					</div>

					{/* Content with MDEditor */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Message Content <span className="text-red-500">*</span>
						</label>
						<div data-color-mode="light" className="md-big-toolbar">
							<MDEditor
								value={content}
								onChange={(val) => setContent(val ?? "")}
								height={400}
								preview="edit"
								textareaProps={{
									disabled: loading,
									placeholder:
										"Write your announcement message here. You can use Markdown formatting.",
								}}
							/>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Use Markdown to format your message. This will be converted to HTML
							for email.
						</p>
					</div>
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="flex-1 bg-gray-300 text-gray-700 py-3 rounded cursor-pointer hover:bg-gray-400 disabled:bg-gray-300/50 disabled:cursor-not-allowed transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || !subject.trim() || !content.trim()}
							className="flex-1 bg-acloblue text-white py-3 rounded cursor-pointer hover:bg-acloblue/90 disabled:bg-acloblue/50 disabled:cursor-not-allowed transition"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
									Sending...
								</span>
							) : (
								"Send Announcement"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SendAnnouncementModal;
