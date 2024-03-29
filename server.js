const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const apiRoutes = require("./routes/api.js");

const PORT = process.env.PORT || 3003;


const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Budget_APP";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true
});

// routes
app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});