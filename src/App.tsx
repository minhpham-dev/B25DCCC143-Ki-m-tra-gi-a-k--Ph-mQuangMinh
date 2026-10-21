import { useEffect, useMemo, useState, type FormEvent } from "react";
import {Link,Navigate,Route,Routes,useLocation,useNavigate,useParams,} from "react-router-dom";
import { Icon, type Post } from "./components/BlogComponents";

type Comment = {
  id: number;
  name: string;
  email: string;
  body: string;
};

const API_URL = "https://jsonplaceholder.typicode.com";
const POSTS_KEY = "miniblog-posts";
const categories = ["Lối sống", "Du lịch", "Sáng tạo", "Công nghệ"];

function isPost(value: unknown): value is Post {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.excerpt === "string" &&
    typeof post.category === "string" &&
    typeof post.author === "string" &&
    typeof post.initials === "string" &&
    typeof post.date === "string" &&
    typeof post.readTime === "string" &&
    typeof post.image === "string" &&
    typeof post.likes === "number"
  );
}

function readLocalPosts(): Post[] {
  const saved = window.localStorage.getItem(POSTS_KEY);
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed)) {
    throw new Error("Dữ liệu bài viết đã lưu không hợp lệ.");
  }

  if (!parsed.every(isPost)) {
    throw new Error("Dữ liệu bài viết đã lưu không hợp lệ.");
  }
  return parsed;
}

function PageMessage({ children, error = false }: { children: string; error?: boolean }) {
  return (
    <div className={`thongbao ${error ? "thongbaoloi" : ""}`} role={error ? "alert" : "status"}>
      {children}
    </div>
  );
}

