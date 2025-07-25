import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", deadline: "" });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", deadline: "" });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      loadTasks();
    }
  }, [token, navigate, loadTasks]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isPastDate = (date) => {
    const today = new Date().toISOString().split("T")[0];
    return date < today;
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline) return alert("All fields required");
    if (isPastDate(newTask.deadline)) return alert("Deadline cannot be in the past");

    await axios.post(`${BASE_URL}/tasks`, newTask, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Task added");
    setNewTask({ title: "", deadline: "" });
    loadTasks();
  };

  const startEdit = (task) => {
    setEditTaskId(task._id);
    setEditForm({ title: task.title, deadline: task.deadline });
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditForm({ title: "", deadline: "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.title || !editForm.deadline) return alert("All fields required");
    if (isPastDate(editForm.deadline)) return alert("Deadline cannot be in the past");

    try {
      await axios.put(`${BASE_URL}/tasks/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Task updated");
      setEditTaskId(null);
      loadTasks();
    } catch {
      alert("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    await axios.delete(`${BASE_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadTasks();
  };

 const toggleCompleted = async (task) => {
  await axios.put(`${BASE_URL}/tasks/${task._id}`, { completed: !task.completed }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  loadTasks();
};


  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={addTask}>
        <input
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="date"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: "20px" }}>
            {editTaskId === task._id ? (
              <>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                />
                <button onClick={() => saveEdit(task._id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <strong>{task.title}</strong> - {task.deadline}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button onClick={() => toggleCompleted(task)}>
  {task.completed ? "Completed" : "Mark as Completed"}
</button>

                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button onClick={() => deleteTask(task._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
