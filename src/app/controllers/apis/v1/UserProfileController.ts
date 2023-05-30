import { Response } from 'express';
import { Request } from '../../../../utils/@types';
import { AppDataSource } from '../../../../config';
import { UserProfile } from '../../../models/userProfile';


const userProfile = AppDataSource.getRepository(UserProfile)



export const UserProfileController = {
    getProfile: async (req: Request, res: Response) => {
        const profileRecord = await userProfile.createQueryBuilder("userProfile").innerJoin("userProfile.userAuth", "UserAuth").where("userProfile.userAuth = :id", { id: req.user }).getOne();
        if (!profileRecord) {
            return res.status(404).send({ message: 'Profile not found' })
        }
        const profile = await userProfile.findOne({
            where: { id: profileRecord.id },
            relations: ['userAuth', 'sub', 'sub.plan'],
            select: {
                userAuth: {
                    id: true,
                    email: true,
                    mobile: true,
                }
            },
        })
        if (!profile) {
            return res.status(404).send({ message: 'Profile not found' })
        }
        return res.json({ success: true, profile }).status(200)
    }
}