import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import worksheetsRouter from "./routes/worksheets";
import questionsRouter from "./routes/questions";
import answersRouter from "./routes/answers";
import gradesRouter from "./routes/grades";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",       authRouter);
app.use("/api/worksheets", worksheetsRouter);
app.use("/api/questions",  questionsRouter);
app.use("/api/answers",    answersRouter);
app.use("/api/grades",     gradesRouter);

app.listen(4000, () => console.log("Server running on http://localhost:4000"));