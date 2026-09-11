"use client";


import { BiTrash, BiUpload } from "react-icons/bi";
import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const createCroppedImage = (imageSrc, croppedAreaPixels, fileName) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      context.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not crop image"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      }, "image/jpeg", 0.92);
    };
    image.onerror = reject;
  });

export default function ChooseSingleImage({ file, setFile }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setImageSrc(URL.createObjectURL(selectedFile));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsCropping(true);
    e.target.value = "";
  };

  const handleCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleCropCancel = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setIsCropping(false);
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedFile = await createCroppedImage(
      imageSrc,
      croppedAreaPixels,
      "mentor-image.jpg",
    );
    const preview = URL.createObjectURL(croppedFile);
    setFile({ file: croppedFile, preview });
    URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setIsCropping(false);
  };

  const handleRemoveFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
  };

  return (
    <Card>
      {/* Upload Box */}
      <div className="rounded-xl p-6 text-center space-y-4">
        <div className="flex justify-center">
          <BiUpload size={32} className="text-muted-foreground" />
        </div>

        <div>
          <p className="font-medium">Choose an image to upload</p>
          <p className="text-sm text-muted-foreground">
            JPEG, PNG, JPG • Max 1MB
          </p>
        </div>

        <Button asChild>
          <label htmlFor="fileInput" className="cursor-pointer">
            Choose Image
          </label>
        </Button>

        <Input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="w-full max-w-2xl overflow-hidden">
            <div className="relative h-[min(65vh,420px)] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="space-y-4 p-4">
              <label className="block text-sm font-medium" htmlFor="crop-zoom">
                Zoom
              </label>
              <Input
                id="crop-zoom"
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCropCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCropSave}>
                  Crop image
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Preview */}
      {file && (
        <div className="relative w-40 h-40 m-auto mt-4 rounded-xl border overflow-hidden">
          <Image
            src={file.preview}
            alt="Preview"
            fill
            className="w-full h-full object-cover"
          />

          {/* Remove Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleRemoveFile}
            >
              <BiTrash size={18} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
