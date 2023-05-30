import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from '../utils/@types';


// Define a middleware function that verifies the JWT token and adds the user information to the request
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Get the JWT token from the request headers
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    try {
        // Verify the JWT token and extract the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
        // Add the user information to the request object
        req.user = decoded.id;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid JWT token' });
    }
};
