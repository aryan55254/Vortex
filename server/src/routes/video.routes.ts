import { Router } from "express";
import { getvideoinfo, handlefulldownload } from "../controllers/video.controller"

const videorouter = Router();

videorouter.post('/info', getvideoinfo);
videorouter.post('/download', handlefulldownload);

export default videorouter;
