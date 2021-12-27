import express from "express";
import bootstrap from "./bootstrap";

const app = express();

// load the bootstrap program
bootstrap().then();

export default app;