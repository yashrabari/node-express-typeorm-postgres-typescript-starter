import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AppDataSource, twilio } from '../../../../config';
import { UserAuth } from '../../../models/usersAuth';
import bcrypt from 'bcrypt';
import generateOTP from "../../../../utils/generateOtp"
import generateHashedPassword from "../../../../utils/generateHashedPassword"
import { transporter } from '../../../../config';
import axios from 'axios'

const usersAuth = AppDataSource.getRepository(UserAuth)



export const UserAuthController = {
    login: async (req: Request, res: Response) => {
        return res.json({ success: true, msg: "hello world" }).status(200)
    },
    register: async (req: Request, res: Response) => {
        try {
            const { email, password, mobile } = req.body;
            const user = await usersAuth.findOne({ where: { email } })
            if (user) {
                return res.json({ success: false, msg: "User already exists" }).status(400)
            }
            var otp = generateOTP();
            const msg = `${otp} is your OTP for registration on ${process.env.APP_NAME}`
            try {
                await twilio.messages.create({
                    body: msg,
                    from: process.env.TWILIO_PHONE,
                    to: mobile
                })
            } catch (error) {
                return res.json({ success: false, msg: "Error sending OTP" }).status(400)
            }
            var newUser = new UserAuth();
            newUser.email = email;
            newUser.password = generateHashedPassword(password);
            newUser.mobile = mobile;
            newUser.otp = otp
            try {
                await usersAuth.save(newUser)
            } catch (error) {
                return res.json({ success: false, msg: "Error saving user" }).status(400)
            }
            return res.json({ success: true, msg: "User registered successfully" }).status(201)
        }
        catch (error) {
            return res.json({ success: false, msg: "Error registering user" }).status(400)
        }
    },
    verifyOtp: async (req: Request, res: Response) => {

        try {
            const { mobile, otp } = req.body;

            const user = await usersAuth.findOne({ where: { mobile } })
            if (!user) {
                return res.json({ success: false, msg: "User not found" }).status(400)
            }
            if (user.otp != otp) {
                return res.json({ success: false, msg: "Invalid OTP" }).status(400)
            }
            user.otp = '';
            try {
                await usersAuth.save(user)
            }
            catch (error) {
                return res.json({ success: false, msg: "Error saving user" }).status(400)
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || '');
            return res.json({ success: true, msg: "OTP verified successfully", token }).status(200)
        }
        catch (error) {
            return res.json({ success: false, msg: "Error verifying OTP" }).status(400)
        }

    },
    resendOtp: async (req: Request, res: Response) => {

        try {
            const { mobile } = req.body;
            const user = await usersAuth.findOne({ where: { mobile } })
            if (!user) {
                return res.json({ success: false, msg: "User not found" }).status(400)
            }
            var otp = generateOTP();
            const msg = `${otp} is your OTP for ${process.env.APP_NAME}`
            try {
                await twilio.messages.create({
                    body: msg,
                    from: process.env.TWILIO_PHONE,
                    to: mobile
                })
            }
            catch (error) {
                return res.json({ success: false, msg: "Error sending OTP" }).status(400)
            }
            user.otp = otp;
            try {
                await usersAuth.save(user)
            }
            catch (error) {
                return res.json({ success: false, msg: "Error saving user" }).status(400)
            }
            return res.json({ success: true, msg: "OTP sent successfully" }).status(200)
        } catch (error) {
            return res.json({ success: false, msg: "Error sending OTP" }).status(400)
        }
    },
    forgotPassword: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await usersAuth.findOne({ where: { email } })
            if (!user) {
                return res.json({ success: false, msg: "User not found" }).status(400)
            }
            var otp = generateOTP();
            const msg = `${otp} is your OTP for ${process.env.APP_NAME}`
            try {
                await twilio.messages.create({
                    body: msg,
                    from: process.env.TWILIO_PHONE,
                    to: user.mobile
                })
            }
            catch (error) {
                return res.json({ success: false, msg: "Error sending OTP" }).status(400)
            }
            user.otp = otp;
            try {
                await usersAuth.save(user)
            }
            catch (error) {
                return res.json({ success: false, msg: "Error saving user" }).status(400)
            }
            return res.json({ success: true, msg: "OTP sent successfully" }).status(200)
        } catch (error) {
            return res.json({ success: false, msg: "Error sending OTP" }).status(400)
        }
    }
}
