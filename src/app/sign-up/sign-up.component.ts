import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/api.service';


/**
 * Validator-Funktion für die Passwort-Bestätigung.
 * Überprüft, ob das `repeated_password` mit `password` übereinstimmt.
 */
export function passwordMatchValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.parent?.get(passwordControlName);
    const repeatedPassword = control.value;

    if (!passwordControl) return null; // Falls das Passwort-Feld nicht existiert, keinen Fehler zurückgeben

    return passwordControl.value === repeatedPassword ? null : { passwordMismatch: true };
  };
}



@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCheckboxModule, MatButtonModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private apiService = inject(ApiService);
  private router = inject(Router);

  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  twoWordsRegex = /^(?:\S+\s+){1,}\S+$/;

  loginForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(this.twoWordsRegex)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(this.emailPattern)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    repeated_password: new FormControl('', [
      Validators.required,
      passwordMatchValidator('password') // Prüft nur dieses Feld
    ]),
    policy: new FormControl(false, [Validators.requiredTrue]),
  });


  hidePassword = true;
  hideConfirmPassword = true;
  serverErrorMessage = '';


  onSubmit() {
    if (!this.loginForm.valid) return;
  
    const { name, email, password, repeated_password } = this.loginForm.value;
  
    this.apiService.signUp({ name, email, password, repeated_password }).subscribe({
      next: (response) => {
        if (response?.token && response?.username && response?.email) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('email', response.email);
          this.router.navigate(['login/']);
        } else {
          console.error('Fehlende Daten in der Antwort:', response);
        }
      },
      error: (error) => {this.serverErrorMessage = error.error?.error
        console.error('Fehler beim Login:', error)  }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

}
