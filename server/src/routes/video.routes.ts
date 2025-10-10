import { Router } from "express";
import { getvideoinfo, handlefulldownload, handleTrimVideo } from "../controllers/video.controller"
import { isAuthenticated } from "../middlewares/auth.middleware";

const videorouter = Router();

videorouter.post('/info', isAuthenticated, getvideoinfo);
videorouter.post('/download', isAuthenticated, handlefulldownload);
videorouter.post('/trim', isAuthenticated, handleTrimVideo);

export default videorouter;
