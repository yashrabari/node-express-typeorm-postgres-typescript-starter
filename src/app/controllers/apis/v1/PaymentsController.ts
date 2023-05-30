import { Response } from 'express';
import { Request } from '../../../../utils/@types';

import { AppDataSource, stripe } from '../../../../config';
import { UserProfile } from '../../../models/userProfile';
import { UserAuth } from '../../../models/usersAuth';



const userProfile = AppDataSource.getRepository(UserProfile)
const userAuth = AppDataSource.getRepository(UserAuth)


export const PaymentsController = {
    addPaymentMethod: async (req: Request, res: Response) => {

        const { type, number, cvv, exp, city, country, line1, line2, zip, state } = req.body

        const auth = await userAuth.findOne({ where: { id: req.user } })
        const profileRecord = await userProfile.createQueryBuilder("userProfile").innerJoin("userProfile.userAuth", "UserAuth").where("userProfile.userAuth = :id", { id: req.user }).getOne();
        if (!profileRecord) {
            return res.status(404).send({ message: 'Profile not found' })
        }

        try {

            var card = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: number,
                    exp_month: exp.split('/')[0],
                    exp_year: exp.split('/')[1],
                    cvc: cvv,
                },
                billing_details: {
                    address: {
                        city: city,
                        country: country,
                        line1: line1,
                        line2: line2,
                        postal_code: zip,
                        state: state,
                    },
                    email: auth?.email,
                    name: profileRecord.firstName + ' ' + profileRecord.lastName,
                    phone: auth?.mobile,
                },
            });

            //attech payment method to customer
            const customer = await stripe.customers.retrieve(
                profileRecord.stripeCustomer
            );

            const paymentMethod = await stripe.paymentMethods.attach(
                card.id,
                { customer: customer.id }
            );
            return res.json({ success: true, message: 'Payment method added successfully' }).status(200)
        } catch (e: any) {
            console.log(e)
            return res.status(500).send({ message: e.decline_code, code: e.code, success: false })
        }
    },
    getPaymentMethods: async (req: Request, res: Response) => {
        const profileRecord = await userProfile.createQueryBuilder("userProfile").innerJoin("userProfile.userAuth", "UserAuth").where("userProfile.userAuth = :id", { id: req.user }).getOne();
        if (!profileRecord) {
            return res.status(404).send({ message: 'Profile not found' })
        }
        const paymentMethods = await stripe.customers.listPaymentMethods(
            profileRecord.stripeCustomer,
            { type: 'card' }
        );


        return res.json({ success: true, data: paymentMethods.data }).status(200)
    },
    subscribe: async (req: Request, res: Response) => {
        const { price, paymentMethodId } = req.body
        const profileRecord = await userProfile.createQueryBuilder("userProfile").innerJoin("userProfile.userAuth", "UserAuth").where("userProfile.userAuth = :id", { id: req.user }).getOne();
        if (!profileRecord) {
            return res.status(404).send({ message: 'Profile not found' })
        }

        const subscription = await stripe.subscriptions.create({
            customer: profileRecord.stripeCustomer,
            items: [{ price: price },],
            expand: ['latest_invoice.payment_intent'],
            default_payment_method: req.body.paymentMethodId,
        });

        return res.json({ success: true, data: subscription }).status(200)
    },
    editCard: async (req: Request, res: Response) => {

        const { id, data } = req.body

        const profileRecord = await userProfile.createQueryBuilder("userProfile").innerJoin("userProfile.userAuth", "UserAuth").where("userProfile.userAuth = :id", { id: req.user }).getOne();
        if (!profileRecord) {
            return res.status(404).send({ message: 'Profile not found' })
        }
        try {
            var card = await stripe.paymentMethods.update(id, data);
            //attech payment method to customer
            const customer = await stripe.customers.retrieve(
                profileRecord.stripeCustomer
            );
            const paymentMethod = await stripe.paymentMethods.attach(
                card.id,
                { customer: customer.id }
            );
            return res.json({ success: true, message: 'Payment method updated successfully' }).status(200)
        } catch (e: any) {
            console.log(e)
            return res.status(500).send({ message: e.decline_code, code: e.code, success: false })
        }
    },
}
