import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedCloudinaryUrl, CLOUDINARY_PRESETS } from "../../utils/cloudinary";

const GalleryGroup = ({ group, onImageDelete }) => {
  const [showCarousel, setShowCarousel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Defensive checks for group structure
  if (!group || typeof group !== "object") {
    return null;
  }

  const images = Array.isArray(group.images) ? group.images : [];
  if (!images || images.length === 0) {
    return null;
  }

  // Auto-advance carousel
  useEffect(() => {
    if (!showCarousel) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [showCarousel, images.length]);

  const currentCarouselImage = images[carouselIndex] || images[0];
  const groupName = group.group_name || "Untitled Group";
  const thumbnailUrl = group.thumbnail_image || "";

  const handleThumbnailClick = () => {
    if (images.length === 1) {
      setShowModal(true);
    } else {
      setShowCarousel(true);
    }
  };

  return (
    <>
      {/* Group Container */}
      <div
        className="relative bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden group/gallery hover:border-purple-500/50 transition-colors"
        onMouseEnter={() => images.length > 1 && setShowCarousel(true)}
        onMouseLeave={() => setShowCarousel(false)}
      >
        {/* Thumbnail View (Base State) */}
        <div className="relative h-48 bg-[#1a1a1a] overflow-hidden cursor-pointer">
          <AnimatePresence mode="wait">
            <motion.img
              key={thumbnailUrl}
              src={
                getOptimizedCloudinaryUrl(thumbnailUrl, CLOUDINARY_PRESETS.thumbnail) ||
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3C/svg%3E'
              }
              alt={groupName}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleThumbnailClick}
            />
          </AnimatePresence>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-medium mb-2">
                {images.length > 1 ? "Hover for carousel" : "Click to view"}
              </p>
              {images.length > 1 && (
                <p className="text-white/60 text-sm">{images.length} images</p>
              )}
            </div>
          </div>

          {/* Image count badge */}
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white/80">
            {images.length} images
          </div>
        </div>

        {/* Carousel (On Hover - Desktop Only) */}
        {showCarousel && images.length > 1 && (
          <motion.div
            className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowModal(true)}
          >
            {/* Carousel Image */}
            <div className="relative w-full h-full flex items-center justify-center group/carousel">
              {currentCarouselImage && (
                <>
                  <img
                    src={
                      getOptimizedCloudinaryUrl(
                        currentCarouselImage.image_url,
                        CLOUDINARY_PRESETS.carousel
                      ) ||
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3C/svg%3E'
                    }
                    alt={
                      currentCarouselImage.caption ||
                      `Image ${carouselIndex + 1}`
                    }
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </>
              )}

              {/* Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 px-3 py-1 rounded-full text-white text-xs">
                {carouselIndex + 1} / {images.length}
              </div>

              {/* Caption */}
              {currentCarouselImage.caption && (
                <div className="absolute bottom-12 left-0 right-0 text-center bg-black/40 py-2 text-white text-xs">
                  {currentCarouselImage.caption}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Content Footer */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {groupName}
          </h3>
          <button
  onClick={() => setShowModal(true)}
  className="mt-2 px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black 
  rounded-lg text-sm font-medium shadow hover:shadow-yellow-500/30 transition-all"
>
  View Gallery ({images.length})
</button>
        </div>
      </div>

      {/* Modal Grid View */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-[#111111] border border-[#333] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between p-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{groupName}</h2>
                  <p className="text-[#666] text-sm mt-1">
                    {images.length} images in this gallery
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content - Grid */}
              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {Array.isArray(images) &&
                    images.map((image, index) => (
                      <motion.div
                        key={image._id || index}
                        className="relative group/modal-image rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333] cursor-pointer hover:border-purple-500/50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative h-48 bg-[#141414]">
                          <img
                            src={
                              getOptimizedCloudinaryUrl(
                                image.image_url,
                                CLOUDINARY_PRESETS.modalGrid
                              ) ||
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3C/svg%3E'
                            }
                            alt={image.caption || `Image ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover/modal-image:scale-105 transition-transform duration-300"
                          />

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/modal-image:opacity-100 transition-opacity flex items-center justify-center">
                            {onImageDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onImageDelete(image._id);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Caption */}
                        {image.caption && (
                          <div className="p-3 bg-[#0d0d0d] border-t border-[#333]">
                            <p className="text-white text-sm line-clamp-2">
                              {image.caption}
                            </p>
                          </div>
                        )}

                        {/* Image number */}
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white/80">
                          #{index + 1}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GalleryGroup;
