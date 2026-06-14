import { Component, OnInit, OnDestroy, ViewEncapsulation, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { AutofocusDirective } from '../../directives/autofocus.directive';

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
      autofocus: true,
      editorProps: {
        attributes: { 
          class: 'focus:outline-none max-w-none prose prose-sm text-base-content', 
          spellcheck: 'true'
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