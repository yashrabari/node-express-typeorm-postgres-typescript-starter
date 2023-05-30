import { Router } from "express";

import plans from './plans'
import auth from './auth'
import profile from './profile'
import payments from './payments'
import files from './files'
import { authenticateUser } from "../../../../middlewares/verifyUsers";



const app = Router();

app.use('/auth', auth)
app.use('/plans', plans)
app.use('/profile', authenticateUser, profile)
app.use('/payments', authenticateUser, payments)
app.use('/files', authenticateUser, files)




export default app;