import React, { useEffect, useState } from "react";
import { TextField, InputAdornment, MenuItem, Button } from "@mui/material";

//backend url to fetch requests and responses from server
const apiUrl = "http://localhost:5000";

export default function App() {
  //Form state to collect donor's input
  const [form, setForm] = useState({
    donor_name: "",
    type: "Amount",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  //donations state that reflects database 
  const [donations, setDonations] = useState([]);
  //Restores id if the donation is edited
  const [editingId, setEditingId] = useState(null);

  //Funtion that fetches all donations from database and displays it with state that gets updated whenever there is an update
  async function fetchDonations() {
    try {
      const res = await fetch(`${apiUrl}/api/donations`);
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error("Failed to fetch donations", err);
    }
  }

  //fetch donations 
  useEffect(() => {
    fetchDonations();
  }, []);

  //Updates the form state whenever there is changes in donor's input
  function onUpdate(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  //Function 
  async function onSubmit(e) {
    e.preventDefault();

    if (!form.donor_name.trim()) return alert("Donor name required");
    if (!form.type) return alert("Type required");
    if (isNaN(Number(form.amount))) return alert("Amount/Quantity must be a number");
    if (!form.date || isNaN(Date.parse(form.date))) return alert("Valid date required");

    const payload = {
      donor_name: form.donor_name,
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${apiUrl}/api/donations/${editingId}` : `${apiUrl}/api/donations`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Operation failed");
      }

      await fetchDonations();
      setForm({ donor_name: "", type: "money", amount: "", date: new Date().toISOString().slice(0, 10) });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  }

  async function startEdit(id) {
    try {
      const res = await fetch(`${apiUrl}/api/donations`);
      const list = await res.json();
      const record = list.find((d) => d._id === id);
      if (!record) return alert("Donation not found");

      setForm({
        donor_name: record.donor_name,
        type: record.type,
        amount: String(record.amount),
        date: record.date.slice(0, 10),
      });
      setEditingId(id);
    } catch (err) {
      console.error(err);
      alert("Failed to start edit");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this donation?")) return;

    try {
      const res = await fetch(`${apiUrl}/api/donations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      await fetchDonations();
    } catch (err) {
      console.error(err);
      alert("Failed to delete donation: " + err.message);
    }
  }

  return (
    <div className="container">
      <h1>Donation Inventory</h1>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2>{editingId ? "Edit Donation" : "Donate"}</h2>

        <TextField
          label="Donor Name"
          name="donor_name"
          value={form.donor_name}
          onChange={onUpdate}
          required
          fullWidth
        />

        <TextField
          select
          label="Type"
          name="type"
          value={form.type}
          onChange={onUpdate}
          fullWidth
        >
          <MenuItem value="money">Money</MenuItem>
          <MenuItem value="food">Food</MenuItem>
          <MenuItem value="clothing">Clothing</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>

        <TextField
          label="Amount / Quantity"
          name="amount"
          type="number"
          value={form.amount}
          onChange={onUpdate}
          InputProps={{
            startAdornment: form.type === "money" ? <InputAdornment position="start">$</InputAdornment> : null,
          }}
          helperText={form.type === "money" && Number(form.amount) > 1000 ? "You're so generous!" : ""}
          fullWidth
        />

        <TextField
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={onUpdate}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit" variant="contained" color="primary">
            {editingId ? "Save" : "Add Donation"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                setEditingId(null) ||
                setForm({ donor_name: "", type: "money", amount: "", date: new Date().toISOString().slice(0, 10) })
              }
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <section className="list" style={{ marginTop: 32 }}>
        <h2>Donations</h2>
        <Button onClick={fetchDonations} variant="outlined" style={{ marginBottom: 16 }}>
          Refresh List
        </Button>

        {donations.length === 0 ? (
          <p>No donations recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id}>
                  <td>{d.donor_name}</td>
                  <td>{d.type}</td>
                  <td>{d.amount}</td>
                  <td>{d.date.slice(0, 10)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                    <Button onClick={() => startEdit(d._id)} variant="outlined" size="small">
                      Edit
                    </Button>
                    <Button onClick={() => onDelete(d._id)} variant="outlined" size="small" color="error">
                      Delete
                    </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
