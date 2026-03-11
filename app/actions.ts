'use server';
import { Buffer } from "buffer";
import { mkdir, writeFile, readFile } from 'fs/promises'; 
import path from 'path';export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    if (!file) throw new Error("لم يتم اختيار صورة");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // الحفظ في مجلد public ليكون متاحاً للمتصفح
    const relativePath = `/uploads/${Date.now()}-${file.name}`;
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

// تغيير اسم الدالة كما طلبت
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
