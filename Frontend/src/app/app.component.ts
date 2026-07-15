import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Department {
  id?: number;
  departmentName: string;
  location: string;
}

interface Employee {
  id?: number;
  name: string;
  email: string;
  departmentId: number | null;
  department?: Department;
  salary: number;
  joiningDate: string;
}

const EMP_API = 'http://localhost:8080/api/employees';
const DEPT_API = 'http://localhost:8080/api/departments';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  searchTerm = '';
  departmentFilter: number | null = null;
  page = 0;
  size = 5;
  totalPages = 0;
  editingId: number | null = null;
  showForm = false;

  form: Employee = this.emptyForm();

  constructor(private http: HttpClient) {
    this.loadDepartments();
    this.load();
  }

  emptyForm(): Employee {
    return { name: '', email: '', departmentId: null, salary: 0, joiningDate: '' };
  }

  loadDepartments() {
    this.http.get<Department[]>(DEPT_API).subscribe({
      next: (res) => this.departments.set(res),
      error: () => this.departments.set([])
    });
  }

  load() {
    if (this.departmentFilter) {
      this.http.get<Employee[]>(`${EMP_API}/department/${this.departmentFilter}`).subscribe({
        next: (res) => { this.employees.set(res); this.totalPages = 1; },
        error: () => this.employees.set([])
      });
      return;
    }
    this.http.get<any>(`${EMP_API}?page=${this.page}&size=${this.size}`).subscribe({
      next: (res) => {
        this.employees.set(res.content ?? []);
        this.totalPages = res.totalPages ?? 0;
      },
      error: () => this.employees.set([])
    });
  }

  search() {
    if (!this.searchTerm.trim()) { this.load(); return; }
    this.http.get<Employee[]>(`${EMP_API}/search?name=${encodeURIComponent(this.searchTerm)}`).subscribe({
      next: (res) => this.employees.set(res),
      error: () => this.employees.set([])
    });
  }

  filterByDepartment() {
    this.searchTerm = '';
    this.page = 0;
    this.load();
  }

  openAdd() {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  openEdit(emp: Employee) {
    this.editingId = emp.id ?? null;
    this.form = { ...emp, departmentId: emp.department?.id ?? emp.departmentId };
    this.showForm = true;
  }

  save() {
    const req = this.editingId
      ? this.http.put<Employee>(`${EMP_API}/${this.editingId}`, this.form)
      : this.http.post<Employee>(EMP_API, this.form);
    req.subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }

  remove(id?: number) {
    if (!id) return;
    if (!confirm('Delete this employee?')) return;
    this.http.delete(`${EMP_API}/${id}`, { responseType: 'text' }).subscribe(() => this.load());
  }

  cancel() {
    this.showForm = false;
  }

  prevPage() { if (this.page > 0) { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages - 1) { this.page++; this.load(); } }
}