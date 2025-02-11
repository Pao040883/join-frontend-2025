import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService, Contact } from '../../../../shared/api.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog-add-task',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonToggleModule, MatIconModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './dialog-add-task.component.html',
  styleUrl: './dialog-add-task.component.scss'
})
export class DialogAddTaskComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogRef = inject(MatDialogRef<DialogAddTaskComponent>);

  contacts: Contact[] = []; // Alle geladenen Kontakte
  selectedContacts: number[] = []; // IDs der ausgewählten Kontakte
  subtasks: string[] = []; // Subtasks
  test: string = ''; // Eingabewert für Subtasks

  task = {
    title: '',
    description: '',
    due_date: '',
    prio: 'medium', 
    category: '',
    contacts: [] as number[],
    type: this.data,
  };

  constructor(private http: HttpClient, private _snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: string) { }

  ngOnInit() {
    this.loadContacts();
  }

  openSnackBar() {
    const snackBarRef = this._snackBar.open('Task erstellt', '', { duration: 1500 });
  }

  loadContacts() {
    this.apiService.loadContacts().subscribe({
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

    // Zuerst den Task speichern
    this.apiService.createTask(this.task).subscribe({
      next: (response: any) => {
        const taskId = response.id; // Die ID des erstellten Tasks

        // Subtasks erstellen, wenn welche vorhanden sind
        if (this.subtasks.length > 0) {
          const subtaskRequests = this.subtasks.map(title => {
            const subtask = {
              title: title,
              status: 'open',
              task: taskId // Verknüpfung mit dem erstellten Task
            };

            return this.apiService.createSubTask(subtask);
          });

          // Warten, bis alle Subtasks gespeichert wurden
          Promise.all(subtaskRequests.map(req => req.toPromise()))
            .then(results => {
            })
            .catch(error => {
              console.error('Fehler beim Speichern der Subtasks:', error);
            });
        }
        this.dialogRef.close();
        this.openSnackBar();
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

  getInitials(name: string) {
    return name
      .trim()                        // Entfernt führende/trailing Leerzeichen
      .split(/\s+/)                  // Teilt bei einem oder mehreren Leerzeichen
      .map(word => word.charAt(0))   // Erster Buchstabe jedes Wortes
      .join('')
      .toUpperCase();
  }
}
