import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, AlertCircle, X, Upload } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getOptimizedCloudinaryUrl, CLOUDINARY_PRESETS } from "../../utils/cloudinary";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = `${BASE_URL}/api/gallery-groups`;
const CLOUDINARY_CLOUD_NAME = "dpgkl1wq4";
const CLOUDINARY_UPLOAD_PRESET = "icell-webite-gallery-upload";

export default function AdminGallery() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showUploadImages, setShowUploadImages] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Form states
  const [groupForm, setGroupForm] = useState({
    group_name: "",
    images: [], // Array of { file, preview, caption }
  });

  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const getToken = () => localStorage.getItem("accessToken");

  // Fetch all gallery groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await fetch(API);
        const data = await res.json();
        // Ensure all groups have images array
        const sanitizedData = (Array.isArray(data) ? data : []).map(
          (group) => ({
            ...group,
            images: Array.isArray(group.images) ? group.images : [],
            total_images: group.total_images || 0,
            thumbnail_image: group.thumbnail_image || "",
            group_name: group.group_name || "Untitled",
          })
        );
        setGroups(sanitizedData);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load gallery groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Handle file selection for multiple images
  const handleFileSelect = (files) => {
    if (!files) return;

    const newImages = [];
    let processedCount = 0;

    for (let file of files) {
      // Validate: only images
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        continue;
      }

      // Validate: max 15MB
      if (file.size > 15 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 15MB)`);
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          file,
          preview: e.target.result,
          caption: "",
          _id: Math.random().toString(36),
        });

        processedCount++;
        // Update state after all files are processed
        if (
          processedCount ===
          Array.from(files).filter((f) => f.type.startsWith("image/")).length
        ) {
          setGroupForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
          }));
          setError("");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();
      return {
        imageUrl: data.secure_url,
        cloudinaryPublicId: data.public_id,
        success: true,
      };
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return { success: false, error: err.message };
    }
  };

  // Create new gallery group with multiple images
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupForm.group_name.trim()) {
      setError("Group name is required");
      return;
    }

    if (groupForm.images.length === 0) {
      setError("Add at least one image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload all images to Cloudinary
      const uploadedImages = [];
      for (const imgData of groupForm.images) {
        const result = await uploadToCloudinary(imgData.file);
        if (!result.success) {
          throw new Error(`Failed to upload image: ${result.error}`);
        }

        uploadedImages.push({
          imageUrl: result.imageUrl,
          cloudinaryPublicId: result.cloudinaryPublicId,
          caption: imgData.caption,
        });
      }

      // Create group in database
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          group_name: groupForm.group_name.trim(),
          images: uploadedImages,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create group");
      }

      const data = await response.json();
      setGroups([data.group, ...groups]);
      setSuccess("Gallery group created successfully!");

      // Reset form
      setGroupForm({ group_name: "", images: [] });
      setShowCreateGroupModal(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create gallery group");
    } finally {
      setUploading(false);
    }
  };

  // Remove image from form (before uploading)
  const removeImageFromForm = (imageId) => {
    setGroupForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img._id !== imageId),
    }));
  };

  // Add images to existing group
  const handleAddImagesToGroup = async (e) => {
    e.preventDefault();

    if (!selectedGroupId) {
      setError("No group selected");
      return;
    }

    if (groupForm.images.length === 0) {
      setError("Select at least one image to add");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload and add all images to Cloudinary and backend
      let addedCount = 0;
      for (const imgData of groupForm.images) {
        const result = await uploadToCloudinary(imgData.file);
        if (!result.success) {
          throw new Error(`Failed to upload image: ${result.error}`);
        }

        // Add image to group (individual API call per image)
        const response = await fetch(`${API}/${selectedGroupId}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            imageUrl: result.imageUrl,
            cloudinaryPublicId: result.cloudinaryPublicId,
            caption: imgData.caption || "",
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to add image to group");
        }

        addedCount++;
      }

      // Refresh the group data
      const groupResponse = await fetch(`${API}/${selectedGroupId}`);
      const updatedGroup = await groupResponse.json();

      setGroups(
        groups.map((g) => (g._id === selectedGroupId ? updatedGroup : g))
      );

      setSuccess(`${addedCount} image(s) added to group successfully!`);

      // Reset form
      setGroupForm({ group_name: "", images: [] });
      setShowUploadImages(false);
      setSelectedGroupId(null);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding images to group:", err);
      setError(err.message || "Failed to add images to group");
    } finally {
      setUploading(false);
    }
  };

  // Delete entire group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this gallery group and all its images?"))
      return;

    try {
      const response = await fetch(`${API}/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      setGroups(groups.filter((g) => g._id !== groupId));
      setSuccess("Gallery group deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Failed to delete gallery group");
    }
  };

  // Delete image from group
  const handleDeleteImageFromGroup = async (groupId, imageId) => {
    if (!window.confirm("Delete this image from the group?")) return;

    try {
      const response = await fetch(`${API}/${groupId}/images/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Update group in state
      setGroups(
        groups.map((group) =>
          group._id === groupId
            ? {
                ...group,
                images: group.images.filter((img) => img._id !== imageId),
                total_images: group.total_images - 1,
              }
            : group
        )
      );

      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image from group");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0d0d0d] text-white">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#555]">
            Loading gallery groups...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 max-lg:pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gallery Groups</h1>
            <p className="text-[#555] text-sm">
              Manage grouped image collections for events and activities.
            </p>
          </div>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} /> Create Group
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-400 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500 text-green-400">
            {success}
          </div>
        )}

        {/* Gallery Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12 border border-[#1f1f1f] rounded-xl bg-[#111111] text-[#555]">
            <p className="mb-4">No gallery groups yet.</p>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={16} /> Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-purple-500/50 transition"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-[#1a1a1a] overflow-hidden group">
                  {group.thumbnail_image ? (
                    <img
                      src={getOptimizedCloudinaryUrl(
                        group.thumbnail_image,
                        CLOUDINARY_PRESETS.thumbnail
                      )}
                      alt={group.group_name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#444]">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white/80">
                    {group.total_images} images
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                    {group.group_name}
                  </h3>

                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {Array.isArray(group.images) &&
                      group.images.map((image) => (
                        <div
                          key={image._id}
                          className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded text-xs"
                        >
                          <div className="flex-1 truncate text-white/60">
                            {image.caption ||
                              `Image ${
                                image.position !== undefined
                                  ? image.position + 1
                                  : "N/A"
                              }`}
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteImageFromGroup(group._id, image._id)
                            }
                            className="text-red-500 hover:text-red-400 ml-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGroupId(group._id);
                        setShowUploadImages(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Plus size={14} /> Add Images
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group._id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <p className="text-[#666] text-xs mt-3">
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1a1a1a] flex justify-between items-center p-6 border-b border-[#333]">
                <h2 className="text-2xl font-bold">Create Gallery Group</h2>
                <button
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupForm({ group_name: "", images: [] });
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
                {/* Group Name */}
                <div>
                  <label className="block text-sm text-[#888] mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Startup Fest 2026"
                    value={groupForm.group_name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, group_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-[#111111] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Image Upload Area */}
                <div
                  className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={40} className="mx-auto mb-3 text-[#555]" />
                  <p className="text-white/80 mb-1">
                    Click to select or drag images here
                  </p>
                  <p className="text-[#666] text-sm">
                    PNG, JPG, GIF up to 15MB each (max 20 images)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Image Preview Grid */}
                {Array.isArray(groupForm.images) &&
                  groupForm.images.length > 0 && (
                    <div>
                      <p className="text-sm text-[#888] mb-3">
                        Selected Images ({groupForm.images.length}/20)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {groupForm.images.map((img) => (
                          <div
                            key={img._id}
                            className="relative group bg-[#111111] rounded-lg overflow-hidden border border-[#333]"
                          >
                            <img
                              src={img.preview}
                              alt="Preview"
                              className="w-full h-32 object-cover"
                            />
                            <input
                              type="text"
                              placeholder="Caption (optional)"
                              value={img.caption}
                              onChange={(e) => {
                                setGroupForm((prev) => ({
                                  ...prev,
                                  images: Array.isArray(prev.images)
                                    ? prev.images.map((i) =>
                                        i._id === img._id
                                          ? { ...i, caption: e.target.value }
                                          : i
                                      )
                                    : [],
                                }));
                              }}
                              className="w-full px-2 py-1 bg-black/60 text-white text-xs mt-2 placeholder-[#555]"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageFromForm(img._id)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-[#333]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroupModal(false);
                      setGroupForm({ group_name: "", images: [] });
                    }}
                    className="flex-1 py-2 rounded-lg border border-[#333] hover:bg-[#1a1a1a] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || groupForm.images.length === 0}
                    className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-medium"
                  >
                    {uploading ? "Uploading..." : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Images to Group Modal */}
        {showUploadImages && selectedGroupId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1a1a1a] flex justify-between items-center p-6 border-b border-[#333]">
                <h2 className="text-2xl font-bold">Add Images to Group</h2>
                <button
                  onClick={() => {
                    setShowUploadImages(false);
                    setSelectedGroupId(null);
                    setGroupForm({ group_name: "", images: [] });
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddImagesToGroup} className="p-6 space-y-6">
                {/* Image Upload Area */}
                <div
                  className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={40} className="mx-auto mb-3 text-[#555]" />
                  <p className="text-white/80 mb-1">
                    Click to select or drag images here
                  </p>
                  <p className="text-[#666] text-sm">
                    PNG, JPG, GIF up to 15MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Image Preview Grid */}
                {Array.isArray(groupForm.images) &&
                  groupForm.images.length > 0 && (
                    <div>
                      <p className="text-sm text-[#888] mb-3">
                        Selected Images ({groupForm.images.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {groupForm.images.map((img) => (
                          <div
                            key={img._id}
                            className="relative group bg-[#111111] rounded-lg overflow-hidden border border-[#333]"
                          >
                            <img
                              src={img.preview}
                              alt="Preview"
                              className="w-full h-32 object-cover"
                            />
                            <input
                              type="text"
                              placeholder="Caption (optional)"
                              value={img.caption}
                              onChange={(e) => {
                                setGroupForm((prev) => ({
                                  ...prev,
                                  images: Array.isArray(prev.images)
                                    ? prev.images.map((i) =>
                                        i._id === img._id
                                          ? { ...i, caption: e.target.value }
                                          : i
                                      )
                                    : [],
                                }));
                              }}
                              className="w-full px-2 py-1 bg-black/60 text-white text-xs mt-2 placeholder-[#555]"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageFromForm(img._id)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-[#333]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadImages(false);
                      setSelectedGroupId(null);
                      setGroupForm({ group_name: "", images: [] });
                    }}
                    className="flex-1 py-2 rounded-lg border border-[#333] hover:bg-[#1a1a1a] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || groupForm.images.length === 0}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition text-white font-medium"
                  >
                    {uploading ? "Uploading..." : "Add Images"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
