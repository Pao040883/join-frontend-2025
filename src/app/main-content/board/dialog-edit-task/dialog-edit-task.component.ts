import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { ApiService, Contact } from '../../../../shared/api.service';
import { Task } from '../board.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-dialog-edit-task',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatDatepickerModule, MatButtonToggleGroup, FormsModule, MatButtonToggle, MatInputModule,
    MatDialogContent, MatDialogActions, CommonModule, MatCheckboxModule],
  templateUrl: './dialog-edit-task.component.html',
  styleUrl: './dialog-edit-task.component.scss'
})
export class DialogEditTaskComponent {
  private apiService = inject(ApiService);
  private dialogRef = inject(MatDialogRef<DialogEditTaskComponent>);

  contacts: Contact[] = []; // Alle geladenen Kontakte
  selectedContacts: number[] = []; // IDs der ausgewählten Kontakte
  subtasks: any[] = []; // Subtasks
  newSubtasks: any[] = []; // Subtasks
  test: string = ''; // Eingabewert für Subtasks
  isEditing = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Task, private http: HttpClient) { }

  toggleEditing() {
    this.isEditing = !this.isEditing;
  }

  ngOnInit() {
    this.loadContacts();
    this.selectedContacts = this.data.contacts;
    this.loadSubtasks();
  }

  loadContacts() {
    this.apiService.loadContacts().subscribe({
      next: (response) => (this.contacts = response),
      error: (error) => console.error('Fehler beim Laden der Kontakte:', error)
    });
  }

  loadSubtasks(): void {
    this.apiService.getSubtasksByTaskId(this.data.id).subscribe(data => {
      this.subtasks = data;
    });
  }

  addSubtask() {
    if (this.test.trim()) {
      this.newSubtasks.push(this.test);
      this.test = '';
    }
  }

  removeSubtask(index: number) {
    this.newSubtasks.splice(index, 1);
  }

  deleteTask() {
    this.apiService.deleteTask(this.data.id).subscribe({
      next: () => {
        this.dialogRef.close(true);  // true signalisiert, dass der Task gelöscht wurde
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Tasks:', error);
      }
    });
  }

  deleteSubtaskTask(id: number) {
    this.apiService.deleteSubtask(id).subscribe({
      next: () => {
        this.dialogRef.close(true);  // true signalisiert, dass der Task gelöscht wurde
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Tasks:', error);
      }
    });
  }

  saveChanges() {
    if (this.data.due_date) {
      const localDate = new Date(this.data.due_date);
      const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
      this.data.due_date = utcDate.toISOString().split('T')[0];  // YYYY-MM-DD
    }

    this.data.contacts = this.selectedContacts;

    const subtaskRequests = this.newSubtasks.map(subtaskTitle => {
      return this.apiService.createSubTask({ title: subtaskTitle, status: 'open', task: this.data.id });
    });

    const updateTaskRequest = this.apiService.updateTask(this.data);

    forkJoin([...subtaskRequests, updateTaskRequest]).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => console.error('Fehler beim Speichern:', err),
    });
  }

  changeType(newType: string) {
    this.apiService.updateTaskType(this.data.id, newType).subscribe({
      error: (error) => console.error('Fehler beim Ändern des Typs:', error)
    });
  }

  updateStatus(id: number, status: string) {
    const newStatus = status === 'open' ? 'done' : 'open';
    this.apiService.updateSubtaskStatus(id, newStatus).subscribe({
      error: (error) => console.error('Fehler beim Ändern des Typs:', error)
    });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  formatDate(date: string) {
    const formattedDate = date.split('-').reverse().join('/');
    return formattedDate
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
