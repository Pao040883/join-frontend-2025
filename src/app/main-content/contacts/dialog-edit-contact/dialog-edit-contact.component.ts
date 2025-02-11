import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService, Contact } from '../../../../shared/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-contact',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, ReactiveFormsModule, MatInputModule, CommonModule, MatButtonModule],
  templateUrl: './dialog-edit-contact.component.html',
  styleUrl: './dialog-edit-contact.component.scss'
})
export class DialogEditContactComponent {
private apiService = inject(ApiService);
  private dialogRef = inject(MatDialogRef<DialogEditContactComponent>);
  
  contactForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Contact, private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(2), this.twoWordsValidator]],
      email: [data.email, [Validators.required, Validators.email]],
      phone: [data.phone, [Validators.required, Validators.pattern('^\\+?[0-9]{7,15}$')]]
    });
  }

  twoWordsValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.trim().split(' ').length >= 2 ? null : { twoWords: true };
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const { name, email, phone } = this.contactForm.value; // Werte aus dem Formular holen
      
      const updatedContact = { 
        ...this.data,  // Behalte die bestehende ID und andere unveränderte Werte
        name, 
        email, 
        phone
      };
  
      this.apiService.updateContact(updatedContact).subscribe({
        next: (response) => {
  
          // Prüfe, ob dieser Kontakt mit einem User verknüpft ist (userId existiert)
          if (this.data.user) {
            const updatedUser = {
              id: this.data.user,  // User-ID beibehalten
              email,                 // E-Mail synchronisieren
              first_name: name.split(' ')[0],  // Erster Name extrahieren
              last_name: name.split(' ').slice(1).join(' ') || '' // Restliche Teile als Nachname
            };
  
            // User ebenfalls aktualisieren
            this.apiService.updateUser(updatedUser).subscribe({
              next: () => {
                this.dialogRef.close(response); // Schließe das Dialog-Fenster
              },
              error: (error) => {
                console.error('Fehler beim Speichern des Benutzers:', error);
              }
            });
  
          } else {
            this.dialogRef.close(response); // Falls kein User-Update nötig ist, einfach schließen
          }
        },
        error: (error) => {
          console.error('Fehler beim Speichern des Kontakts:', error);
        }
      });
    } else {
      console.warn('Formular ist ungültig:', this.contactForm.errors);
    }
  }
  
  

  deleteContact() {
    this.apiService.deleteContact(this.data.id).subscribe({
      next: () => {
        this.dialogRef.close()
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Tasks:', error);
      }
    });
  }
  
  onCancel() {
    this.dialogRef.close();
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
}
