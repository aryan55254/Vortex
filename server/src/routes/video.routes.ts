import { Router } from "express";
import { getvideoinfo, handlefulldownload, handleTrimVideo } from "../controllers/video.controller"

const videorouter = Router();

videorouter.post('/info', getvideoinfo);
videorouter.post('/download', handlefulldownload);
videorouter.post('/trim', handleTrimVideo);

export default videorouter;
