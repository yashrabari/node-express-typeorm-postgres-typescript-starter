import { Router } from "express";
import { FilesController } from "../../../controllers/apis/v1/FilesController";



const app = Router();


app.get('/', FilesController.getFiles)




export default app;