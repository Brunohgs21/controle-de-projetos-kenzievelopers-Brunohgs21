import express, { Application } from "express";
import "dotenv/config";

const app: Application = express();
app.use(express.json());

export default app;
