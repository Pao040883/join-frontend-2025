import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../../../shared/api.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-contact',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, ReactiveFormsModule, MatInputModule, CommonModule, MatButtonModule],
  templateUrl: './dialog-add-contact.component.html',
  styleUrl: './dialog-add-contact.component.scss'
})
export class DialogAddContactComponent {
  private apiService = inject(ApiService);
  private dialogRef = inject(MatDialogRef<DialogAddContactComponent>);
  
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), this.twoWordsValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{7,15}$')]]
    });
  }

  twoWordsValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.trim().split(' ').length >= 2 ? null : { twoWords: true };
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const { name, email, phone } = this.contactForm.value; // Extrahiere die Werte
  
      this.apiService.createContacts({ name, email, phone }).subscribe({
        next: (response) => console.log('Kontakt erfolgreich gespeichert:', response),
        error: (error) => console.error('Fehler beim Speichern des Kontakts:', error)
      });
  
      this.dialogRef.close();
    } else {
      console.warn('Formular ist ungültig:', this.contactForm.errors);
    }
  }
  

  onCancel() {
    this.contactForm.reset();
  }
}
