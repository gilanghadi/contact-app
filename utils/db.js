const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/learn", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
