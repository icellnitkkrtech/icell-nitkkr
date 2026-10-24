import { BLOG_CATEGORIES } from "../../utils/blogCategories";

const CATEGORIES = ["All", ...BLOG_CATEGORIES];

export default function BlogFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              relative overflow-hidden
              px-4 sm:px-5 py-2 sm:py-2.5
              rounded-[12px]
              font-semibold text-[13px]
              transition-all duration-300
              shadow-[0_4px_12px_rgba(0,0,0,0.3)]
              group
              cursor-pointer
              ${
                isActive
                  ? "bg-[#6366f1] text-[#ffffff] border border-[#818cf8]"
                  : "bg-[#18181b] text-[#a1a1aa] border border-[#27272a] hover:text-[#ffffff] hover:border-[#3f3f46]"
              }
            `}
          >
            {/* Hover Background for inactive */}
            {!isActive && (
              <span
                className="
                absolute inset-0
                w-0
                bg-[#27272a]
                rounded-[12px]
                transition-all duration-300
                group-hover:w-full
                z-0
              "
              />
            )}

            {/* Text */}
            <span
              className={`
              relative z-10 transition-colors duration-300
              ${!isActive && "group-hover:text-[#ffffff]"}
            `}
            >
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}