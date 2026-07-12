// Rasm yuklash: Cloudinary sozlangan bo'lsa — bulutga,
// bo'lmasa — rasmni siqib (max 800px, JPEG) data-URL ko'rinishida saqlaydi.
// Ikkala holatda ham "kompyuterdan tanlash" ishlayveradi.

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset!);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("UPLOAD_FAILED");
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

// Rasmni brauzerda kichraytirib, siqilgan JPEG data-URL qaytaradi
function compressToDataUrl(file: File, maxW = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("CANVAS_FAILED"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_READ_FAILED"));
    };
    img.src = url;
  });
}

// Asosiy funksiya: menyu shu funksiyani chaqiradi
export async function processImage(file: File): Promise<string> {
  if (cloudinaryConfigured()) {
    try {
      return await uploadToCloudinary(file);
    } catch {
      // Cloudinary ishlamasa ham to'xtamaymiz — siqilgan variantga o'tamiz
    }
  }
  return compressToDataUrl(file);
}
