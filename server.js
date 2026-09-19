import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("");
});

app.get("/Inventory", (req, res) => {
  res.send("This is the inventory of the lost and found.");
});

app.get("/found", (req, res) => {
  res.send("This is the found page.");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
