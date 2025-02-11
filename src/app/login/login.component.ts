import { animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCheckboxModule, MatButtonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('logoAnimation', [
      state('start', style({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1.5)',
        opacity: 1
      })),
      state('end', style({
        position: 'fixed',
        top: '16px',
        left: 'var(--logo-left)',
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      })),
      transition('start => end', [
        animate('1s ease-out')
      ])
    ]),
    trigger('contentAnimation', [
      state('hidden', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('hidden => visible', [
        animate('500ms ease-in')
      ])
    ])
  ]
})
export class LoginComponent implements AfterViewInit, OnInit{

  private apiService = inject(ApiService);
  private router = inject(Router);

  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  hidePassword = true;

  logoState: 'start' | 'end' = 'start';
  contentState: 'hidden' | 'visible' = 'hidden';

  skipAnimation = false;

  ngOnInit(): void {
    const animationDone = sessionStorage.getItem('animationDone');
    if (animationDone === 'true') {
      this.skipAnimation = true;
      this.logoState = 'end';
      this.contentState = 'visible';
    }
  }

  ngAfterViewInit(): void {
    if (!this.skipAnimation) {
      setTimeout(() => {
        this.logoState = 'end';
      }, 1000);
    }
  }

  onLogoAnimationDone(event: AnimationEvent): void {
    const evt = event as any;
    if (evt.toState === 'end' && !this.skipAnimation) {
      this.contentState = 'visible';
      sessionStorage.setItem('animationDone', 'true');
    }
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
  
    const { email, password } = this.loginForm.value;
  
    this.apiService.login({ email, password }).subscribe({
      next: (response) => {
        if (response?.token && response?.username && response?.email) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('email', response.email);
          localStorage.setItem('first_name', response.first_name);
          localStorage.setItem('last_name', response.last_name);
          localStorage.setItem('phone', response.phone);
          this.router.navigate(['/']);
        } else {
          console.error('Fehlende Daten in der Antwort:', response);
        }
      },
      error: (error) => console.error('Fehler beim Login:', error)
    });
  }

  guestLogin() {
    this.apiService.login({email: 'guest@join.com',password: '!Test12345'}).subscribe({
      next: (response) => {
        if (response?.token && response?.username && response?.email) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('email', response.email);
          localStorage.setItem('first_name', response.first_name);
          localStorage.setItem('last_name', response.last_name);
          localStorage.setItem('phone', response.phone);
          this.router.navigate(['/']);
        } else {
          console.error('Fehlende Daten in der Antwort:', response);
        }
      },
      error: (error) => console.error('Fehler beim Login:', error)
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

}
