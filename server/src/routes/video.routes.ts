import { Router } from "express";
import { getvideoinfo } from "../controllers/video.controller"
import { isAuthenticated } from "../middlewares/auth.middleware";

const videorouter = Router();

videorouter.post('/info', isAuthenticated, getvideoinfo);

export default videorouter;
