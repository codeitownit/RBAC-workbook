/// <reference types="node" />
import { defineConfig } from "prisma/config";

// dotenv only needed locally — in production DATABASE_URL is injected by the platform
try {
  const dotenv = await import("dotenv");
  dotenv.config();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});