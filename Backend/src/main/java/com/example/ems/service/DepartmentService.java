package com.example.ems.service;

import com.example.ems.dto.DepartmentRequest;
import com.example.ems.entity.Department;
import com.example.ems.exception.ResourceNotFoundException;
import com.example.ems.repository.DepartmentRepository;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository repository;

    public Department createDepartment(DepartmentRequest request) {
        Department department = new Department();
        department.setDepartmentName(request.getDepartmentName());
        department.setLocation(request.getLocation());
        return repository.save(department);
    }

    public Department getDepartment(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    public Department updateDepartment(Long id, DepartmentRequest request) {
        Department department = getDepartment(id);
        department.setDepartmentName(request.getDepartmentName());
        department.setLocation(request.getLocation());
        return repository.save(department);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartment(id);
        repository.delete(department);
    }
}