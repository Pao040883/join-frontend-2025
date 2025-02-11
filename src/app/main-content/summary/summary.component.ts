import { Component, HostListener, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  animations: [
    trigger('greetFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('contentFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.1s ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SummaryComponent implements OnInit {
  private apiService = inject(ApiService);
  dashboardData: any = {};
  showGreeting = true;
  showContent = false;
  greetingMessage = '';
  isMobileView = window.innerWidth < 960;
  loggedUser: string | null = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setGreetingMessage();
    this.loggedUser = localStorage.getItem('first_name') + " " + localStorage.getItem('last_name');
  
    // Warte, bis der Token verfügbar ist, bevor Dashboard-Daten geladen werden
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token gefunden, lade Dashboard-Daten...');
        this.apiService.loadDashboard().subscribe({
          next: (data) => {
            this.dashboardData = data;
            console.log('Dashboard-Daten geladen:', data);
          },
          error: (error) => {
            console.error('Fehler beim Abrufen des Dashboards:', error);
          }
        });
      } else {
        console.error('Kein Token verfügbar, Dashboard wird nicht geladen.');
      }
    }, 300); // Kleine Verzögerung, um sicherzustellen, dass der Token gesetzt ist.
  
    if (this.isMobileView) {
      setTimeout(() => {
        this.showGreeting = false;
      }, 2000);
    } else {
      this.showGreeting = true;
      this.showContent = true;
      this.cdr.detectChanges();
    }
  }
  

  @HostListener('window:resize')
  onResize() {
    this.isMobileView = window.innerWidth < 960;
    if (!this.isMobileView) {
      this.showGreeting = true;
      this.showContent = true;
      this.cdr.detectChanges(); 
    }
  }

  private setGreetingMessage(): void {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      this.greetingMessage = 'Good Morning!';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.greetingMessage = 'Good Afternoon!';
    } else if (currentHour >= 17 && currentHour < 22) {
      this.greetingMessage = 'Good Evening!';
    } else {
      this.greetingMessage = 'Good Night!';
    }
  }

  onGreetingAnimationDone(): void {
    if (this.isMobileView && !this.showGreeting) {
      this.showContent = true;
      this.cdr.detectChanges(); 
    }
  }
}
