import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block group">
      <button 
        type="button"
        class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        [attr.aria-label]="'Aide: ' + text">
        <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <div class="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 md:w-80">
        <div class="bg-gray-900 text-white text-xs md:text-sm rounded-lg shadow-lg p-3">
          <p class="leading-relaxed">{{ text }}</p>
          <div class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HelpTooltipComponent {
  @Input() text: string = '';
}




