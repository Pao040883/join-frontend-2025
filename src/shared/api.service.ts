import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../app/main-content/board/board.component';

export interface Contact {
  id?: number;
  name: string;
  email?: string;
  phone?: number;
  color?: string;
  user?: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private tasksUrl = 'http://127.0.0.1:8000/api/tasks/';
  private subtasksUrl = 'http://127.0.0.1:8000/api/subtasks/';
  private contactsUrl = 'http://127.0.0.1:8000/api/contacts/';
  private loginUrl = 'http://127.0.0.1:8000/api/login/';
  private signUrl = 'http://127.0.0.1:8000/api/registration/';
  private dashboardUrl = 'http://127.0.0.1:8000/api/dashboard/';
  private updateUserUrl = 'http://127.0.0.1:8000/api/user/me/update/';
  private getUserUrl = 'http://127.0.0.1:8000/api/user/me/';

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + localStorage.getItem('token')
  });

  constructor(private http: HttpClient) {}


  loadTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.tasksUrl}${id}/`, { headers: this.headers });
  }  

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksUrl, { headers: this.headers });
  } 

  createTask(taskData: any) {
    return this.http.post(this.tasksUrl, taskData, { headers: this.headers });
  }

  updateTaskType(taskId: number, newType: string) {
    const url = `${this.tasksUrl}${taskId}/`;
    return this.http.patch(url, { type: newType }, { headers: this.headers });
  }

  updateTaskPosition(taskId: number, position: number, type: string): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/`;
    return this.http.patch(url, { position: position, type: type }, { headers: this.headers });
  }

  updateTask(task: Task) {
    const url = `${this.tasksUrl}${task.id}/`;
    return this.http.patch(url, task, { headers: this.headers });
  }

  deleteTask(taskId: any) {
    return this.http.delete(`${this.tasksUrl}${taskId}/`, { headers: this.headers });
  }

  createSubTask(taskData: any) {
    return this.http.post(this.subtasksUrl, taskData, { headers: this.headers });
  }

  getSubtasksByTaskId(taskId: number) {
    const url = `${this.tasksUrl}${taskId}/subtasks/`;
    return this.http.get<any[]>(url, { headers: this.headers });
  }

  updateSubtaskStatus(taskId: number, newStatus: string) {
    const url = `${this.subtasksUrl}${taskId}/`;
    return this.http.patch(url, {status: newStatus}, { headers: this.headers });
  }

  deleteSubtask(taskId: any) {
    return this.http.delete(`${this.subtasksUrl}${taskId}/`, { headers: this.headers });
  }

  loadContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactsUrl, { headers: this.headers });
  } 

  loadContactById(contactId: any): Observable<Contact> {
    return this.http.get<Contact>(`${this.contactsUrl}${contactId}/`, { headers: this.headers });
  } 

  createContacts(contact: Contact) {
    return this.http.post(this.contactsUrl, contact, { headers: this.headers });
  }

  updateContact(contact: Contact) {
    const url = `http://127.0.0.1:8000/api/contacts/${contact.id}/`;
    return this.http.patch(url, contact, { headers: this.headers });
  }

  deleteContact(contactId: any) {
    return this.http.delete(`${this.contactsUrl}${contactId}/`, { headers: this.headers });
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, data);
  }

  signUp(data: any): Observable<any> {
    return this.http.post<any>(this.signUrl, data);
  }

  // loadDashboard(): Observable<any> {
  //   return this.http.get<any[]>(this.dashboardUrl, { headers: this.headers });
  // } 

  loadDashboard(): Observable<any> {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('Kein Token gefunden, Dashboard-Request wird nicht gesendet.');
      return new Observable();
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
  
    return this.http.get<any[]>(this.dashboardUrl, { headers });
  }
  

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.updateUserUrl}`, user, { headers: this.headers });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.getUserUrl}`, { headers: this.headers });
  }
}
