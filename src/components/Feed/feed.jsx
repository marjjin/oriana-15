import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PostCard from "./PostCard";
import UploadModal from "../UploadModal/uploadModal";
import "./feed.css";

const SESSION_KEY = "oriana_current_user";
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "feed-images";

function getSavedUser() {
	const raw = localStorage.getItem(SESSION_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function formatDate(value) {
	if (!value) {
		return "Fecha desconocida";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Fecha desconocida";
	}
	return date.toLocaleString("es-AR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function Feed() {
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");

	const currentUser = useMemo(() => getSavedUser(), []);

	const loadPosts = async () => {
		setLoading(true);
		setError("");

		const { data: postRows, error: postError } = await supabase
			.from("publicaciones")
			.select("id, user_id, foto_url, descripcion, created_at")
			.order("created_at", { ascending: false });

		if (postError) {
			setPosts([]);
			setError("No se pudieron cargar las publicaciones.");
			setLoading(false);
			return;
		}

		const userIds = [...new Set((postRows || []).map((post) => post.user_id).filter(Boolean))];
		let usersById = {};

		if (userIds.length > 0) {
			const { data: usersRows } = await supabase
				.from("users")
				.select("id, user_name")
				.in("id", userIds);

			usersById = (usersRows || []).reduce((acc, user) => {
				acc[user.id] = user.user_name;
				return acc;
			}, {});
		}

		const normalizedPosts = (postRows || []).map((post) => ({
			...post,
			user_name: usersById[post.user_id] || "Usuario",
		}));

		setPosts(normalizedPosts);
		setLoading(false);
	};

	useEffect(() => {
		if (!currentUser?.id) {
			navigate("/");
			return;
		}

		const timer = setTimeout(() => {
			loadPosts();
		}, 0);

		return () => clearTimeout(timer);
	}, [navigate, currentUser]);

	const handleUpload = async ({ file, caption }) => {
		if (!file) {
			setError("Seleccioná una imagen antes de publicar.");
			return false;
		}
		if (!currentUser?.id) {
			navigate("/");
			return false;
		}

		setUploading(true);
		setError("");

		const safeName = file.name.replace(/\s+/g, "-");
		const uniquePart =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `${Date.now()}-${Math.round(Math.random() * 999999)}`;
		const filePath = `${currentUser.id}/${Date.now()}-${uniquePart}-${safeName}`;

		const { error: uploadError } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(filePath, file, { upsert: false });

		if (uploadError) {
			setError(
				`No se pudo subir la imagen al bucket ${STORAGE_BUCKET}: ${uploadError.message}`,
			);
			setUploading(false);
			return false;
		}

		const { data: publicData } = supabase.storage
			.from(STORAGE_BUCKET)
			.getPublicUrl(filePath);

		const imageUrl = publicData?.publicUrl;
		if (!imageUrl) {
			setError("No se pudo obtener la URL pública de la imagen.");
			setUploading(false);
			return false;
		}

		const { error: insertError } = await supabase.from("publicaciones").insert([
			{
				user_id: currentUser.id,
				foto_url: imageUrl,
				descripcion: caption.trim() || null,
			},
		]);

		if (insertError) {
			setError(`No se pudo guardar la publicación en la base de datos: ${insertError.message}`);
			setUploading(false);
			return false;
		}

		await loadPosts();
		setUploading(false);
		return true;
	};

	const handleLogout = () => {
		localStorage.removeItem(SESSION_KEY);
		navigate("/");
	};

	return (
		<section className="oriana-feed">
			<div className="oriana-feed__container">
				<div className="oriana-feed__topbar">
					<h2 className="oriana-feed__title">Feed</h2>
					<button className="oriana-feed__logout" type="button" onClick={handleLogout}>
						Cerrar sesión
					</button>
				</div>

				{error && <p className="oriana-feed__error">{error}</p>}

				<div className="oriana-feed__posts" aria-live="polite">
					{loading && <p className="oriana-feed__empty">Cargando publicaciones...</p>}

					{!loading && posts.length === 0 && (
						<p className="oriana-feed__empty">Todavía no hay publicaciones.</p>
					)}

					{!loading &&
						posts.map((post) => (
							<PostCard post={post} formattedDate={formatDate(post.created_at)} key={post.id} />
						))}
				</div>
			</div>

			<UploadModal uploading={uploading} error={error} onSubmit={handleUpload} />
		</section>
	);
}

export default Feed;
