import { Component, inject, OnInit } from '@angular/core';
import { Contact } from '../../../shared/api.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  private http = inject(HttpClient);
  private contactsUrl = 'http://127.0.0.1:8000/api/contacts/';
  contacts: Contact[] = [];
  selectedContact: Contact | null = null; 
  
  constructor() { }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts() {
    this.http.get<Contact[]>(`${this.contactsUrl}`).subscribe({
      next: (response) => {
        this.contacts = response.sort((a, b) => {
          const lastNameA = this.getLastName(a.name).toLowerCase();
          const lastNameB = this.getLastName(b.name).toLowerCase();
          return lastNameA.localeCompare(lastNameB);
        });
      },
      error: (error) => console.error('Fehler beim Laden der Kontakte:', error)
    });
  }

  getLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
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
}