function Header({
  loggedIn,
  onLogout,
  search,
  onSearch,
}: {
  loggedIn: boolean;
  onLogout: () => void;
  search: string;
  onSearch: (value: string) => void;
}) {
  return (
    <header className="thanhtren">
      <Link className="thuonghieu" to="/" aria-label="MiniBlog trang chủ">
        <img className="bieutuong" src="/logo.png" alt="" />
        <span>mini<span className="thuonghieunhat">blog</span></span>
      </Link>
      <nav className="menuchinh" aria-label="Điều hướng chính">
        <Link className="lienketmenu dangchon" to="/">Bài viết</Link>
        {loggedIn && <Link className="lienketmenu" to="/write">Viết bài</Link>}
      </nav>
      <div className="nhomthaotac">
        <label className="otimkiem">
          <Icon name="search" size={17} />
          <input
            aria-label="Tìm theo tiêu đề"
            placeholder="Tìm bài viết..."
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          {search && (
            <button className="nutxoatim" type="button" aria-label="Xóa tìm kiếm" onClick={() => onSearch("")}>
              <Icon name="close" size={14} />
            </button>
          )}
        </label>
        {loggedIn ? (
          <button className="nutxanh" onClick={onLogout}>Đăng xuất</button>
        ) : (
          <Link className="nutxanh" to="/login">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
}

function PostList({
  posts,
  loading,
  error,
  storageError,
  search,
}: {
  posts: Post[];
  loading: boolean;
  error: string;
  storageError: string;
  search: string;
}) {
  const matches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return posts.filter((post) => post.title.toLocaleLowerCase("vi").includes(query));
  }, [posts, search]);
  const visiblePosts = matches.slice(0, 2);

  return (
    <>
      <section className="gioithieu khung">
        <div>
          <div className="dongnho"><span className="gachnho" /> CHUYỆN HAY MỖI NGÀY</div>
          <h1>Bài kiểm tra<br /><em>Giữa kỳ</em></h1>
          <p className="motagioithieu">Làm một trang miniblog<br />hạn nộp 18:00</p>
        </div>
        <div className="hinhminhhoa">
          <img src="/minh-hoa.png" alt="Ảnh minh họa cho trang blog" />
        </div>
      </section>
      <main className="khung noidungtrang">
        <div className="daudanhsach">
          <div>
            <div className="tieudenho"><span>GÓC CỦA CỘNG ĐỒNG</span><span className="duongke" /></div>
            <h2>Bài viết mới nhất<span className="daucham">.</span></h2>
          </div>
          <span className="tongbai">{visiblePosts.length} bài viết</span>
        </div>

        {storageError && <PageMessage error>{storageError}</PageMessage>}
        {error && <PageMessage error>{error}</PageMessage>}
        {loading ? (
          <PageMessage>Đang tải bài viết...</PageMessage>
        ) : matches.length ? (
          <div className="luoibaiviet">
            {visiblePosts.map((post) => (
              <Link className="thebaiviet thelienket" to={`/posts/${post.id}`} key={post.id}>
                <div className="khunganhbai">
                  <img src={post.image} alt="" loading="lazy" />
                  <span className="nhanchude">{post.category}</span>
                </div>
                <div className="noidungthe">
                  <div className="thongtinthe">{post.date} <span>·</span> {post.readTime}</div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="chanthe">
                    <span className="tacgianho">
                      <span className="anhdaidien anhtacgia">{post.initials}</span>
                      <span>{post.author}</span>
                    </span>
                    <span className="doctiep">Đọc bài <Icon name="arrow" size={15} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !error && <div className="trangtrong"><h3>Chưa có bài viết phù hợp</h3><p>Thử tìm bằng một tiêu đề khác nhé.</p></div>
        )}
      </main>
    </>
  );
}

function PostDetail({ localPosts }: { localPosts: Post[] }) {
  const { id = "" } = useParams();
  const localPost = localPosts.find((post) => post.id === id);
  const [post, setPost] = useState<Post | null>(localPost ?? null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!localPost);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localPost) {
      setPost(localPost);
      setComments([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    async function loadPost() {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          fetch(`${API_URL}/posts/${id}`, { signal: controller.signal }),
          fetch(`${API_URL}/posts/${id}/comments`, { signal: controller.signal }),
        ]);

        if (!postResponse.ok || !commentsResponse.ok) {
          throw new Error("Không thể tải bài viết hoặc bình luận.");
        }

        const postData: { id: number; userId: number; title: string; body: string } = await postResponse.json();
        const commentData: Comment[] = await commentsResponse.json();

        if (!postData.id) {
          throw new Error("Bài viết này không tồn tại.");
        }

        setPost({
          id: String(postData.id),
          title: postData.title,
          excerpt: postData.body,
          category: "Bài viết",
          author: `Tác giả ${postData.userId}`,
          initials: String(postData.userId),
          date: "JSONPlaceholder",
          readTime: "Bài viết cộng đồng",
          image: `https://picsum.photos/seed/post-${postData.id}/1100/650`,
          likes: 0,
        });
        setComments(commentData);
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Đã xảy ra lỗi khi tải bài viết.");
        setPost(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPost();
    return () => controller.abort();
  }, [id, localPost]);

  if (loading) return <main className="khung noidungtrang"><PageMessage>Đang tải bài viết...</PageMessage></main>;
  if (error) return <main className="khung noidungtrang"><PageMessage error>{error}</PageMessage><Link className="quaylai" to="/">← Quay về danh sách</Link></main>;
  if (!post) return <NotFound />;

  return (
    <main className="khung noidungtrang trangchitiet">
      <Link className="quaylai" to="/">← Tất cả bài viết</Link>
      <article className="baichitiet">
        <div className="tieudenho"><span>{post.category}</span><span className="duongke" /></div>
        <h1>{post.title}</h1>
        <div className="thongtinbai thongtinchitiet">
          <span className="anhdaidien anhtacgia">{post.initials}</span>
          <span className="tentacgia">{post.author}</span>
          <span className="chamngan">·</span>
          <span>{post.date}</span>
        </div>
        <img className="anhchitiet" src={post.image} alt="" />
        <p className="thanbai">{post.excerpt}</p>
      </article>
      <section className="khubinhluan">
        <div className="tieudenho"><span>BÌNH LUẬN</span><span className="duongke" /></div>
        <h2>{comments.length} bình luận</h2>
        {comments.length ? comments.map((comment) => (
          <article className="binhluan" key={comment.id}>
            <div className="anhbinhluan">{comment.name.charAt(0).toUpperCase()}</div>
            <div>
              <h3>{comment.name}</h3>
              <a href={`mailto:${comment.email}`}>{comment.email}</a>
              <p>{comment.body}</p>
            </div>
          </article>
        )) : <p className="chuacobinhluan">Bài viết này chưa có bình luận.</p>}
      </section>
    </main>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username !== "ppsekai" || password !== "123456") {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      return;
    }
    onLogin();
    navigate("/write", { replace: true });
  }

  return (
    <main className="khung noidungtrang trangform">
      <form className="khungform" onSubmit={handleSubmit}>
        <div className="tieudenho"><span>CHÀO MỪNG BẠN TRỞ LẠI</span></div>
        <h1>Đăng nhập</h1>
        <p className="gioithieuform">Đăng nhập để chia sẻ câu chuyện của bạn.</p>
        {error && <PageMessage error>{error}</PageMessage>}
        <label className="nhantruong" htmlFor="ten-tai-khoan">Tài khoản</label>
        <input className="onhap" id="ten-tai-khoan" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        <label className="nhantruong" htmlFor="mat-khau">Mật khẩu</label>
        <input className="onhap" id="mat-khau" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        <button className="nutxanh nutguiform" type="submit">Đăng nhập</button>
        <p className="taikhoandemo">Tài khoản : <strong>ppsekai</strong> / <strong>123456</strong></p>
      </form>
    </main>
  );
}

function WritePage({ onPublish }: { onPublish: (post: Post) => boolean }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < 5 || cleanTitle.length > 90) {
      setError("Tiêu đề cần có từ 5 đến 90 ký tự.");
      return;
    }
    if (cleanBody.length < 20 || cleanBody.length > 2000) {
      setError("Nội dung cần có từ 20 đến 2.000 ký tự.");
      return;
    }

    const saved = onPublish({
      id: `local-${Date.now()}`,
      title: cleanTitle,
      excerpt: cleanBody,
      category,
      author: "Admin",
      initials: "A",
      date: "Vừa đăng",
      readTime: `${Math.max(1, Math.ceil(cleanBody.split(/\s+/).length / 200))} phút đọc`,
      image: `https://picsum.photos/seed/${Date.now()}/900/600`,
      likes: 0,
    });
    if (saved) navigate("/", { replace: true });
  }

  return (
    <main className="khung noidungtrang trangform">
      <form className="khungform khungvietbai" onSubmit={handleSubmit}>
        <div className="tieudenho"><span>Viết gì đấy đi ._. </span></div>
        <h1>Viết đeee</h1>
        <p className="gioithieuform">Kể chuyện now !!!</p>
        {error && <PageMessage error>{error}</PageMessage>}
        <label className="nhantruong" htmlFor="tieu-de-bai-viet">Tít Le</label>
        <input className="onhap" id="tieu-de-bai-viet" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} required />
        <label className="nhantruong" htmlFor="chu-de-bai-viet">tóp pick</label>
        <select className="onhap" id="chu-de-bai-viet" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="nhantruong" htmlFor="noi-dung-bai-viet">Vào ý chính ngay @-@</label>
        <textarea className="onhap onhapdai ovietbai" id="noi-dung-bai-viet" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} required />
        <div className="chanform"><span>{body.length}/2000 ký tự</span><button className="nutxanh" type="submit">Đăng bài</button></div>
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="khung noidungtrang khongtimthay">
      <span>404</span>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại hoặc bài viết đã bị xóa.</p>
      <Link className="nutxanh" to="/">Về trang chủ</Link>
    </main>
  );
}

