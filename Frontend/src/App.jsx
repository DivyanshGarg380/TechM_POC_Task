import { useEffect, useState } from "react";
import api from "./api";

import EmployeeForm from "./components/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";

function App() {

  const emptyEmployee = {
    name: "",
    email: "",
    department: "",
    salary: "",
    joiningDate: ""
  };

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(emptyEmployee);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const loadEmployees = async () => {
    try {
      const res = await api.get("", {
        params: {
          page,
          size: 5,
          sortBy: "id",
          direction: "asc"
        }
      });
      setEmployees(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page]);

  const saveEmployee = async () => {
    try {
      if (editingId) {
        await api.put(`/${editingId}`, employee);
      } else {
        await api.post("", employee);
      }
      setEmployee(emptyEmployee);
      setEditingId(null);
      loadEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await api.delete(`/${id}`);
    loadEmployees();
  };

  const editEmployee = (emp) => {
    setEditingId(emp.id);
    setEmployee(emp);
  };

  const searchEmployee = async (text) => {
    setSearch(text);
    if (text.trim() === "") {
      loadEmployees();
      return;
    }

    try {
      const res = await api.get("/search", {
        params: {
          name: text
        }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">

      <h1>Employee Management System</h1>

      <SearchBar
        value={search}
        onChange={searchEmployee}
      />

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

      {search.trim() === "" && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

    </div>
  );
}

export default App;