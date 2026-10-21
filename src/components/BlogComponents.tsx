import { useState, type FormEvent } from "react";

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  initials: string;
  date: string;
  readTime: string;
  image: string;
  likes: number;
  featured?: boolean;
};

type IconName = "search" | "heart" | "bookmark" | "arrow" | "plus" | "close" | "sparkle";

export function Icon({
  name,
  size = 18,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
    case "heart":
      return <svg {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
    case "bookmark":
      return <svg {...props}><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" /></svg>;
    case "arrow":
      return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "plus":
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case "close":
      return <svg {...props}><path d="m18 6-12 12M6 6l12 12" /></svg>;
    case "sparkle":
      return <svg {...props}><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3ZM19 15l1 2.5 2 1-2 1-1 2.5-1-2.5-2-1 2-1 1-2.5Z" /></svg>;
  }
}

function Author({ post }: { post: Post }) {
  return (
    <span className="authormini">
      <span className="avatar authoravatar">{post.initials}</span>
      <span>{post.author}</span>
    </span>
  );
}

function LikeButton({
  post,
  liked,
  onClick,
}: {
  post: Post;
  liked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`iconaction ${liked ? "isliked" : ""}`}
      aria-label={liked ? "Bỏ thích bài viết" : "Thích bài viết"}
      onClick={onClick}
    >
      <Icon name="heart" size={16} filled={liked} />
      <span>{post.likes}</span>
    </button>
  );
}

export function FeaturedPost({
  post,
  liked,
  saved,
  onLike,
  onSave,
}: {
  post: Post;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
}) {
  return (
    <section className="featuredsection container" aria-label="Bài viết nổi bật">
      <div className="sectionkicker">
        <span>BÀI VIẾT NỔI BẬT</span>
        <span className="kickerrule" />
      </div>
      <article className="featuredcard">
        <div className="featuredimagewrap">
          <img className="featuredimage" src={post.image} alt="" />
          <span className="imagelabel">
            <Icon name="sparkle" size={14} /> LỰA CHỌN CỦA TUẦN
          </span>
        </div>
        <div className="featuredcontent">
          <span className="categorypill">{post.category}</span>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <div className="postmeta featuredmeta">
            <span className="avatar authoravatar">{post.initials}</span>
            <span className="authorname">{post.author}</span>
            <span className="metadot">·</span>
            <span>{post.date}</span>
            <span className="metadot">·</span>
            <span>{post.readTime}</span>
          </div>
          <div className="featuredfooter">
            <button
              className="textlink"
              onClick={() => document.getElementById("bai-viet")?.scrollIntoView({ behavior: "smooth" })}
            >
              Đọc bài viết <Icon name="arrow" size={17} />
            </button>
            <div className="postactions">
              <LikeButton post={post} liked={liked} onClick={onLike} />
              <button
                className={`iconaction ${saved ? "issaved" : ""}`}
                aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                onClick={onSave}
              >
                <Icon name="bookmark" size={18} filled={saved} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

export function PostCard({
  post,
  liked,
  saved,
  onLike,
  onSave,
}: {
  post: Post;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
}) {
  return (
    <article className="postcard">
      <div className="postimagewrap">
        <img src={post.image} alt="" loading="lazy" />
        <span className="postcategory">{post.category}</span>
        <button
          className={`imagesave ${saved ? "issaved" : ""}`}
          aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
          onClick={onSave}
        >
          <Icon name="bookmark" size={17} filled={saved} />
        </button>
      </div>
      <div className="postcardcontent">
        <div className="cardmeta">
          {post.date} <span>·</span> {post.readTime}
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="cardfooter">
          <Author post={post} />
          <LikeButton post={post} liked={liked} onClick={onLike} />
        </div>
      </div>
    </article>
  );
}

export function ComposerModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (title: string, excerpt: string, category: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Lối sống");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPublish(title.trim(), excerpt.trim(), category);
  }

  return (
    <div
      className="modalbackdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="composermodal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="modalheading">
          <div>
            <span className="sectionkicker"><span>GÓC CỦA BẠN</span></span>
            <h2 id="composer-title">Viết một điều gì đó.</h2>
          </div>
          <button className="modalclose" aria-label="Đóng" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="fieldlabel" htmlFor="post-title">Tiêu đề</label>
          <input
            id="post-title"
            className="forminput"
            placeholder="Bạn đang nghĩ về điều gì?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={90}
            required
            autoFocus
          />
          <label className="fieldlabel" htmlFor="post-excerpt">Câu chuyện của bạn</label>
          <textarea
            id="post-excerpt"
            className="forminput formtextarea"
            placeholder="Hãy viết ra một vài dòng..."
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            maxLength={280}
            required
          />
          <label className="fieldlabel" htmlFor="postcategory">Chủ đề</label>
          <select
            id="postcategory"
            className="forminput"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["Lối sống", "Du lịch", "Sáng tạo", "Công nghệ"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <div className="formfooter">
            <span>{excerpt.length}/280 ký tự</span>
            <button className="writebutton" type="submit">
              <Icon name="plus" size={17} /> Đăng bài
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
