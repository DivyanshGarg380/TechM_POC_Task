import {useEffect,useState} from 'react';
import axios from 'axios';

const API='http://localhost:8080/api/employees';

export default function App(){
    const [employees,setEmployees]=useState([]);
    const [form,setForm]=useState({name:'',email:'',department:'',salary:'',joiningDate:''});

    const load=()=> axios.get(API).then(r=> setEmployees(r.data.content??r.data));
        useEffect(load,[]);
        const submit=async(e)=>{
        e.preventDefault();
        await axios.post(API,{...form,salary:Number(form.salary)});
        setForm({name:'',email:'',department:'',salary:'',joiningDate:''});
        load();
    };

    const del = async(id)=>{await axios.delete(`${API}/${id}`);load();}

    return (
        <div className="container">
            <h1>Employee Management System</h1>
            <form onSubmit={submit} className="card">
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            <input placeholder="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/>
            <input placeholder="Salary" type="number" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/>
            <input type="date" value={form.joiningDate} onChange={e=>setForm({...form,joiningDate:e.target.value})}/>
            <button>Add Employee</button>
            </form>
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Salary</th><th>Joining</th><th></th></tr></thead>
                <tbody>
                    {employees.map(emp=>(
                        <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>{emp.salary}</td>
                        <td>{emp.joiningDate}</td>
                        <td><button onClick={()=>del(emp.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
