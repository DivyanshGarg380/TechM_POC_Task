import { useEffect, useState } from "react";
import api from "./api";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable";

function App() {

  const empty = {
    name: "",
    email: "",
    department: "",
    salary: "",
    joiningDate: ""
  };

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const loadEmployees = async () => {
    const res = await api.get("?page=0&size=20&sortBy=id&direction=asc");
    setEmployees(res.data.content);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const saveEmployee = async () => {
    if (editingId) {
      await api.put(`/${editingId}`, employee);
    } else {
      await api.post("", employee);
    }
    setEmployee(empty);
    setEditingId(null);
    loadEmployees();
  };

  const deleteEmployee = async (id) => {
    await api.delete(`/${id}`);
    loadEmployees();
  };

  const editEmployee = (emp) => {
    setEditingId(emp.id);
    setEmployee(emp);
  };

  return (
    <div className="container">

      <h1>Employee Management System</h1>

      <EmployeeForm
        employee={employee}
        setEmployee={setEmployee}
        saveEmployee={saveEmployee}
        editing={editingId}
      />

      <EmployeeTable
        employees={employees}
        editEmployee={editEmployee}
        deleteEmployee={deleteEmployee}
      />

    </div>
  );
}

export default App;