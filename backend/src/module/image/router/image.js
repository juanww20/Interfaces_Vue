import { Router } from "express";
import { ControllerImage } from "../controller/image.js";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from "../../../utils/global-path.js";

const __dirname = UPLOADS_DIR;

export const routerImage = Router();

// 1. Configuración de multer

const imageUploadPath = path.join(__dirname, 'uploads', 'images');

if (!fs.existsSync(imageUploadPath)) {
  fs.mkdirSync(imageUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


routerImage.post("/", upload.single("image"), ControllerImage.createImage);
routerImage.get("/", ControllerImage.getAllImages);
routerImage.get("/:id", ControllerImage.getImageById);
routerImage.put("/:id", upload.single("image"), ControllerImage.updateImage);
routerImage.delete("/:id", ControllerImage.deleteImage);
