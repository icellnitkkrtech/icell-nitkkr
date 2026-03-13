


// BlogFilter.jsx
const CATEGORIES = [
  "All",
  "Finance",
  "Technology",
  "Startup",
  "Design",
  
];

export default function BlogFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-4 ">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              relative overflow-hidden
              px-6 py-3
              rounded-[15px]
              font-extrabold text-[14px]
              transition-all duration-300
              shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)]
              group
              cursor-pointer
              ${isActive 
                ? "bg-[#212121] text-[#e8e8e8]" 
                : "bg-[#e8e8e8] text-[#212121]"
              }
            `}
          >
            {/* Hover Background */}
            {!isActive && (
              <span className="
                absolute inset-0
                w-0
                bg-[#212121]
                rounded-[15px]
                transition-all duration-300
                group-hover:w-full
                z-0
              " />
            )}

            {/* Text */}
            <span className={`
              relative z-10 transition-colors duration-300
              ${!isActive && "group-hover:text-[#e8e8e8]"}
            `}>
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}