/// <reference types="node" />
import { defineConfig } from "prisma/config";

// In Docker, DATABASE_URL is injected directly as an env var by docker-compose.
// dotenv/config is only needed for local development outside Docker.
if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});