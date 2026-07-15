# Department Enhancement & Split CI/CD

*Employee Management System*

## What was done

The existing Employee Management System only stored department as a plain text field on the employee. This task replaces that with a real Department entity and a proper one-to-many relationship, adds full CRUD for departments, and splits the single Jenkins pipeline into two independent ones for the backend and frontend.

## Entity relationship

One Department can have many Employees, and one Employee belongs to exactly one Department.

Employee is the owning side of the relationship, it holds the foreign key `department_id`. Department has the inverse side of the mapping (`@OneToMany(mappedBy = "department")`) purely so JPA can navigate from a department to its employees when needed internally. That field is marked `@JsonIgnore` so a department response never tries to serialize its entire employee list. Doing that would also cause infinite recursion, since each employee already carries a reference back to its department. If someone needs the employees in a department, there's a dedicated endpoint for that instead.

## Database schema

**departments**

| Column          | Type         |
|-----------------|--------------|
| id              | BIGINT (PK)  |
| department_name | VARCHAR(255), unique |
| location        | VARCHAR(255) |

**employees**

| Column        | Type         |
|---------------|--------------|
| id            | BIGINT (PK)  |
| name          | VARCHAR(255) |
| email         | VARCHAR(255), unique |
| salary        | DOUBLE       |
| joining_date  | DATE         |
| department_id | BIGINT, FK to departments.id |

`spring.jpa.hibernate.ddl-auto=update` is already set in `application.properties`, so Hibernate creates the new `departments` table and adds the `department_id` column on the next boot. No manual migration was needed for this.

## API list

**Department**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/departments` | Create department |
| GET | `/api/departments/{id}` | Get department by id |
| GET | `/api/departments` | Get all departments |
| PUT | `/api/departments/{id}` | Update department |
| DELETE | `/api/departments/{id}` | Delete department |

**Employee**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employees` | Create employee (body includes departmentId) |
| GET | `/api/employees/{id}` | Get employee by id |
| GET | `/api/employees?page=&size=&sortBy=&direction=` | Paginated and sorted list |
| GET | `/api/employees/search?name=` | Search by name |
| GET | `/api/employees/department/{departmentId}` | Employees in a department |
| PUT | `/api/employees/{id}` | Update employee, also used to reassign department |
| DELETE | `/api/employees/{id}` | Delete employee |

Sample create-employee request:

```json
{
  "name": "Divyansh Garg",
  "email": "divyansh@gmail.com",
  "departmentId": 1,
  "salary": 80000,
  "joiningDate": "2026-06-25"
}
```

There's no separate "assign employee to department" endpoint. Setting `departmentId` in the create or update body does that job, adding another endpoint for it would have just duplicated the update call.

## Splitting the CI/CD pipeline

The old setup had one Jenkins pipeline building and deploying both the frontend and backend together. That's now split into `Jenkinsfile.backend` and `Jenkinsfile.frontend`, each with its own checkout, build, deploy, and verify stages, so either side can be shipped without touching the other.

Both containers join a shared external Docker network called `ems-network`, so the backend can still reach MySQL by container name the same way it did when everything lived under one docker-compose file.

Before running either pipeline for the first time, MySQL needs to exist as a standalone, persistent container on that network:

```bash
docker network create ems-network
docker compose -f docker-compose.mysql.yml up -d
```

The backend pipeline checks out the code, runs `docker build` against `Backend/Dockerfile` (Maven compilation happens inside that multi-stage build, so Jenkins itself doesn't need Maven installed), then runs the container on `ems-network` on port 8080, and finishes with `docker ps` to confirm it's up.

The frontend pipeline follows the same shape: checkout, `docker build` against `Frontend/Dockerfile` (Angular build plus nginx, also multi-stage), run the container on `ems-network` on port 4200, then verify with `docker ps`.

In Jenkins this means two separate Pipeline jobs pointing at the same repo but different Jenkinsfiles, the backend job set to `Jenkinsfile.backend` and the frontend job to `Jenkinsfile.frontend`. That way a UI-only change doesn't force a backend rebuild and redeploy, and vice versa.

## Challenges faced

**Circular JSON serialization.** Since Employee and Department reference each other, serializing one naively pulls in the other, which pulls in the first again, and so on. This was fixed with `@JsonIgnore` on `Department.employees` and `@JsonIgnoreProperties("employees")` on `Employee.department`, so an employee response still shows its department, but nothing tries to walk back into the employee list from there.

**Keeping the containers networked after splitting the pipeline.** The original single pipeline used docker-compose, which handled networking automatically. Once it's two independent pipelines, there's no single compose file tying everything together anymore, so an external `ems-network` plus a standalone `docker-compose.mysql.yml` was added as shared infrastructure that both pipelines attach to.

**Angular's newer build output path.** This project's `angular.json` uses the newer `application` builder, which outputs to `dist/browser/` instead of the older `dist/<project-name>/browser/` path. The frontend Dockerfile's nginx copy step had to be pointed at the right one, otherwise the image would build fine but serve an empty page.

**Moving the frontend form off a free-text department field.** The Angular form used to take department as a plain string typed by hand. It now fetches the department list from `/api/departments` when it loads, binds the form to `departmentId` through a dropdown, and shows `department.departmentName` from the nested object the API now returns instead of a flat string.