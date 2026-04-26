// actions/settings.ts
'use server'
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  return data;
}

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  // استخراج القيم من الفورم وتحديثها
  const { error } = await supabase
    .from('site_settings')
    .update({ 
       logo_url: formData.get('logo'),
       footer_text: formData.get('footer'),
       // ... باقي الحقول
    })
    .eq('id', 1);

  if (!error) revalidatePath('/', 'layout'); // تحديث الموقع بالكامل بعد التعديل
}
