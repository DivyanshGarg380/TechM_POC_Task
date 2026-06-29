import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Employee {
  id?: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  joiningDate: string;
}

const API = 'http://localhost:8080/api/employees';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  employees = signal<Employee[]>([]);
  searchTerm = '';
  page = 0;
  size = 5;
  totalPages = 0;
  editingId: number | null = null;
  showForm = false;

  form: Employee = this.emptyForm();

  constructor(private http: HttpClient) {
    this.load();
  }

  emptyForm(): Employee {
    return { name: '', email: '', department: '', salary: 0, joiningDate: '' };
  }

  load() {
    this.http.get<any>(`${API}?page=${this.page}&size=${this.size}`).subscribe({
      next: (res) => {
        this.employees.set(res.content ?? []);
        this.totalPages = res.totalPages ?? 0;
      },
      error: () => this.employees.set([])
    });
  }

  search() {
    if (!this.searchTerm.trim()) { this.load(); return; }
    this.http.get<Employee[]>(`${API}/search?name=${encodeURIComponent(this.searchTerm)}`).subscribe({
      next: (res) => this.employees.set(res),
      error: () => this.employees.set([])
    });
  }

  openAdd() {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  openEdit(emp: Employee) {
    this.editingId = emp.id ?? null;
    this.form = { ...emp };
    this.showForm = true;
  }

  save() {
    const req = this.editingId
      ? this.http.put<Employee>(`${API}/${this.editingId}`, this.form)
      : this.http.post<Employee>(API, this.form);
    req.subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }

  remove(id?: number) {
    if (!id) return;
    if (!confirm('Delete this employee?')) return;
    this.http.delete(`${API}/${id}`, { responseType: 'text' }).subscribe(() => this.load());
  }

  cancel() {
    this.showForm = false;
  }

  prevPage() { if (this.page > 0) { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages - 1) { this.page++; this.load(); } }
}
