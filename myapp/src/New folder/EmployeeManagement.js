import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function EmployeeManagement({ isLoggedIn }) {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ id: '', name: '', email: '', password: '' });
    const [salesHistory, setSalesHistory] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/employees');
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        const fetchSalesHistory = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sales');
                const data = await response.json();
                setSalesHistory(data);
            } catch (error) {
                console.error('Error fetching sales history:', error);
            }
        };

        fetchEmployees();
        fetchSalesHistory(); // Fetch sales history
    }, [isLoggedIn]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addOrUpdateEmployee = async (e) => {
        e.preventDefault();
        const employeeData = {
            name: form.name,
            email: form.email,
            password: form.password
        };

        try {
            if (form.id) {
                await fetch(`http://localhost:5000/api/employees/${form.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(employeeData),
                });
            } else {
                await fetch('http://localhost:5000/api/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(employeeData),
                });
            }

            setForm({ id: '', name: '', email: '', password: '' });

            const response = await fetch('http://localhost:5000/api/employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error adding or updating employee:', error);
        }
    };

    const editEmployee = (id) => {
        const employee = employees.find(emp => emp.id === id);
        setForm(employee);
    };

    const deleteEmployee = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/employees/${id}`, {
                method: 'DELETE'
            });
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    return (
        <div>
            <h1>Employee Management</h1>
            <form onSubmit={addOrUpdateEmployee}>
                <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleInputChange} 
                    placeholder="Name" 
                    required 
                />
                <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleInputChange} 
                    placeholder="Email" 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleInputChange} 
                    placeholder="Password" 
                    required 
                />
                <button type="submit">{form.id ? 'Update' : 'Add'} Employee</button>
            </form>

            <h2>Employee List</h2>
            {employees.map(emp => (
                <div key={emp.id}>
                    <h3>{emp.name}</h3>
                    <p>{emp.email}</p>
                    <button onClick={() => editEmployee(emp.id)}>Edit</button>
                    <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
                </div>
            ))}

            <h2>Sales History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Employee</th>
                        <th>Quantity Sold</th>
                        <th>Sale Date</th>
                    </tr>
                </thead>
                <tbody>
                    {salesHistory.map(sale => (
                        <tr key={sale.id}>
                            <td>{sale.productName}</td>
                            <td>{sale.employeeName}</td>
                            <td>{sale.quantity_sold}</td>
                            <td>{new Date(sale.sale_date).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Employee Count Chart</h2>
            <BarChart width={600} height={300} data={[{ name: 'Employees', count: employees.length }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </div>
    );
}

export default EmployeeManagement;
