function EmployeeForm({ employee, setEmployee, saveEmployee, editing }) {

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card">

      <input
        name="name"
        placeholder="Name"
        value={employee.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={employee.email}
        onChange={handleChange}
      />

      <input
        name="department"
        placeholder="Department"
        value={employee.department}
        onChange={handleChange}
      />

      <input
        name="salary"
        type="number"
        placeholder="Salary"
        value={employee.salary}
        onChange={handleChange}
      />

      <input
        name="joiningDate"
        type="date"
        value={employee.joiningDate}
        onChange={handleChange}
      />

      <button onClick={saveEmployee}>
        {editing ? "Update Employee" : "Add Employee"}
      </button>

    </div>
  );
}

export default EmployeeForm;