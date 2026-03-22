'use server';
import { Buffer } from "buffer";
import { mkdir, writeFile, readFile } from 'fs/promises'; 
import fs from 'fs';
import path from 'path';export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    if (!file) throw new Error("لم يتم اختيار صورة");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // الحفظ في مجلد public ليكون متاحاً للمتصفح
    const relativePath = formData.get('path') ;
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    // التأكد من وجود المجلد
    await mkdir(path.dirname(fullPath), { recursive: true });
    
    // كتابة الملف بانتظار (await) لضمان اكتمال العملية
    await writeFile(fullPath, buffer);

    return { success: true, url: relativePath }; 
  } catch (error) {
    return { success: false, message: "حدث خطأ أثناء الرفع" };
  }
}
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
export async function getProducts() {
  try {
    const filePath = path.join(process.cwd(), 'my-store-data', 'data.json');
    
    // قراءة الملف كنص
    const fileContent = await readFile(filePath, 'utf-8');
    
    // إذا كان الملف فارغاً تماماً، نرجع مصفوفة فارغة
    if (!fileContent.trim()) {
      return [];
    }

    // تحويل النص إلى مصفوفة حقيقية
    return JSON.parse(fileContent); 
  } catch (error) {
    // في حال عدم وجود الملف أو حدوث خطأ في القراءة
    console.error("خطأ في قراءة الملف:", error);
    return []; 
  }
}
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
export async function deleteImageFile(imagePath: string) {
  const cleanPath = imagePath.startsWith('/')
    ? imagePath.slice(1)
    : imagePath;

  const fullPath = path.join(process.cwd(), 'public', cleanPath);
console.log('PATH:', fullPath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
export async function createFolder1(name: string, price: string) {
  try {
    const folderPath = path.join(process.cwd(), 'my-store-data');
    const filePath = path.join(folderPath, 'data.json');

    // التأكد من وجود المجلد أولاً
    await mkdir(folderPath, { recursive: true });

    // 1. محاولة قراءة البيانات الموجودة مسبقاً
    let existingData = [];
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent); // تحويل النص لمصفوفة
    } catch (e) {
      // إذا الملف غير موجود، سنبدأ بمصفوفة فارغة
    }

    // 2. تجهيز المنتج الجديد
    const newProduct = {
      id: Date.now(), // معرف فريد لكل منتج
      name: name,
      price: price,
      date: new Date().toISOString()
    };
    
    // 3. دمج المنتج الجديد مع المصفوفة القديمة (Spread Operator)
    const updatedData = [...existingData, newProduct];

    // 4. حفظ الكل في الملف
    await writeFile(filePath, JSON.stringify(updatedData, null, 2));
    
    return { success: true, message: "تمت إضافة المنتج بنجاح! ✅" };
  } catch (error) {
    return { success: false, message: "فشل في حفظ البيانات" };
  }
}
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
// جلب كل المنتجات
export async function getProductsAction() {
  const { data, error } = await supabaseAdmin
    .from('Products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// تحديث سعر منتج
export async function updateProductPriceAction(id: number, newPrice: number) {
  const { error } = await supabaseAdmin
    .from('Products')
    .update({ Price: newPrice })
    .eq('id', id);
    
  if (error) return { success: false, error: error.message };
  return { success: true };
}
