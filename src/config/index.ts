import { DataSource } from 'typeorm';
import client from 'twilio';
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import multer from 'multer';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    port: 5432,
    entities: ["src/app/models/*{.ts,.js}"],
    synchronize: true,
    logging: true
})

const twilio = client(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_STORAGE_REGION
});

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
}));


const uploadFile = multer({
    storage: multer.memoryStorage(),
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY);

export {
    AppDataSource,
    twilio,
    s3,
    transporter,
    uploadFile,
    stripe
}