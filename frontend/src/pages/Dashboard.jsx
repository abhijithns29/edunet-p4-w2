import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // ✅ Calculate Total Expenses
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0);

  // ✅ Add Expense
  const handleAddExpense = async () => {
    if (!description || !amount) return alert('Enter description and amount');
    
    try {
      await axios.post(
        'http://localhost:5000/api/expenses',
        { description, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDescription('');
      setAmount('');
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  // ✅ Edit Expense
  const handleEditExpense = async () => {
    if (!editingExpense || !description || !amount) return;

    try {
      await axios.put(
        `http://localhost:5000/api/expenses/${editingExpense._id}`,
        { description, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingExpense(null);
      setDescription('');
      setAmount('');
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // ✅ Delete Single Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // ✅ Handle Edit Click
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
  };

  // ✅ Select/Deselect Expense for Bulk Deletion
  const handleSelectExpense = (id) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((expenseId) => expenseId !== id)
        : [...prevSelected, id]
    );
  };

  // ✅ Delete Selected Expenses
  const handleDeleteSelected = async () => {
    if (selectedExpenses.length === 0) return alert('No expenses selected');
    if (!window.confirm('Are you sure you want to delete selected expenses?')) return;

    try {
      await Promise.all(
        selectedExpenses.map((id) =>
          axios.delete(`http://localhost:5000/api/expenses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setSelectedExpenses([]);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting selected expenses:', error);
    }
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Expense Dashboard</h2>

      {/* Total Expenses */}
      <h3 className="text-xl font-semibold mb-4">Total Expenses: ₹{totalExpenses}</h3>

      {/* Add / Edit Expense Form */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
        />
        {editingExpense ? (
          <button onClick={handleEditExpense} className="bg-blue-500 text-white px-4 py-2">Update</button>
        ) : (
          <button onClick={handleAddExpense} className="bg-green-500 text-white px-4 py-2">Add</button>
        )}
      </div>

      {/* Expense List */}
      <ul className="border p-4">
        {expenses.map((expense) => (
          <li key={expense._id} className="flex justify-between items-center border-b p-2">
            <input
              type="checkbox"
              checked={selectedExpenses.includes(expense._id)}
              onChange={() => handleSelectExpense(expense._id)}
              className="mr-2"
            />
            <span>{expense.description} - ₹{expense.amount}</span>
            <div>
              <button onClick={() => handleEditClick(expense)} className="bg-yellow-500 text-white px-3 py-1 mr-2">Edit</button>
              <button onClick={() => handleDeleteExpense(expense._id)} className="bg-red-500 text-white px-3 py-1">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Delete Selected Button */}
      {selectedExpenses.length > 0 && (
        <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 mt-4">
          Delete Selected ({selectedExpenses.length})
        </button>
      )}

      {/* Logout Button */}
      <button onClick={handleLogout} className="bg-gray-700 text-white px-4 py-2 mt-4 ml-4">Logout</button>
    </div>
  );
};

export default Dashboard;
