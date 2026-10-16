import express, { type Express } from "express";
import authRoute from "@/routes/auth.route.js";


const app: Express = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/auth", authRoute);



app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "server is running" });
});

export default app;