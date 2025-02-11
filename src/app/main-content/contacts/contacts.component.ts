import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService, Contact, User } from '../../../shared/api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DialogAddContactComponent } from './dialog-add-contact/dialog-add-contact.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditContactComponent } from './dialog-edit-contact/dialog-edit-contact.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  private apiService = inject(ApiService);
  currentUser: User | null = null;
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  isMobileView = signal(window.innerWidth < 960);
  showDetails = signal(false);

  constructor(public dialog: MatDialog) { 
    window.addEventListener('resize', () => {
      this.isMobileView.set(window.innerWidth < 960);
    });
  }

  ngOnInit(): void {
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;  // Speichert die Benutzerdaten
        this.loadContacts();
      },
      error: (error) => console.error('Fehler beim Abrufen des Benutzers:', error)
    });
  }

  getContact(id: number): Observable<Contact> {
    return this.apiService.loadContactById(id);
  }
  
  loadContacts(): void {
    this.apiService.loadContacts().subscribe({
      next: (response) => {
        this.contacts = response.sort((a, b) => {
          const lastNameA = this.getLastName(a.name).toLowerCase();
          const lastNameB = this.getLastName(b.name).toLowerCase();
          return lastNameA.localeCompare(lastNameB);
        });
  
        // Explizit das ausgewählte Objekt aus der aktualisierten Liste neu setzen
        if (this.selectedContact) {
          this.selectedContact = this.contacts.find(c => c.id === this.selectedContact?.id) || null;
        }
      },
      error: (error) => console.error('Fehler beim Laden der Kontakte:', error)
    });
  }
  
  
  deleteContact(id: number) {
    this.apiService.deleteContact(id).subscribe({
      next: () => {
        this.loadContacts();
        this.selectedContact = null;
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Tasks:', error);
      }
    });
  }

  openAddContactDialog() {
    const dialogRef = this.dialog.open(DialogAddContactComponent);

    dialogRef.afterClosed().subscribe(result => {
      this.loadContacts();
    });
  }

  openEditDialog(id: number) {
    this.getContact(id).subscribe({
      next: (contactData) => {
        const dialogRef = this.dialog.open(DialogEditContactComponent, {
          data: contactData,
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if (result) { 
            this.selectedContact = this.contacts.find(c => c.id === result.id) || null;
            this.loadContacts();
          }
        });
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Task-Daten:', error);
      }
    });
  }
  
  getLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    if (this.isMobileView()) {
      this.showDetails.set(true);
    }
  }

  goBack() {
    this.showDetails.set(false);
  }

  groupContactsByLastName() {
    const grouped = this.contacts.reduce((acc, contact) => {
      const letter = this.getLastName(contact.name)[0].toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(contact);
      return acc;
    }, {} as { [key: string]: Contact[] });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({ letter, contacts: grouped[letter] }));
  }

  getContactColor(contactId: number): string {
    return this.contacts.find(c => c.id === contactId)?.color || 'Unbekannt';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

    /** 🟢 Prüft, ob der Benutzer seinen eigenen Contact oder freie Contacts bearbeiten darf */
    canEdit(contact: Contact): boolean {
      return contact.user === this.currentUser?.id || !contact.user;
    }
  
    /** 🟢 Prüft, ob der Benutzer einen Contact löschen darf (nur freie Contacts) */
    canDelete(contact: Contact): boolean {
      return !contact.user; 
    }

    showYou(contact: Contact): boolean {          
      return contact.user === this.currentUser?.id;
    }
}
