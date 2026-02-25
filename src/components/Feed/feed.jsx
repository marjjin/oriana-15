import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PostCard from "./PostCard";
import UploadModal from "../UploadModal";
import { usePostLikes } from "../likes";
import { usePostComments } from "../comments";
import "./feed.css";

const SESSION_KEY = "oriana_current_user";
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "feed-images";
const INITIAL_POSTS_LIMIT = 10;
const LOAD_MORE_POSTS_LIMIT = 5;

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

function Feed({ currentUser: currentUserProp, onLogout }) {
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMorePosts, setHasMorePosts] = useState(true);
	const [nextOffset, setNextOffset] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const loadMoreTriggerRef = useRef(null);

	const currentUser = useMemo(() => currentUserProp || getSavedUser(), [currentUserProp]);
	const { enrichPostsWithLikes, toggleLike, pendingByPostId } = usePostLikes(
		currentUser?.id,
		setError,
	);
	const {
		enrichPostsWithCommentCounts,
		openByPostId,
		loadingByPostId,
		submittingByPostId,
		deletingByCommentId,
		commentsByPostId,
		toggleComments,
		addComment,
		removeComment,
	} = usePostComments(currentUser?.id, setError);

	const fetchEnrichedPostsPage = useCallback(
		async ({ offset, limit }) => {
			const { data: postRows, error: postError } = await supabase
				.from("publicaciones")
				.select("id, user_id, foto_url, descripcion, created_at")
				.order("created_at", { ascending: false })
				.range(offset, offset + limit - 1);

			if (postError) {
				return { error: postError, posts: [] };
			}

			const userIds = [...new Set((postRows || []).map((post) => post.user_id).filter(Boolean))];
			let usersById = {};

			if (userIds.length > 0) {
				const { data: usersRows } = await supabase
					.from("users")
					.select("id, user_name, profile_photo_url")
					.in("id", userIds);

				usersById = (usersRows || []).reduce((acc, user) => {
					acc[user.id] = {
						name: user.user_name,
						avatarUrl: user.profile_photo_url || "",
					};
					return acc;
				}, {});
			}

			const normalizedPosts = (postRows || []).map((post) => ({
				...post,
				user_name: usersById[post.user_id]?.name || "Usuario",
				user_avatar_url:
					usersById[post.user_id]?.avatarUrl ||
					(currentUser?.id === post.user_id ? currentUser.profile_photo_url || "" : ""),
			}));

			const [postsWithLikes, postsWithComments] = await Promise.all([
				enrichPostsWithLikes(normalizedPosts),
				enrichPostsWithCommentCounts(normalizedPosts),
			]);

			const commentsById = new Map(postsWithComments.map((post) => [post.id, post.commentCount || 0]));
			const postsWithLikesAndComments = postsWithLikes.map((post) => ({
				...post,
				commentCount: commentsById.get(post.id) || 0,
			}));
			return {
				error: null,
				posts: postsWithLikesAndComments,
			};
		},
		[currentUser, enrichPostsWithCommentCounts, enrichPostsWithLikes],
	);

	const loadInitialPosts = useCallback(async () => {
		setLoading(true);
		setError("");

		const { error: postError, posts: firstPagePosts } = await fetchEnrichedPostsPage({
			offset: 0,
			limit: INITIAL_POSTS_LIMIT,
		});

		if (postError) {
			setPosts([]);
			setHasMorePosts(false);
			setNextOffset(0);
			setError("No se pudieron cargar las publicaciones.");
			setLoading(false);
			return;
		}

		setPosts(firstPagePosts);
		setNextOffset(firstPagePosts.length);
		setHasMorePosts(firstPagePosts.length === INITIAL_POSTS_LIMIT);
		setLoading(false);
	}, [fetchEnrichedPostsPage]);

	const loadMorePosts = useCallback(async () => {
		if (loading || loadingMore || !hasMorePosts) {
			return;
		}

		setLoadingMore(true);

		const { error: postError, posts: nextPosts } = await fetchEnrichedPostsPage({
			offset: nextOffset,
			limit: LOAD_MORE_POSTS_LIMIT,
		});

		if (postError) {
			setError("No se pudieron cargar más publicaciones.");
			setLoadingMore(false);
			return;
		}

		setPosts((prevPosts) => {
			const existingIds = new Set(prevPosts.map((post) => post.id));
			const uniqueNextPosts = nextPosts.filter((post) => !existingIds.has(post.id));
			return [...prevPosts, ...uniqueNextPosts];
		});
		setNextOffset((prevOffset) => prevOffset + nextPosts.length);
		setHasMorePosts(nextPosts.length === LOAD_MORE_POSTS_LIMIT);
		setLoadingMore(false);
	}, [fetchEnrichedPostsPage, hasMorePosts, loading, loadingMore, nextOffset]);

	useEffect(() => {
		if (!currentUser?.id) {
			navigate("/");
			return;
		}

		const timer = setTimeout(() => {
			loadInitialPosts();
		}, 0);

		return () => clearTimeout(timer);
	}, [loadInitialPosts, navigate, currentUser]);

	useEffect(() => {
		if (!loadMoreTriggerRef.current) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting) {
					loadMorePosts();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(loadMoreTriggerRef.current);

		return () => {
			observer.disconnect();
		};
	}, [loadMorePosts]);

	const handleUpload = async ({ file, originalFile, caption, onUploadProgress }) => {
		if (!file) {
			setError("Seleccioná una imagen o un video antes de publicar.");
			return false;
		}
		if (!currentUser?.id) {
			navigate("/");
			return false;
		}

		setUploading(true);
		setError("");

		onUploadProgress?.(2);
		let progressValue = 2;
		const progressTimer = setInterval(() => {
			progressValue = Math.min(90, progressValue + 4);
			onUploadProgress?.(progressValue);
		}, 250);

		const safeName = file.name.replace(/\s+/g, "-");
		const originalSafeName = originalFile?.name?.replace(/\s+/g, "-") || safeName;
		const uniquePart =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `${Date.now()}-${Math.round(Math.random() * 999999)}`;
		const timestamp = Date.now();
		const filePath = `${currentUser.id}/${timestamp}-${uniquePart}-${safeName}`;
		const originalFilePath = originalFile
			? `originals/${currentUser.id}/${timestamp}-${uniquePart}-${originalSafeName}`
			: null;

		const { error: uploadError } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(filePath, file, { upsert: false });

		if (uploadError) {
			clearInterval(progressTimer);
			onUploadProgress?.(0);
			const maxSizeExceeded = /exceeded the maximum allowed size/i.test(uploadError.message || "");

			if (maxSizeExceeded) {
				setError(
					"El archivo supera el tamaño máximo permitido por el bucket. Probá con un video más liviano.",
				);
				setUploading(false);
				return false;
			}

			setError(
				`No se pudo subir el archivo al bucket ${STORAGE_BUCKET}: ${uploadError.message}`,
			);
			setUploading(false);
			return false;
		}

		if (originalFilePath && originalFile) {
			const { error: originalUploadError } = await supabase.storage
				.from(STORAGE_BUCKET)
				.upload(originalFilePath, originalFile, { upsert: false });

			if (originalUploadError) {
				clearInterval(progressTimer);
				onUploadProgress?.(0);
				setError(
					`Se subió la versión para el feed, pero falló la copia original: ${originalUploadError.message}`,
				);
				setUploading(false);
				return false;
			}
		}

		const { data: publicData } = supabase.storage
			.from(STORAGE_BUCKET)
			.getPublicUrl(filePath);

		const imageUrl = publicData?.publicUrl;
		if (!imageUrl) {
			clearInterval(progressTimer);
			onUploadProgress?.(0);
			setError("No se pudo obtener la URL pública del archivo.");
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
			clearInterval(progressTimer);
			onUploadProgress?.(0);
			setError(`No se pudo guardar la publicación en la base de datos: ${insertError.message}`);
			setUploading(false);
			return false;
		}

		clearInterval(progressTimer);
		onUploadProgress?.(100);

		await loadInitialPosts();
		setUploading(false);
		return true;
	};

	const handleLogout = () => {
		if (onLogout) {
			onLogout();
		} else {
			localStorage.removeItem(SESSION_KEY);
		}
		navigate("/", { replace: true });
	};

	const handleToggleLike = async (postId) => {
		const currentPost = posts.find((post) => post.id === postId);
		if (!currentPost) {
			return;
		}

		const wasLiked = Boolean(currentPost.likedByCurrentUser);

		setPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id !== postId) {
					return post;
				}

				return {
					...post,
					likedByCurrentUser: !wasLiked,
					likeCount: Math.max(0, (post.likeCount || 0) + (wasLiked ? -1 : 1)),
				};
			}),
		);

		const success = await toggleLike({ postId, currentlyLiked: wasLiked });

		if (!success) {
			setPosts((prevPosts) =>
				prevPosts.map((post) => {
					if (post.id !== postId) {
						return post;
					}

					return {
						...post,
						likedByCurrentUser: wasLiked,
						likeCount: Math.max(0, (post.likeCount || 0) + (wasLiked ? 1 : -1)),
					};
				}),
			);
		}
	};

	const handleAddComment = async ({ postId, text }) => {
		const success = await addComment({ postId, text });

		if (success) {
			setPosts((prevPosts) =>
				prevPosts.map((post) => {
					if (post.id !== postId) {
						return post;
					}

					return {
						...post,
						commentCount: (post.commentCount || 0) + 1,
					};
				}),
			);
		}

		return success;
	};

	const handleDeleteComment = async ({ postId, commentId }) => {
		const success = await removeComment({ postId, commentId });

		if (success) {
			setPosts((prevPosts) =>
				prevPosts.map((post) => {
					if (post.id !== postId) {
						return post;
					}

					return {
						...post,
						commentCount: Math.max(0, (post.commentCount || 0) - 1),
					};
				}),
			);
		}

		return success;
	};

	const handleOpenProfile = (userId) => {
		if (!userId) {
			return;
		}

		navigate(`/perfil/${userId}`);
	};

	const profileEntryAvatarUrl =
		currentUser?.profile_photo_url || "";
	const profileEntryFallback =
		(currentUser?.user_name || "U").trim().charAt(0).toUpperCase() || "U";

	return (
		<section className="oriana-feed">
			<div className="oriana-feed__container">
				<div className="oriana-feed__topbar">
					<button
						type="button"
						className="oriana-feed__profile-entry"
						onClick={() => navigate("/perfil")}
					>
						<span className="oriana-feed__profile-entry-avatar-wrap" aria-hidden="true">
							{profileEntryAvatarUrl ? (
								<img
									className="oriana-feed__profile-entry-avatar"
									src={profileEntryAvatarUrl}
									alt={`Avatar de ${currentUser?.user_name || "perfil"}`}
								/>
							) : (
								<span className="oriana-feed__profile-entry-avatar-fallback">
									{profileEntryFallback}
								</span>
							)}
						</span>
						<span className="oriana-feed__profile-entry-name">
							@{currentUser?.user_name || "perfil"}
						</span>
					</button>
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
							<PostCard
								post={post}
								formattedDate={formatDate(post.created_at)}
								onToggleLike={handleToggleLike}
								likePending={Boolean(pendingByPostId[post.id])}
								comments={commentsByPostId[post.id] || []}
								commentCount={post.commentCount || 0}
								currentUserId={currentUser?.id}
								commentsOpen={Boolean(openByPostId[post.id])}
								commentsLoading={Boolean(loadingByPostId[post.id])}
								commentSubmitting={Boolean(submittingByPostId[post.id])}
								deletingByCommentId={deletingByCommentId}
								onToggleComments={toggleComments}
								onAddComment={handleAddComment}
								onDeleteComment={handleDeleteComment}
								onOpenProfile={handleOpenProfile}
								key={post.id}
							/>
						))}

						{!loading && loadingMore && (
							<p className="oriana-feed__load-more">Cargando más publicaciones...</p>
						)}

						{!loading && !loadingMore && hasMorePosts && (
							<div ref={loadMoreTriggerRef} className="oriana-feed__load-trigger" aria-hidden="true" />
						)}
				</div>
			</div>

			<UploadModal uploading={uploading} error={error} onSubmit={handleUpload} />
		</section>
	);
}

export default Feed;
