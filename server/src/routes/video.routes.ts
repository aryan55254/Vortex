import { Router } from "express";
import { getvideoinfo } from "../controllers/video.controller"

const videorouter = Router();

videorouter.post('/info', getvideoinfo);

export default videorouter;
