import { Router } from "express";
import { getvideoinfo, handleTrimVideo } from "../controllers/video.controller"
import { isAuthenticated } from "../middlewares/auth.middleware";

const videorouter = Router();

videorouter.post('/info', isAuthenticated, getvideoinfo);
videorouter.post('/trim', isAuthenticated, handleTrimVideo);

export default videorouter;
