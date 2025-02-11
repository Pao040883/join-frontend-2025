import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDragEnter,
  CdkDragExit,
} from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { ApiService, Contact } from '../../../shared/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditTaskComponent } from './dialog-edit-task/dialog-edit-task.component';
import { CommonModule } from '@angular/common';
import { DialogAddTaskComponent } from './dialog-add-task/dialog-add-task.component';

export interface Task {
  id: number;
  type: string;
  title: string;
  description: string;
  prio: string;
  category: string;
  total_subtasks: number;
  done_subtasks: number;
  due_date: string;
  position: number;
  contacts: number[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatProgressBarModule, CdkDropList, CdkDrag, CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  private apiService = inject(ApiService);
  todo: Task[] = [];
  in_progress: Task[] = [];
  done: Task[] = [];
  feedback: Task[] = [];
  contacts: Contact[] = [];

  originalTodo: Task[] = [];
  originalInProgress: Task[] = [];
  originalDone: Task[] = [];
  originalFeedback: Task[] = [];

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit() {
    this.loadTasks();
    this.loadContacts();   
  }

  loadContacts() {
    this.apiService.loadContacts().subscribe({
      next: (response) => (this.contacts = response),
      error: (error) => console.error('Fehler beim Laden der Kontakte:', error)
    });
  }

  loadTasks() {
    this.apiService.loadTasks().subscribe({
      next: (tasks) => {
        this.todo = this.originalTodo = tasks.filter(task => task.type === 'todo').sort((a, b) => a.position - b.position);
        this.in_progress = this.originalInProgress = tasks.filter(task => task.type === 'progress').sort((a, b) => a.position - b.position);
        this.done = this.originalDone = tasks.filter(task => task.type === 'done').sort((a, b) => a.position - b.position);
        this.feedback = this.originalFeedback = tasks.filter(task => task.type === 'feedback').sort((a, b) => a.position - b.position);
      },
      error: (error) => console.error('Fehler beim Laden der Aufgaben:', error)
    });
  }

  filterTasks(event: Event) {
    const searchTerm = this.getSearchTerm(event);
    
    if (!searchTerm) {
      this.resetTaskLists();
      return;
    }
  
    this.applyFilter(searchTerm);
  }
  
  /**
   * Extrahiert und normalisiert den Suchbegriff aus dem Eingabe-Event.
   * @param event - Das Input-Event des Suchfelds.
   * @returns Der normalisierte Suchbegriff.
   */
  private getSearchTerm(event: Event): string {
    const inputElement = event.target as HTMLInputElement;
    return inputElement.value.trim().toLowerCase();
  }
  
  /**
   * Setzt alle Aufgabenlisten auf ihren ursprünglichen Zustand zurück.
   */
  private resetTaskLists(): void {
    this.todo = [...this.originalTodo];
    this.in_progress = [...this.originalInProgress];
    this.done = [...this.originalDone];
    this.feedback = [...this.originalFeedback];
  }
  
  /**
   * Filtert alle Aufgabenlisten basierend auf dem Suchbegriff.
   * @param searchTerm - Der Suchbegriff, nach dem gefiltert werden soll.
   */
  private applyFilter(searchTerm: string): void {
    this.todo = this.filterList(this.originalTodo, searchTerm);
    this.in_progress = this.filterList(this.originalInProgress, searchTerm);
    this.done = this.filterList(this.originalDone, searchTerm);
    this.feedback = this.filterList(this.originalFeedback, searchTerm);
  }
  
  /**
   * Filtert eine einzelne Aufgabenliste basierend auf dem Suchbegriff.
   * @param tasks - Die Aufgabenliste, die gefiltert werden soll.
   * @param searchTerm - Der Suchbegriff, nach dem gefiltert wird.
   * @returns Die gefilterte Aufgabenliste.
   */
  private filterList(tasks: Task[], searchTerm: string): Task[] {
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }
  

  updatePositions(tasks: Task[], type: string) {
    tasks.forEach((task, index) => {
      const updatedPosition = index + 1; // Positionen beginnen bei 1
  
      // Nur aktualisieren, wenn sich die Position geändert hat
      if (task['position'] !== updatedPosition || task.type !== type) {
        this.apiService.updateTaskPosition(task.id, updatedPosition, type).subscribe({
          error: (error) => console.error('Fehler beim Aktualisieren der Position:', error)
        });
      }
    });
  }
  

  openEditDialog(id: number) {
    this.apiService.loadTask(id).subscribe({
      next: (taskData) => {
        const dialogRef = this.dialog.open(DialogEditTaskComponent, {
          data: taskData, 
        });
  
        dialogRef.afterClosed().subscribe(result => {
          this.loadTasks();
        });
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Task-Daten:', error);
      }
    });
  }

  openAddTaskDialog(container: string){
    const dialogRef = this.dialog.open(DialogAddTaskComponent, {
      data: container
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadTasks();
    });
  }
  

  activeContainers: Record<string, boolean> = {
    todoList: false,
    progressList: false,
    feedbackList: false,
    doneList: false
  };

  drop(event: CdkDragDrop<Task[]>) {
    const movedTask = event.previousContainer.data[event.previousIndex];
  
    if (event.previousContainer === event.container) {
      // Innerhalb derselben Liste verschoben
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updatePositions(event.container.data, movedTask.type); // Positionen aktualisieren
    } else {
      // In eine andere Liste verschoben
      transferArrayItem(
        event.previousContainer.data as Task[],
        event.container.data as Task[],
        event.previousIndex,
        event.currentIndex
      );
  
      let newType = '';
      switch (event.container.id) {
        case 'cdk-drop-list-0':
          newType = 'todo';
          break;
        case 'cdk-drop-list-1':
          newType = 'progress';
          break;
        case 'cdk-drop-list-2':
          newType = 'feedback';
          break;
        case 'cdk-drop-list-3':
          newType = 'done';
          break;
        default:
          console.warn('Unbekannter Ziel-Container:', event.container.id);
          return;
      }
  
      // Typ der verschobenen Aufgabe aktualisieren
      this.changeType(movedTask.id, newType);
  
      // Positionen in der neuen Liste aktualisieren
      this.updatePositions(event.container.data, newType);
    }
  
    // Alle aktiven Container deaktivieren
    Object.keys(this.activeContainers).forEach(key => this.activeContainers[key] = false);
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

  onEnter(event: CdkDragEnter<any>, listName: string) {
    this.activeContainers[listName] = true;
  }

  onExit(event: CdkDragExit<any>, listName: string) {
    this.activeContainers[listName] = false;
  }
  
  subtaskProgress(done: number, total:number) {
    return done/total*100
  }

  changeType(taskId: number, newType: string) {
    this.apiService.updateTaskType(taskId, newType).subscribe({
      error: (error) => console.error('Fehler beim Ändern des Typs:', error)
    });
  }
}
