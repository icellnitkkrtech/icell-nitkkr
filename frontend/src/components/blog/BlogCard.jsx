import { getOptimizedCloudinaryUrl, CLOUDINARY_PRESETS } from "../../utils/cloudinary";

export default function BlogCard({ blog, onClick }) {
  const readTime =
    blog.read_time ||
    Math.max(
      1,
      Math.ceil((blog.content || "").split(/\s+/).filter(Boolean).length / 120)
    );

  return (
    <div className="perspective-[1200px] h-full">
      <div
        onClick={() => onClick && onClick(blog)}
        className="
          group cursor-pointer
          relative flex flex-col h-full overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/5 backdrop-blur-sm
          
          transform-gpu
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          
          rotate-x-[12deg] -translate-y-3 sm:rotate-x-[16deg] sm:-translate-y-5
          shadow-[0_25px_50px_rgba(0,0,0,0.6)]
          
          hover:rotate-x-0
          hover:translate-y-0
          hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]
          hover:border-indigo-500/40
        "
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10] bg-[#1a1a1a]">
          {blog.image ? (
            <img
              src={
                getOptimizedCloudinaryUrl(
                  blog.image,
                  CLOUDINARY_PRESETS.thumbnail
                ) || blog.image
              }
              alt={blog.title}
              className="
                w-full h-full object-cover
                transition-transform duration-700
                group-hover:scale-110
              "
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-neutral-900 to-neutral-800">
              ✍️
            </div>
          )}

          {/* Category Badge */}
          <span
            className="
            absolute top-3 left-3
            px-3 py-1
            text-[10px] font-semibold tracking-wider uppercase
            rounded-full
            bg-black/60 backdrop-blur-md
            border border-white/20
            text-white
          "
          >
            {blog.category}
          </span>

          {/* Reading Time Badge */}
          <span
            className="
            absolute top-3 right-3
            px-2.5 py-1
            text-[10.5px] font-medium
            rounded-full
            bg-black/70 backdrop-blur-md
            border border-white/15
            text-cyan-300 flex items-center gap-1
          "
          >
            🕒 {readTime} min read
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5 p-5 flex-1">
          <h3
            className="
            text-white
            font-serif
            text-[17px]
            font-semibold
            leading-snug
            line-clamp-2
            group-hover:text-indigo-200
            transition-colors
          "
          >
            {blog.title}
          </h3>

          <p
            className="
            text-white/55
            text-[13px]
            leading-relaxed
            line-clamp-2
          "
          >
            {blog.description}
          </p>

          {/* Tags Chips */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
              {blog.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-indigo-300 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="
            flex items-center justify-between
            pt-3 mt-1
            border-t border-white/10
          "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                w-7 h-7 rounded-full
                bg-gradient-to-br from-indigo-500 to-purple-600
                flex items-center justify-center
                text-[11px] font-bold text-white
              "
              >
                {(blog.author || "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-white/60 text-[12px] truncate max-w-[130px]">
                {blog.author}
              </span>
            </div>

            <span
              className="
              text-[12px] font-medium
              flex items-center gap-1
              text-white/40
              transition-all duration-300
              group-hover:text-white
              group-hover:translate-x-1
            "
            >
              Read
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M7 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}