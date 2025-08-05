import { Router } from "express";
import { ControllerImage } from "../controller/image.js";
import { uploadImage } from "../../../middlewares/image/upload_image.js";

export const routerImage = Router();

routerImage.post("/", uploadImage.single("image"), ControllerImage.createImage);
routerImage.get("/", ControllerImage.getAllImages);
routerImage.get("/:id", ControllerImage.getImageById);
routerImage.put("/:id", uploadImage.single("image"), ControllerImage.updateImage);
routerImage.delete("/:id", ControllerImage.deleteImage);
