import { Router } from "express";


import v1 from "./v1";


const app = Router();



app.use('/v1', v1)



export default app;