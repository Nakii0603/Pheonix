"use client";

import { useState, useRef, useEffect } from "react";
import { uploadCostume } from "@/lib/actions";
import Link from "next/link";

export default function AdminPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
    } else {
      // Default to system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("admin-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const processFiles = (files: File[]) => {
    if (files.length > 0) {
      // Limit to maximum 10 files
      const limitedFiles = files.slice(0, 10);

      if (files.length > 10) {
        setMessage(
          `Only the first 10 images will be uploaded. ${
            files.length - 10
          } images were ignored.`
        );
      } else {
        setMessage("");
      }

      setImages(limitedFiles);

      // Create previews for all selected images
      const newPreviews: string[] = [];
      limitedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === limitedFiles.length) {
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    processFiles(files);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (images.length === 0) return;

    setUploading(true);
    setMessage("");
    setUploadProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("file", images[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.url) {
          const result = await uploadCostume(data.url);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }

        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      if (successCount > 0) {
        setMessage(`${successCount} costumes uploaded successfully!`);
        if (errorCount > 0) {
          setMessage(`${successCount} successful, ${errorCount} failed`);
        }
        setImages([]);
        setPreviews([]);
      } else {
        setMessage("All images failed to upload");
      }
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error("Upload error:", error);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDarkMode
                  ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <h1
            className={`text-4xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            🎭 Admin Dashboard
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Upload and manage costume images for voting
          </p>
        </div>

        <div
          className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          {/* Upload Section */}
          <div className="p-8">
            <div className="mb-8">
              <h2
                className={`text-2xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Upload Costume Images
              </h2>

              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  images.length >= 10
                    ? isDarkMode
                      ? "border-gray-600 bg-gray-700 cursor-not-allowed opacity-60"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    : isDragOver
                    ? isDarkMode
                      ? "border-blue-400 bg-blue-900"
                      : "border-blue-500 bg-blue-50"
                    : isDarkMode
                    ? "border-gray-600 hover:border-gray-500 cursor-pointer bg-gray-700"
                    : "border-gray-300 hover:border-gray-400 cursor-pointer"
                }`}
                onDragOver={images.length < 10 ? handleDragOver : undefined}
                onDragLeave={images.length < 10 ? handleDragLeave : undefined}
                onDrop={images.length < 10 ? handleDrop : undefined}
                onClick={images.length < 10 ? handleFileInputClick : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="text-6xl">
                    {images.length >= 10 ? "🚫" : "📸"}
                  </div>
                  <div>
                    <p
                      className={`text-xl font-medium mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {images.length >= 10
                        ? "Maximum images reached"
                        : isDragOver
                        ? "Drop images here"
                        : "Drag & drop images here"}
                    </p>
                    <p
                      className={`mb-4 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {images.length >= 10
                        ? "Clear images to upload more"
                        : "or click to browse files"}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Supports JPG, PNG, GIF (maximum 10 images)
                    </p>
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    images.length >= 10
                      ? isDarkMode
                        ? "bg-yellow-900 border-yellow-700"
                        : "bg-yellow-50 border-yellow-200"
                      : isDarkMode
                      ? "bg-green-900 border-green-700"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`text-xl mr-3 ${
                        images.length >= 10
                          ? isDarkMode
                            ? "text-yellow-400"
                            : "text-yellow-600"
                          : isDarkMode
                          ? "text-green-400"
                          : "text-green-600"
                      }`}
                    >
                      {images.length >= 10 ? "⚠️" : "✓"}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          images.length >= 10
                            ? isDarkMode
                              ? "text-yellow-200"
                              : "text-yellow-800"
                            : isDarkMode
                            ? "text-green-200"
                            : "text-green-800"
                        }`}
                      >
                        {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                        selected{" "}
                        {images.length >= 10 ? "(Maximum reached)" : ""}
                      </p>
                      <p
                        className={`text-sm ${
                          images.length >= 10
                            ? isDarkMode
                              ? "text-yellow-300"
                              : "text-yellow-600"
                            : isDarkMode
                            ? "text-green-300"
                            : "text-green-600"
                        }`}
                      >
                        {images.length >= 10
                          ? "Ready to upload (limit reached)"
                          : "Ready to upload"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {previews.length > 0 && (
              <div className="mb-8">
                <h3
                  className={`text-xl font-semibold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Preview ({previews.length} images)
                </h3>
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-80 overflow-y-auto p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Uploading Images...
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {uploadProgress}%
                  </span>
                </div>
                <div
                  className={`w-full rounded-full h-3 overflow-hidden ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Please don&apos;t close this page while uploading...
                </p>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={images.length === 0 || uploading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  `Upload ${images.length} Costume${
                    images.length !== 1 ? "s" : ""
                  }`
                )}
              </button>

              {images.length > 0 && !uploading && (
                <button
                  onClick={() => {
                    setImages([]);
                    setPreviews([]);
                    setMessage("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className={`px-6 py-4 rounded-xl font-semibold transition-colors ${
                    isDarkMode
                      ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl border-l-4 ${
                  message.includes("success")
                    ? isDarkMode
                      ? "bg-green-900 border-green-400 text-green-200"
                      : "bg-green-50 border-green-400 text-green-800"
                    : message.includes("failed")
                    ? isDarkMode
                      ? "bg-red-900 border-red-400 text-red-200"
                      : "bg-red-50 border-red-400 text-red-800"
                    : isDarkMode
                    ? "bg-blue-900 border-blue-400 text-blue-200"
                    : "bg-blue-50 border-blue-400 text-blue-800"
                }`}
              >
                <div className="flex items-center">
                  <div className="text-xl mr-3">
                    {message.includes("success")
                      ? "✅"
                      : message.includes("failed")
                      ? "❌"
                      : "ℹ️"}
                  </div>
                  <p className="font-medium">{message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className={`px-8 py-6 border-t ${
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/"
                className={`px-6 py-2 rounded-lg transition-colors font-medium shadow-sm ${
                  isDarkMode
                    ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                ← Back to Home
              </Link>
              <Link
                href="/vote"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                View Voting Page
              </Link>
              <Link
                href="/winners"
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-sm"
              >
                View Winners
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
