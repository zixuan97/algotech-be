const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradesSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 3 },
    mark: { type: Number, required: true },
    alphabetGrade: { type: String, required: true },
  },
  { timestamps: true }
);

const Grade = mongoose.model("Grade", gradesSchema);

module.exports = Grade;
