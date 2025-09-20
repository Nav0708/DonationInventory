const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./donationInventoryDB");
const Donation = require("./models/Donation");

//configuring .env file that as connection urls for mongodb server and localhostserver
dotenv.config();
//Connection to mongodb server
connectDB();

//starting the backend server
const app = express();
//for cross origin resource sharing - serves the connection request from frontend to backend which uses different ports
app.use(cors());

//to parse json body
app.use(express.json());

//Read - api to fetch donations made so far
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Create - api that adds new donations to the database
app.post("/api/donations", async (req, res) => {
  const { donor_name, type, amount } = req.body;
  try {
    const donation = new Donation({ donor_name, type, amount });
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/donations/:id", async (req, res) => {
  const { id } = req.params;
  const { donor_name, type, amount } = req.body;

  try {
    const donation = await Donation.findByIdAndUpdate(
      id,
      { donor_name, type, amount },
      { new: true, runValidators: true } // return updated doc, validate fields
    );

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/donations/:id", async (req, res) => {
  const { id } = req.params;
   try {
    const donation = await Donation.findByIdAndDelete(id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.json({ message: "Donation deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
