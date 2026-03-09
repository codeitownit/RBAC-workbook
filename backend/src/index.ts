import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { execSync } from "child_process";
import authRouter from "./routes/auth";
import worksheetsRouter from "./routes/worksheets";
import questionsRouter from "./routes/questions";
import answersRouter from "./routes/answers";
import gradesRouter from "./routes/grades";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/(.*)", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",       authRouter);
app.use("/api/worksheets", worksheetsRouter);
app.use("/api/questions",  questionsRouter);
app.use("/api/answers",    answersRouter);
app.use("/api/grades",     gradesRouter);

// Run migrations before starting the server
try {
  console.log("Running database migrations...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
  console.log("Migrations complete.");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}

app.listen(4000, () => console.log("Server running on http://localhost:4000"));