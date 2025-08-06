import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {sequelize} from "./config/dataBase.js";
import { enviroment } from "./config/enviroment.js";
import { routerApi } from "./api/v1/route.js";
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from './utils/global-path.js'; // Import global path variables

const __dirname = UPLOADS_DIR;

const app = express();

const PORT = enviroment.PORT;

// origenes permitidos para hacer peticiones
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:4200'
];

// middlewares
// Aumentar el límite de tamaño para las solicitudes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origin (como Postman o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/images', express.static(path.join(__dirname, 'uploads', 'images')));
app.use('/videos', express.static(path.join(__dirname, 'uploads', 'videos')));

app.get('/preview-image/:filename', (req, res) => {
  const { filename } = req.params;
  const fullPath = path.join(__dirname, 'uploads', 'images', filename);
  const fullPathVideos = path.join(__dirname, 'uploads', 'videos', filename);

  // Mostrar ruta absoluta y si existe el archivo
  console.log('📂 Ruta absoluta:', fullPath);
  console.log('📦 Existe imagen:', fs.existsSync(fullPath));
  console.log('📦 Existe video:', fs.existsSync(fullPathVideos));

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Vista previa de imagen</title>
    </head>
    <body>
      <h1>Imagen cargada:</h1>
      <img src="/images/${filename}" alt="Imagen subida" style="max-width: 400px; border: 1px solid #ccc;" />
      <p>Ruta: <code>/images/${filename}</code></p>
      <h2>Video cargado:</h2>
      <video controls style="max-width: 400px; border: 1px solid #ccc;">
        <source src="/videos/${filename}" type="video/mp4">
      </video>
    </body>
    </html>
  `;

  res.send(html);
});

// api
app.use('/api/v1/', routerApi);



async function main() {
    
    try {

        // establecemos conexion con la base de datos
        await sequelize.authenticate();
        /*
        await sequelize.query(`
          ALTER TABLE FontFamily 
          MODIFY COLUMN url_principal MEDIUMTEXT NOT NULL,
          MODIFY COLUMN url_secundary MEDIUMTEXT NOT NULL
        `);
        */
        await sequelize.sync({ alter: true });
        console.log("===================================================")
        console.log("✅ Conexion de la base de datos establecida")
        
        // establecemos conexion con el servidor
        app.listen(PORT, () => {
            console.log(`✅ Servidor escuchando en http://localhost:${PORT}`)
            console.log("===================================================")
        })

    } catch (error) {

        console.error("❌ Error al establecer conexion", error)
    }
}

main();