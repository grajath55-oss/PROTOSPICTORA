import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Upload, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "http://localhost:8000";

const Admin = () => {
  const { user } = useAuth();

  const [images, setImages] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const token = localStorage.getItem("token");

  // ✅ hooks FIRST
  useEffect(() => {
    if (!user || user.role !== "admin") return;

   fetch(`${BACKEND_URL}/api/admin/images`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then(async (res) => {
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to load admin images");
    }
    return res.json();
  })
  .then((data) => setImages(data))
  .catch((err) => {
    toast({ title: err.message, variant: "destructive" });
    setImages([]);
  });

  }, [user, token]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const text = `${img.title} ${img.category} ${img.tags?.join(" ")}`.toLowerCase();

      if (query && !text.includes(query.toLowerCase())) return false;
      if (minPrice && Number(img.price) < Number(minPrice)) return false;
      if (maxPrice && Number(img.price) > Number(maxPrice)) return false;

      return true;
    });
  }, [images, query, minPrice, maxPrice]);

  // 🔒 guard AFTER hooks
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <ShieldAlert className="w-14 h-14 mb-4 text-red-400" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
      </div>
    );
  }

  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    await fetch(`${BACKEND_URL}/api/admin/images/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    toast({ title: "Image deleted" });
    setImages((prev) => prev.filter((i) => i._id !== id));
  };

  const uploadZip = () => {
    if (!zipFile) {
      toast({ title: "Select a ZIP file", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("zip_file", zipFile);

    xhr.open("POST", `${BACKEND_URL}/api/admin/images/bulk`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(100);
      toast({ title: "Bulk upload complete" });
      setZipFile(null);
    };

    xhr.onerror = () => {
      setUploading(false);
      toast({ title: "Upload failed", variant: "destructive" });
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* BULK UPLOAD */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
        <input type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files[0])} />
        <Button onClick={uploadZip} disabled={uploading} className="mt-4 bg-white text-black">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading…" : "Upload ZIP"}
        </Button>

        {uploading && (
          <div className="mt-3 w-full bg-white/10 rounded-full h-3">
            <div className="bg-green-400 h-3 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Input placeholder="Min price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <Input placeholder="Max price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredImages.map((img) => (
          <div key={img._id} className="bg-white/5 border border-white/10 rounded-lg">
            <img src={`${BACKEND_URL}${img.file_url}`} alt={img.title} className="h-40 w-full object-cover" />
            <div className="p-3 flex justify-between items-center">
              <p className="truncate">{img.title}</p>
              <Button variant="ghost" onClick={() => deleteImage(img._id)} className="text-red-400">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
