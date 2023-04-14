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
import {
  ensureDevInBodyExists,
  ensureProjectExists,
} from "./middlewares/projects.middlewares";
import {
  createProject,
  deleteProject,
  postTechnology,
  retrieveProject,
  updateProject,
} from "./logics/projects.logics";

const app: Application = express();
app.use(express.json());

app.post("/developers", ensureEmailExists, createDev);
app.get("/developers/:id", ensureDevExists, retrieveDev);
app.patch("/developers/:id", ensureDevExists, ensureEmailExists, updateDev);
app.delete("/developers/:id", ensureDevExists, deleteDev);
app.post("/developers/:id/infos", ensureDevExists, setInfo);

app.post("/projects", ensureDevInBodyExists, createProject);
app.get("/projects/:id", ensureProjectExists, retrieveProject);
app.patch("/projects/:id", ensureProjectExists, updateProject);
app.delete("/projects/:id", ensureProjectExists, deleteProject);

app.post("/projects/:id/technologies", ensureProjectExists, postTechnology);
app.delete("/projects/:id/technologies/:name", ensureProjectExists);

export default app;
