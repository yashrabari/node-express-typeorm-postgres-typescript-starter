import { Response } from 'express';
import { Request } from '../../../../utils/@types';
import { AppDataSource } from '../../../../config';


export const FilesController = {
    getFiles: async (req: Request, res: Response) => {



        return res.json({ success: true, message: 'Files' }).status(200)
    },


}
