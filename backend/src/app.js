// app.js
const express = require("express");
const app = express();
const auth = require("./interfaces/middlewares/authMiddleware");
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" })); 
 
// const subjectRoutes = require("./interfaces/routes/subjectRoutes");    
// const chapterRoutes = require("./interfaces/routes/chapterRoutes");    
// const questionRoutes = require("./interfaces/routes/questionRoutes");  
// const optionRoutes = require("./interfaces/routes/optionRoutes");  
// const attemptRoutes = require("./interfaces/routes/attemptRoutes");  
// const answerRoutes = require("./interfaces/routes/answerRoutes");  
// const resultSummaryRoutes = require("./interfaces/routes/interfaces/resultSummaryRoutes");  
// const attemptQuestionRoutes = require("./interfaces/routes/attemptQuestionRoutes");    

// app.use("/api/attempt-questions",auth, attemptQuestionRoutes);
// app.use("/api/resultsummary",auth, resultSummaryRoutes);
// app.use("/api/answers",auth, answerRoutes);
// app.use("/api/attempts",auth, attemptRoutes);
// app.use("/api/options",auth, optionRoutes);
// app.use("/api/questions",auth, questionRoutes);
// app.use("/api/chapters",auth, chapterRoutes);
// app.use("/api/subjects",auth, subjectRoutes);
app.use("/api", require("./interfaces/routes"));



app.get("/", (req, res) => res.send("API running 🚀"));
module.exports = app;
