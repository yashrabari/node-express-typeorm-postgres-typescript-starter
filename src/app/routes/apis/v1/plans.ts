import { Router } from "express";

import { PlansController } from '../../../controllers/apis/v1/PlansController'


const app = Router();


app.get('/', PlansController.getPlans)
// app.post('/', PlansController.createPlan)




export default app;