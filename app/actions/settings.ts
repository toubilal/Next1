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
  const logo = formData.get('logo') as string;
  const footer = formData.get('footer') as string;

  await supabase.from('site_settings')
    .update({ logo_url: logo, footer_text: footer })
    .eq('id', 1);

  // السحر هنا: هذا السطر يجبر الموقع على إعادة قراءة البيانات 
  // ليظهر التعديل فوراً في الـ Footer والـ Header
  revalidatePath('/'); 
}
