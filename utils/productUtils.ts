// utils/productUtils.ts
import { SUPABASE_STORAGE_URL } from "@/components/constants/index";

export const formatProductImage = (image) => {
  if (!image) return null;

  const cleanImage =
    typeof image === "object"
      ? Object.values(image).join("")
      : image;

  return cleanImage.startsWith("http")
    ? cleanImage
    : `${SUPABASE_STORAGE_URL}${cleanImage}`;
};
