function EmployeeTable({ employees, editEmployee, deleteEmployee }) {

  return (
    <table>

      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Salary</th>
          <th>Joining Date</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {employees.map((emp) => (

          <tr key={emp.id}>

            <td>{emp.id}</td>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>{emp.department}</td>
            <td>{emp.salary}</td>
            <td>{emp.joiningDate}</td>

            <td>

              <button
                className="edit"
                onClick={() => editEmployee(emp)}
              >
                Edit
              </button>

              <button
                className="delete"
                onClick={() => deleteEmployee(emp.id)}
              >
                Delete
              </button>

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}

export default EmployeeTable;