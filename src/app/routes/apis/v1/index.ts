import { Router } from "express";

import plans from './plans'
import auth from './auth'



const app = Router();

app.use('/auth', auth)
app.use('/plans', plans)




export default app;