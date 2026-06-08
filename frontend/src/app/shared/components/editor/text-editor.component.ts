import { Component, OnInit, OnDestroy, ViewEncapsulation, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TiptapEditorDirective],
  templateUrl: './text-editor.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TextEditorComponent implements OnInit, OnDestroy {
  value = model<string>(''); 

  placeholder = input<string>('Write something...');
  minHeight = input<string>('150px');

  editor!: Editor;

  ngOnInit() {
    this.editor = new Editor({
      extensions: [StarterKit],
      content: this.value(),
      editorProps: {
        attributes: { 
          class: 'focus:outline-none max-w-none prose prose-sm text-[#172b4d]' 
        }
      },

      onUpdate: ({ editor }) => {
        this.value.set(editor.getHTML());
      }
    });
  }

  ngOnDestroy() {
    this.editor.destroy();
  }
}