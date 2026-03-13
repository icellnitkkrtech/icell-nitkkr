
export default function BlogCard({ blog, onClick }) {
  return (
    <div className="perspective-[1200px]">
      <div
        onClick={() => onClick && onClick(blog)}
        className="
          group cursor-pointer
          relative flex flex-col overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/5 backdrop-blur-sm
          
          transform-gpu
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          
          rotate-x-[18deg] -translate-y-6
          shadow-[0_30px_60px_rgba(0,0,0,0.6)]
          
          hover:rotate-x-0
          hover:translate-y-0
          hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]
        "
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={blog.image}
            alt={blog.title}
            className="
              w-full h-full object-cover
              transition-transform duration-700
              group-hover:scale-110
            "
          />

          {/* Category Badge */}
          <span className="
            absolute top-3 left-3
            px-3 py-1
            text-[10px] font-semibold tracking-wider uppercase
            rounded-full
            bg-white/15 backdrop-blur-md
            border border-white/20
            text-white
          ">
            {blog.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-5 flex-1">
          <h3 className="
            text-white
            font-serif
            text-[16px]
            font-semibold
            leading-snug
            line-clamp-2
          ">
            {blog.title}
          </h3>

          <p className="
            text-white/50
            text-[13px]
            leading-relaxed
            line-clamp-2
          ">
            {blog.description}
          </p>

          {/* Footer */}
          <div className="
            flex items-center justify-between
            mt-auto pt-4
            border-t border-white/10
          ">
            <div className="flex items-center gap-2">
              <div className="
                w-7 h-7 rounded-full
                bg-gradient-to-br from-indigo-500 to-purple-600
                flex items-center justify-center
                text-[11px] font-bold text-white
              ">
                {blog.author?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/50 text-[12px]">
                {blog.author}
              </span>
            </div>

            <span className="
              text-[12px] font-medium
              flex items-center gap-1
              text-white/40
              transition-all duration-300
              group-hover:text-white
              group-hover:translate-x-1
            ">
              Learn More
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