'use client';
import { useState } from "react";
import { Upload } from "lucide-react";

export default function ImageCompare() {
    const [images, setImages] = useState({ image1: null, image2: null });
    const [preview, setPreview] = useState({ image1: null, image2: null });
    const [diffUrl, setDiffUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setImages((prev) => ({ ...prev, [name]: files[0] }));
            setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
        }
    };

    const handleCompare = async () => {
        if (!images.image1 || !images.image2) {
            setError("Please upload both images");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("images", images.image1);
        formData.append("images", images.image2);

        try {
            const response = await fetch("http://localhost:5000/api/images", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setDiffUrl(data.diffUrl);
            }
        } catch (err) {
            setError("Error processing images");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6">
            <h1 className="text-2xl font-bold">Image Comparison Tool</h1>
            <div className="flex gap-6">
                {["image1", "image2"].map((name, index) => (
                    <div key={name} className="w-64 h-72 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 p-4 text-gray-500">
                        <h2 className="font-semibold">File {index + 1}</h2>
                        {preview[name] ? (
                            <img src={preview[name]} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover rounded" />
                        ) : (
                            <Upload size={32} />
                        )}
                        <p>Upload an image to compare</p>
                        <input 
                            type="file" 
                            name={name} 
                            onChange={handleFileChange} 
                            className="hidden"
                            id={name}
                        />
                        <label htmlFor={name} className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                            Select Image
                        </label>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleCompare} 
                className="bg-green-500 text-white px-6 py-2 rounded" 
                disabled={loading}
            >
                {loading ? "Processing..." : "Compare Images"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
            {diffUrl && (
                <div className="mt-4">
                    <h2 className="text-lg font-bold">Difference Image:</h2>
                    <img src={diffUrl} alt="Difference" className="w-64 h-64 object-contain" />
                </div>
            )}
        </div>
    );
}