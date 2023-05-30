import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AppDataSource, twilio } from '../../../../config';
import { UserAuth } from '../../../models/usersAuth';
import bcrypt from 'bcrypt';
import generateOTP from "../../../../utils/generateOtp"
import generateHashedPassword from "../../../../utils/generateHashedPassword"
import { transporter, stripe } from '../../../../config';
import axios from 'axios'
import { Admin } from '../../../models/admin';
import { UserProfile } from '../../../models/userProfile';
import Plan from '../../../models/plans';
import { Subscription } from '../../../models/subscription';


const usersAuth = AppDataSource.getRepository(UserAuth)
const adminAuth = AppDataSource.getRepository(Admin)
const plansRepo = AppDataSource.getRepository(Plan)
const userProfile = AppDataSource.getRepository(UserProfile)
const SubscriptionRepo = AppDataSource.getRepository(Subscription)



export const UserAuthController = {
    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await usersAuth.findOne({ where: { email } })
            if (!user) {
                return res.json({ success: false, msg: "User not found" }).status(400)
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return res.json({ success: false, msg: "Invalid password" }).status(400)
            }

            //cehck if user hase activated 2fa
            if (!user.is2FA) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || '');
                return res.json({ success: true, msg: "Logged in successfully", token }).status(200)
            }

            //send otp to user
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
            return res.json({ success: true, msg: "OTP sent successfully", is2FA: true }).status(200)
        } catch (error) {
            return res.json({ success: false, msg: "Error logging in" }).status(400)
        }
    },
    register: async (req: Request, res: Response) => {
        try {
            const { email, password, mobile, provider } = req.body;
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
                var newUser = await usersAuth.save(newUser)
                console.log(newUser)


                const mailOptions = {
                    from: 'Store And Share Vault',
                    to: email,
                    subject: 'Welcome Email',
                    html: `<p>${email.split('@')[0]}</p>
                <p>Welcome to Store &amp; Share Vault, your central location for managing and sharing important files, documents and photos with loved ones. Let others know you care about them by adding them as a Buddy and sharing this information with them in a closed network. Find comfort in the fact that you and your loved ones will never have to frantically search for important information ever again!</p>
                <p>Feel free to reach out to our Customer Support Team at anytime with questions, comments or concerns. Info@StoreAndShareVault.io</p>`,
                };
                transporter.sendMail(mailOptions, async function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                var plan = await plansRepo.findOne({ where: { title: 'Freemium' } })
                if (!plan) {
                    return res.json({ success: false, msg: "Plan not found" }).status(400)
                }

                //create stripe customer
                const stripeUser = await stripe.customers.create({
                    email,
                    name: email.split('@')[0],
                    phone: mobile
                })




                //create user profile
                var newProfile = new UserProfile();
                newProfile.userAuth = newUser;
                newProfile.stripeCustomer = stripeUser.id;
                newProfile.storage = plan.storage;
                newProfile.storageLeft = plan.storage;
                try {
                    var up = await userProfile.save(newProfile)

                    //create subscription
                    var sub = new Subscription();
                    sub.user = up;
                    sub.plan = plan;
                    sub.startDate = new Date();
                    sub.endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                    sub.status = 'active';

                    try {
                        await SubscriptionRepo.save(sub)
                    }
                    catch (error) {
                        return res.json({ success: false, msg: "Error saving subscription" }).status(400)
                    }
                }
                catch (error) {
                    return res.json({ success: false, msg: "Error saving user profile" }).status(400)
                }
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
    },
    changePassword: async (req: Request, res: Response) => {
        try {

            const { email, password, otp } = req.body;
            const user = await usersAuth.findOne({ where: { email } })
            if (!user) {
                return res.json({ success: false, msg: "User not found" }).status(400)
            }
            if (user.otp != otp) {
                return res.json({ success: false, msg: "Invalid OTP" }).status(400)
            }
            user.otp = '';
            user.password = generateHashedPassword(password);
            try {
                await usersAuth.save(user)
            }
            catch (error) {
                return res.json({ success: false, msg: "Error saving user" }).status(400)
            }
            return res.json({ success: true, msg: "Password changed successfully" }).status(200)

        } catch (error) {
            return res.json({ success: false, msg: "Error changing password" }).status(400)
        }
    },


    //admin auth controrllers
    adminLogin: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const admin = await adminAuth.findOne({ where: { email } })
            if (!admin) {
                return res.json({ success: false, msg: "Admin not found" }).status(400)
            }
            if (!bcrypt.compareSync(password, admin.password)) {
                return res.json({ success: false, msg: "Invalid password" }).status(400)
            }
            const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || '');
            return res.json({ success: true, msg: "Logged in successfully", token }).status(200)
        } catch (error) {
            return res.json({ success: false, msg: "Error logging in" }).status(400)
        }
    },
    adminRegister: async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;
            const admin = await adminAuth.findOne({ where: { email } })
            if (admin) {
                return res.json({ success: false, msg: "Admin already exists" }).status(400)
            }
            var newAdmin = new Admin();
            newAdmin.email = email;
            newAdmin.name = name;
            newAdmin.password = generateHashedPassword(password);
            newAdmin.role = 'admin';
            try {
                await adminAuth.save(newAdmin)
            } catch (error) {
                return res.json({ success: false, msg: "Error saving admin" }).status(400)
            }
            var token = jwt.sign({ id: newAdmin.id }, process.env.JWT_SECRET || '');
            return res.json({ success: true, msg: "Admin registered successfully", token }).status(201)
        }
        catch (error) {
            return res.json({ success: false, msg: "Error registering admin" }).status(400)
        }

    }
}