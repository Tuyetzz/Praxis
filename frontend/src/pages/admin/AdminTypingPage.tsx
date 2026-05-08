import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import type { TypingText, TypingTextDifficulty } from "../../types/typingText";
import AdminLayout from "./AdminLayout";
import {
	createTypingText,
	deleteTypingText,
	getTypingTexts,
	updateTypingText,
} from "../../api/typingTexts";

type TypingTextForm = {
	title: string;
	content: string;
	difficulty: TypingTextDifficulty;
	language: string;
	isPublic: boolean;
	isDefault: boolean;
	sourceType: string;
};

const EMPTY_FORM: TypingTextForm = {
	title: "",
	content: "",
	difficulty: "medium",
	language: "english",
	isPublic: false,
	isDefault: false,
	sourceType: "manual",
};

function getDifficultyLabel(difficulty: TypingTextDifficulty) {
	switch (difficulty) {
		case "easy":
			return "Easy";
		case "hard":
			return "Hard";
		default:
			return "Medium";
	}
}

export default function AdminTypingPage() {
	const [texts, setTexts] = useState<TypingText[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<TypingTextForm>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	async function loadTexts() {
		setLoading(true);
		setError(null);
		try {
			const data = await getTypingTexts();
			setTexts(data);
		} catch {
			setError("Unable to load typing texts.");
			setTexts([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadTexts();
	}, []);

	const defaultTexts = useMemo(() => texts.filter((t) => t.isDefault), [texts]);
	const otherTexts = useMemo(() => texts.filter((t) => !t.isDefault), [texts]);

	const handleEdit = (text: TypingText) => {
		setEditingId(text.id);
		setForm({
			title: text.title,
			content: text.content,
			difficulty: text.difficulty,
			language: text.language,
			isPublic: text.isPublic,
			isDefault: text.isDefault,
			sourceType: text.sourceType || "manual",
		});
		setError(null);
	};

	const handleDelete = async (text: TypingText) => {
		if (!window.confirm(`Delete "${text.title}"?`)) return;
		setDeletingId(text.id);
		setError(null);
		try {
			await deleteTypingText(text.id);
			await loadTexts();
		} catch {
			setError("Unable to delete the selected text.");
		} finally {
			setDeletingId(null);
		}
	};

	const handleSubmit = async () => {
		if (!form.title.trim() || !form.content.trim()) {
			setError("Title and content are required.");
			return;
		}

		setError(null);
		setSaving(true);
		try {
			if (editingId) {
				await updateTypingText(editingId, form);
			} else {
				await createTypingText(form);
			}
			setForm(EMPTY_FORM);
			setEditingId(null);
			await loadTexts();
		} catch {
			setError("Unable to save the typing text.");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		setForm(EMPTY_FORM);
		setEditingId(null);
		setError(null);
	};

	return (
		<AdminLayout
			title="Typing Texts"
			subtitle="Manage default texts and remove unsuitable user submissions."
			actions={
				<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
					<button className="admin-button admin-button--muted" onClick={loadTexts}>
						<RefreshCcw size={16} style={{ marginRight: 6 }} />
						Refresh
					</button>
					<button className="admin-button admin-button--primary" onClick={handleReset}>
						<Plus size={16} style={{ marginRight: 6 }} />
						New text
					</button>
				</div>
			}
		>
			<div className="admin-panel">
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<Plus size={18} />
					<strong>{editingId ? "Update Text" : "Create Text"}</strong>
				</div>
				<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
					<input
						className="admin-input"
						placeholder="Title"
						value={form.title}
						onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
					/>
					<input
						className="admin-input"
						placeholder="Language (english)"
						value={form.language}
						onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
					/>
					<select
						className="admin-input"
						value={form.difficulty}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								difficulty: e.target.value as TypingTextDifficulty,
							}))
						}
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
					<select
						className="admin-input"
						value={form.sourceType}
						onChange={(e) => setForm((prev) => ({ ...prev, sourceType: e.target.value }))}
					>
						<option value="manual">Manual</option>
						<option value="ai_summary">AI Summary</option>
					</select>
				</div>
				<div style={{ display: "grid", gap: 12, marginTop: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
					<label style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
						<input
							type="checkbox"
							checked={form.isPublic}
							onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
						/>
						Public text
					</label>
					<label style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
						<input
							type="checkbox"
							checked={form.isDefault}
							onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
						/>
						Default text
					</label>
				</div>
				<textarea
					className="admin-input"
					style={{ width: "100%", minHeight: 140, marginTop: 12 }}
					placeholder="Content"
					value={form.content}
					onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
				/>
				{error && <p style={{ color: "#b91c1c", marginTop: 10 }}>{error}</p>}
				<div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
					<button
						className="admin-button admin-button--primary"
						onClick={handleSubmit}
						disabled={saving}
					>
						{saving ? "Saving..." : editingId ? "Save Changes" : "Create Text"}
					</button>
					{editingId && (
						<button className="admin-button admin-button--muted" onClick={handleReset}>
							Cancel
						</button>
					)}
				</div>
			</div>

			<div className="admin-panel">
				<h2 style={{ margin: 0, fontSize: 20 }}>Default Texts</h2>
				<p style={{ marginTop: 6, color: "#64748b" }}>
					These appear in the public typing practice list.
				</p>
				{loading ? (
					<p style={{ color: "#64748b" }}>Loading...</p>
				) : defaultTexts.length === 0 ? (
					<p style={{ color: "#64748b" }}>No default texts yet.</p>
				) : (
					<div style={{ display: "grid", gap: 12, marginTop: 12 }}>
						{defaultTexts.map((text) => (
							<div key={text.id} className="admin-panel" style={{ padding: 16 }}>
								<div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
									<div>
										<div style={{ fontWeight: 600, fontSize: 16 }}>{text.title}</div>
										<div style={{ color: "#64748b", marginTop: 4 }}>
											{text.content.slice(0, 140)}{text.content.length > 140 ? "..." : ""}
										</div>
									</div>
									<div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
										<span className="admin-tag">{getDifficultyLabel(text.difficulty)}</span>
										{text.isPublic && <span className="admin-tag">Public</span>}
										<span className="admin-tag">{text.sourceType || "manual"}</span>
									</div>
								</div>
								<div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
									<button className="admin-button admin-button--muted" onClick={() => handleEdit(text)}>
										<Pencil size={14} style={{ marginRight: 6 }} />
										Edit
									</button>
									<button
										className="admin-button admin-button--danger"
										onClick={() => handleDelete(text)}
										disabled={deletingId === text.id}
									>
										<Trash2 size={14} style={{ marginRight: 6 }} />
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="admin-panel">
				<h2 style={{ margin: 0, fontSize: 20 }}>All Texts</h2>
				<p style={{ marginTop: 6, color: "#64748b" }}>
					Review user submissions and remove anything unsuitable.
				</p>
				{loading ? (
					<p style={{ color: "#64748b" }}>Loading...</p>
				) : otherTexts.length === 0 ? (
					<p style={{ color: "#64748b" }}>No user submissions yet.</p>
				) : (
					<div style={{ display: "grid", gap: 12, marginTop: 12 }}>
						{otherTexts.map((text) => (
							<div key={text.id} className="admin-panel" style={{ padding: 16 }}>
								<div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
									<div>
										<div style={{ fontWeight: 600, fontSize: 16 }}>{text.title}</div>
										<div style={{ color: "#64748b", marginTop: 4 }}>
											{text.content.slice(0, 140)}{text.content.length > 140 ? "..." : ""}
										</div>
									</div>
									<div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
										<span className="admin-tag">{getDifficultyLabel(text.difficulty)}</span>
										{text.isPublic && <span className="admin-tag">Public</span>}
										{text.isDefault && <span className="admin-tag">Default</span>}
										<span className="admin-tag">{text.sourceType || "manual"}</span>
									</div>
								</div>
								<div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
									<button className="admin-button admin-button--muted" onClick={() => handleEdit(text)}>
										<Pencil size={14} style={{ marginRight: 6 }} />
										Edit
									</button>
									<button
										className="admin-button admin-button--danger"
										onClick={() => handleDelete(text)}
										disabled={deletingId === text.id}
									>
										<Trash2 size={14} style={{ marginRight: 6 }} />
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