function App() {
  const [apiPosts, setApiPosts] = useState<Post[]>([]);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [search, setSearch] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      setLocalPosts(readLocalPosts());
    } catch (cause) {
      setStorageError(cause instanceof Error ? cause.message : "Không đọc được bài viết đã lưu.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setLoading(true);
      setPostsError("");
      try {
        const response = await fetch(`${API_URL}/posts`, { signal: controller.signal });
        if (!response.ok) throw new Error("Không thể tải danh sách bài viết. Vui lòng thử lại.");

        const data: { id: number; userId: number; title: string; body: string }[] = await response.json();
        setApiPosts(data.map((post) => ({
          id: String(post.id),
          title: post.title,
          excerpt: post.body,
          category: "Cộng đồng",
          author: `Tác giả ${post.userId}`,
          initials: String(post.userId),
          date: "JSONPlaceholder",
          readTime: "Bài viết cộng đồng",
          image: `https://picsum.photos/seed/post-${post.id}/900/600`,
          likes: 0,
        })));
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setPostsError(cause instanceof Error ? cause.message : "Đã xảy ra lỗi khi tải bài viết.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPosts();
    return () => controller.abort();
  }, []);

  const posts = useMemo(() => [...localPosts, ...apiPosts], [localPosts, apiPosts]);

  function publishPost(post: Post): boolean {
    const updatedPosts = [post, ...localPosts];
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
      setLocalPosts(updatedPosts);
      setStorageError("");
      return true;
    } catch {
      setStorageError("Không lưu được bài viết vào trình duyệt. Hãy kiểm tra dung lượng lưu trữ.");
      return false;
    }
  }

  function logout() {
    setLoggedIn(false);
    navigate("/");
  }

  function updateSearch(value: string) {
    setSearch(value);
    if (location.pathname !== "/") navigate("/");
  }

  return (
    <div className="khungapp">
      <Header loggedIn={loggedIn} onLogout={logout} search={search} onSearch={updateSearch} />
      <Routes>
        <Route
          path="/"
          element={
            <PostList
              posts={posts}
              loading={loading}
              error={postsError}
              storageError={storageError}
              search={search}
            />
          }
        />
        <Route path="/posts/:id" element={<PostDetail localPosts={localPosts} />} />
        <Route path="/login" element={loggedIn ? <Navigate to="/write" replace /> : <LoginPage onLogin={() => setLoggedIn(true)} />} />
        <Route path="/write" element={loggedIn ? <WritePage onPublish={publishPost} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="chantrang khung">
        <Link className="thuonghieu thuonghieuchan" to="/">
          <img className="bieutuong" src="/logo.png" alt="" />
          <span>mini<span className="thuonghieunhat">blog</span></span>
        </Link>
        <span>tôi là bot.</span>
        <span>©2026 Phạm Quang Minh </span>
      </footer>
    </div>
  );
}

export default App;
