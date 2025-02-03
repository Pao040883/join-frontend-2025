import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../app/main-content/board/board.component';

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private tasksUrl = 'http://127.0.0.1:8000/api/tasks/';
  private subtasksUrl = 'http://127.0.0.1:8000/api/subtasks/';
  private contactsUrl = 'http://127.0.0.1:8000/api/contacts/';

  constructor(private http: HttpClient) {}

  createTask(taskData: any) {
    return this.http.post(this.tasksUrl, taskData);
  }

  updateTaskType(taskId: number, newType: string) {
    const url = `http://127.0.0.1:8000/api/tasks/${taskId}/`;
    return this.http.patch(url, { type: newType });
  }

  updateTaskPosition(taskId: number, position: number, type: string): Observable<any> {
    const url = `http://127.0.0.1:8000/api/tasks/${taskId}/`;
    return this.http.patch(url, { position: position, type: type });
  }

  updateTask(task: Task) {
    const url = `http://127.0.0.1:8000/api/tasks/${task.id}/`;
    return this.http.patch(url, task);
  }

  deleteTask(taskId: any) {
    return this.http.delete(`${this.tasksUrl}${taskId}/`);
  }

  createSubTask(taskData: any) {
    return this.http.post(this.subtasksUrl, taskData);
  }

  getSubtasksByTaskId(taskId: number) {
    const url = `http://127.0.0.1:8000/api/tasks/${taskId}/subtasks/`;
    return this.http.get<any[]>(url);
  }

  updateSubtaskStatus(taskId: number, newStatus: string) {
    const url = `http://127.0.0.1:8000/api/subtasks/${taskId}/`;
    return this.http.patch(url, {status: newStatus});
  }

  deleteSubtask(taskId: any) {
    return this.http.delete(`${this.subtasksUrl}${taskId}/`);
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactsUrl);
  }

  
}
