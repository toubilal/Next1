'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: any
  onChange: (json: any) => void
}) {
  // في ملف TiptapEditor.tsx

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    TextStyle,
    Color,
  ],
  content,
  immediatelyRender: false,
  onUpdate: ({ editor }) => {
    onChange(editor.getJSON())
  },
  editorProps: {
    attributes: {
      // التعديل هنا: استخدام h-full و min-h-full لإجبار المحرر على ملء كامل المساحة
      class: 'prose max-w-none h-full min-h-full p-4 focus:outline-none',
    },
  },
})


  if (!editor) return null

  return (
    // إضافة h-full و flex flex-col لضمان احتلال كامل المساحة
    <div className="border border-slate-300 rounded-xl bg-white overflow-hidden flex flex-col h-full focus-within:ring-2 focus-within:ring-primary">

      {/* Toolbar - ثابتة في الأعلى */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border-b flex-none">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-primary text-white' : 'hover:bg-slate-200'}`}
        >B</button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-primary text-white' : 'hover:bg-slate-200'}`}
        >I</button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-primary text-white' : 'hover:bg-slate-200'}`}
        >U</button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'hover:bg-slate-200'}`}
        >H2</button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 py-1 rounded hover:bg-slate-200"
        >•</button>

        <button
          onClick={() => {
            const url = prompt('أدخل الرابط')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          className="px-2 py-1 rounded hover:bg-slate-200"
        >🔗</button>

        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 p-0 border rounded"
        />

        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="px-2 py-1 rounded hover:bg-slate-200"
        >Clear</button>
      </div>

      {/* Editor Content - يأخذ باقي المساحة المتاحة (flex-1) */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
      
    </div>
  )
}
