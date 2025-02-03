import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Contact } from '../../../shared/api.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonToggleModule, MatIconModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit{
  contacts: Contact[] = []; // Alle geladenen Kontakte
  selectedContacts: number[] = []; // IDs der ausgewählten Kontakte
  subtasks: string[] = []; // Subtasks
  test: string = ''; // Eingabewert für Subtasks

  task = {
    title: '',
    description: '',
    due_date: '',
    prio: 'medium', // Standardwert
    category: '',
    contacts: [] as number[], // Explizite Typisierung als number[]
  };

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.http.get<Contact[]>(`${this.apiUrl}/contacts/`).subscribe({
      next: (response) => (this.contacts = response),
      error: (error) => console.error('Fehler beim Laden der Kontakte:', error)
    });
  }

  addSubtask() {
    if (this.test.trim()) {
      this.subtasks.push(this.test);
      this.test = '';
    }
  }

  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }

  submitTask() {
    this.task.contacts = this.selectedContacts.map(id => Number(id));
  
    // Stelle sicher, dass due_date im richtigen Format ist
    if (this.task.due_date) {
      const localDate = new Date(this.task.due_date);
      const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));  
      this.task.due_date = utcDate.toISOString().split('T')[0];  // YYYY-MM-DD
    }
  
    console.log('Gesendete Daten:', JSON.stringify(this.task));
  
    // Zuerst den Task speichern
    this.http.post(`${this.apiUrl}/tasks/`, this.task).subscribe({
      next: (response: any) => {
        console.log('Task gespeichert:', response);
        const taskId = response.id; // Die ID des erstellten Tasks
  
        // Subtasks erstellen, wenn welche vorhanden sind
        if (this.subtasks.length > 0) {
          const subtaskRequests = this.subtasks.map(title => {
            const subtask = {
              title: title,
              status: 'open',
              task: taskId // Verknüpfung mit dem erstellten Task
            };
            // POST-Request für jeden Subtask
            console.log(subtask);
            
            return this.http.post(`${this.apiUrl}/subtasks/`, subtask);
          });
  
          // Warten, bis alle Subtasks gespeichert wurden
          Promise.all(subtaskRequests.map(req => req.toPromise()))
            .then(results => {
              console.log('Alle Subtasks gespeichert:', results);
            })
            .catch(error => {
              console.error('Fehler beim Speichern der Subtasks:', error);
            });
        }
      },
      error: (error) => {
        console.error('Fehler beim Speichern des Tasks:', error.error);
      }
    });
  }
  
  getContactName(contactId: number): string {
    return this.contacts.find(c => c.id === contactId)?.name || 'Unbekannt';
  }

  getContactColor(contactId: number): string {
    return this.contacts.find(c => c.id === contactId)?.color || 'Unbekannt';
  }

  getInitials(name:string) {
    return name
      .trim()                        // Entfernt führende/trailing Leerzeichen
      .split(/\s+/)                  // Teilt bei einem oder mehreren Leerzeichen
      .map(word => word.charAt(0))   // Erster Buchstabe jedes Wortes
      .join('')
      .toUpperCase();
  }
}
