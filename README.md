# Employee Management System

## Overview

Employee Management System is a RESTful web application built using Java, Spring Boot, Spring Data JPA, and MySQL.

The application provides CRUD operations for employee management along with search, pagination, sorting, validation, exception handling, and API documentation support.

## Features

* Create Employee
* Update Employee
* Delete Employee
* Get Employee by ID
* Get All Employees
* Search Employee by Name
* Pagination
* Sorting
* Input Validation
* Global Exception Handling
* Swagger API Documentation

## Tech Stack

* Java 17
* Spring Boot
* Spring Data JPA
* MySQL
* Maven
* Swagger OpenAPI

## Database Schema

### Employee Table

| Column       | Type         |
| ------------ | ------------ |
| id           | BIGINT       |
| name         | VARCHAR(100) |
| email        | VARCHAR(150) |
| department   | VARCHAR(100) |
| salary       | DOUBLE       |
| joining_date | DATE         |

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

### Create Database

```sql
CREATE DATABASE employee_db;
```

### Configure Database

Update the following properties in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_db
spring.datasource.username=root
spring.datasource.password=root
```

### Run Application

```bash
mvn spring-boot:run
```

Application will start at:

```text
http://localhost:8080
```

## Swagger Documentation

```text
http://localhost:8080/swagger-ui.html
```

## API Endpoints

### Create Employee

```http
POST /api/employees
```

Request Body

```json
{
  "name": "Divyansh Garg",
  "email": "divyansh@gmail.com",
  "department": "Engineering",
  "salary": 80000,
  "joiningDate": "2026-06-25"
}
```

### Get Employee By ID

```http
GET /api/employees/{id}
```

### Get All Employees

```http
GET /api/employees?page=0&size=5&sortBy=name&direction=asc
```

### Search Employee

```http
GET /api/employees/search?name=div
```

### Update Employee

```http
PUT /api/employees/{id}
```

### Delete Employee 

```http
DELETE /api/employees/{id}
```

## Author

Divyansh Garg
