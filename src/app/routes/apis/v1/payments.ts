import { Router } from "express";

import { PaymentsController } from "../../../controllers/apis/v1/PaymentsController";


const app = Router();


app.post('/add-card', PaymentsController.addPaymentMethod)
app.post('/edit-card', PaymentsController.editCard)
app.post('/subscribe', PaymentsController.subscribe)
app.get('/payment-methods', PaymentsController.getPaymentMethods)




export default app;