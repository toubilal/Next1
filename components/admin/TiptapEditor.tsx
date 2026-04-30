'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import {TextStyle} from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { 
  Bold, Underline as UnderlineIcon, 
  Heading2, List, Link as LinkIcon, 
  Palette, Eraser 
} from 'lucide-react'

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: any
  onChange: (json: any) => void
}) {
const [showColors, setShowColors] = useState(false)
  const editor = useEditor({extensions: [
    StarterKit,
    TextStyle,
    Color, // أضفها مباشرة بدون configure
    Underline,
    Link.configure({ 
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary underline' } 
    }),
  ]
  ,
  content,
  immediatelyRender: false,
  onUpdate: ({ editor }) => {
    onChange(editor.getJSON())
  },
  editorProps: {
    attributes: {
      class: 'prose max-w-none min-h-[200px] p-4 focus:outline-none bg-white [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
    },
  },
})

  if (!editor) return null

  return (
    <div className="border border-border rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-border flex-none">
        
        {/* Bold */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-primary text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
          <Bold size={18} />
        </button>

        {/* Underline */}
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-primary text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
          <UnderlineIcon size={18} />
        </button>

        <div className="w-[1px] h-6 bg-slate-300 mx-1" />

        {/* Heading 2 */}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
          <Heading2 size={18} />
        </button>

        {/* Bullet List */}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
          <List size={18} />
        </button>

        <div className="w-[1px] h-6 bg-slate-300 mx-1" />

        {/* Link */}
        <button type="button" 
          onClick={() => {
            const url = prompt('أدخل الرابط')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-primary text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
          <LinkIcon size={18} />
        </button>
<>
  <button
    type="button"
    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowColors(!showColors); }}
    className="p-3 rounded-2xl bg-slate-100 text-slate-600 active:scale-95 transition-transform"
  >
    <Palette size={24} />
  </button>

  {showColors && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 touch-none">
      {/* الخلفية المعتمة */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onPointerDown={() => setShowColors(false)} />

      <div 
        className="relative bg-white w-[300px] rounded-[2.5rem] shadow-2xl p-6 select-none"
        onPointerDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-6">
          
          {/* دائرة المعاينة والعنوان */}
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-700">لون النص</h3>
            <div 
              id="main-preview"
              className="w-12 h-12 rounded-2xl border-4 border-slate-50 shadow-sm transition-colors"
              style={{ backgroundColor: '#000000' }}
            />
          </div>

          {/* الألوان الرئيسية (قليلة ومختارة بعناية) */}
          <div className="flex justify-between px-1">
            {['#000000', '#ffffff', '#F44336', '#4CAF50', '#2196F3', '#FFEB3B'].map(color => (
              <button
                key={color}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  document.getElementById('main-preview').style.backgroundColor = color;
                  editor.chain().setColor(color).run();
                  setShowColors(false);
                }}
                className="w-10 h-10 rounded-full border border-slate-200 shadow-sm active:scale-75 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* شريط الاختيار الحر (Slider) */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 px-1">درجة مخصصة</span>
            <div 
              className="h-8 w-full rounded-full shadow-inner border-4 border-white cursor-pointer"
              style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}
              onPointerDown={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const hue = Math.round((x / rect.width) * 360);
                const color = `hsl(${hue}, 80%, 50%)`;
                
                // تحديث المعاينة والتطبيق فوراً
                document.getElementById('main-preview').style.backgroundColor = color;
                editor.chain().setColor(color).run();
              }}
            />
          </div>

          {/* زر الإغلاق بأسلوب أندرويد */}
          <button
            type="button"
            onPointerDown={() => setShowColors(false)}
            className="w-full py-3 text-primary font-bold bg-blue-50 rounded-2xl active:opacity-70 transition-opacity"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  )}
</>

        {/* Color Picker */}

        {/* Clear Formatting */}
        <button type="button" 
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-2 text-slate-400 hover:text-error ml-auto"
          title="مسح التنسيق">
          <Eraser size={18} />
        </button>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
      
    </div>
  )
}
