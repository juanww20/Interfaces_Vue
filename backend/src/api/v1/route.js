import { routerColor } from "../../module/color/router/color.js";
import { routerFont } from "../../module/font/router/font.js";
import { routerAuth } from "../../module/auth/router/auth.js";
import { routerImage } from "../../module/image/router/image.js";
import { routerVideo } from "../../module/video/router/video.js";
import { routerAudio } from "../../module/audio/router/audio.js";
import { Router } from "express";

export const routerApi = Router();

routerApi.use('/color', routerColor);
routerApi.use('/font', routerFont);
routerApi.use('/auth', routerAuth);
routerApi.use('/image', routerImage);
routerApi.use('/video', routerVideo);
routerApi.use('/audio', routerAudio);
