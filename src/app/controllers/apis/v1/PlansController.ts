import { Response, Request } from 'express';
import { AppDataSource } from '../../../../config';
import Plan from '../../../models/plans';

const plansRepo = AppDataSource.getRepository(Plan)

export const PlansController = {
    getPlans: async (req: Request, res: Response) => {
        try {
            var plans = await plansRepo.find({
                relations: ['prices']
            })
            return res.json({ success: true, plans }).status(200)
        } catch (err) {
            console.log(err)
            return res.json({ success: false, msg: "Something went wrong!" }).status(500)
        }
    },
    // createPlan: async (req: Request, res: Response) => {

    //     try {



    //     } catch (err) {
    //         return res.json({ success: false, msg: "Something went wrong!" }).status(500)
    //     }

    // }
}
