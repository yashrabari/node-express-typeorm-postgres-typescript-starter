import { Router } from "express";

import { UserProfileController } from '../../../controllers/apis/v1/UserProfileController'


const app = Router();

app.get('/', UserProfileController.getProfile)



export default app;