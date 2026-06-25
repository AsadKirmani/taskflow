import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex h-10 w-10 items-center justify-center rounded-full font-bold text-base-content shadow-sm border border-base-content/20 text-sm"
      [ngClass]="avatarColor"
    >
      {{ getInitials() }}
    </div>
  `
})
export class AvatarComponent implements OnInit {
  @Input() name: string = '';
  
  avatarColor: string = '';
  
  // Predefined Tailwind background colors (using safe, visible shades)
  private colors: string[] = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-600',
    'bg-green-600',
    'bg-teal-600',
    'bg-cyan-600',
    'bg-sky-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-purple-600',
    'bg-fuchsia-600',
    'bg-pink-600',
    'bg-rose-600'
  ];

  ngOnInit() {
    this.assignRandomColor();
  }

  assignRandomColor() {
    // Pick a random color from the array
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    this.avatarColor = this.colors[randomIndex];
  }

  getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
