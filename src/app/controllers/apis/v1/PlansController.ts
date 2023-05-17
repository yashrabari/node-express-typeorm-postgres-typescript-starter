import { Response, Request } from 'express';



export const PlansController = {
    getPlans: async (req: Request, res: Response) => {
        return res.json({ success: true, msg: "hello world" }).status(200)
    }
}
