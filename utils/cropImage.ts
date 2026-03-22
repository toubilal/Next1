export const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // تحديد مقاس الكانفاس بناءً على المنطقة المقصوصة
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // رسم الجزء المحدد من الصورة الأصلية على الكانفاس
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // تحويل الكانفاس إلى Blob (ملف) لرفعه للسيرفر
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

// دالة مساعدة لتحويل الرابط إلى عنصر صورة
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // لتجنب مشاكل الـ CORS
    image.src = url;
  });
