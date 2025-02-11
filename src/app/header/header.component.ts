import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router = inject(Router);

  loggedUser = localStorage.getItem('token');
  first_name = localStorage.getItem('first_name');
  last_name = localStorage.getItem('last_name');
  menuOpen = false;

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    localStorage.removeItem('phone');
    this.router.navigate(['/login']);
  }

  getInitials(name:string) {
    return name
      .trim()                        // Entfernt führende/trailing Leerzeichen
      .split(/\s+/)                  // Teilt bei einem oder mehreren Leerzeichen
      .map(word => word.charAt(0))   // Erster Buchstabe jedes Wortes
      .join('')
      .toUpperCase();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
