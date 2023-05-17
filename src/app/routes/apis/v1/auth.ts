import { Router } from "express";

import { UserAuthController } from '../../../controllers/apis/v1/UserAuthController'


const app = Router();


app.post('/login', UserAuthController.login)
app.post('/register', UserAuthController.register)
app.post('/verify-otp', UserAuthController.verifyOtp)
app.post('/resend-otp', UserAuthController.resendOtp)
app.post('/forgot-password', UserAuthController.forgotPassword)




export default app;