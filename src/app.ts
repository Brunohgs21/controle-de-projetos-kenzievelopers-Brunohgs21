import express, { Application } from "express";
import "dotenv/config";
import {
  ensureDevExists,
  ensureEmailExists,
} from "./middlewares/developers.middlewares";
import {
  createDev,
  deleteDev,
  retrieveDev,
  setInfo,
  updateDev,
} from "./logics/developers.logics";

const app: Application = express();
app.use(express.json());

app.post("/developers", ensureEmailExists, createDev);

app.get("/developers/:id", ensureDevExists, retrieveDev);

app.patch("/developers/:id", ensureDevExists, ensureEmailExists, updateDev);

app.delete("/developers/:id", ensureDevExists, deleteDev);

app.post("/developers/:id/infos", ensureDevExists, setInfo);

export default app;
