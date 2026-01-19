import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'infotech-theme';
  
  // Signal pour le thème actuel
  readonly currentTheme = signal<Theme>(this.getInitialTheme());
  
  constructor() {
    // Effect pour appliquer le thème au DOM
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }
  
  private getInitialTheme(): Theme {
    // Vérifier le localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }
    
    // Vérifier la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    // Par défaut : dark
    return 'dark';
  }
  
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
  
  toggleTheme(): void {
    this.currentTheme.update(current => current === 'dark' ? 'light' : 'dark');
  }
  
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
  
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
