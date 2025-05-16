import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as ejs from "ejs";
import { join } from "path";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        try {

            let path = join(__dirname, "templates", "verification.ejs");
            const templatePath = path.replace("dist", "src");
            const html = await ejs.renderFile(templatePath, { token });

            path = join(__dirname, "templates", 'assets', 'download.webp');
            const logoPath = path.replace("dist", "src");


            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verificação de Email",
                text: `Clique no link para verificar seu email: http://localhost:3000/email/verify?token=${token}`,
                html,
                attachments: [
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: 'logo_cid'
                    }
                ]
            });

        } catch (error) {
            console.error("Error sending email: ", error);
            throw error;
        }
    }

    async sendRecoveryPasswordEmail(email: string, token: string) {
        try {


            let path = join(__dirname, "templates", "recovery-password.ejs");
            const templatePath = path.replace("dist", "src");
            const html = await ejs.renderFile(templatePath, { token });

            path = join(__dirname, "templates", 'assets', 'download.webp');
            const logoPath = path.replace("dist", "src");

            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Recuperação de Senha",
                text: `Clique no link para recuperar sua senha: http://localhost:3000/auth/recovery-password?token=${token}`,
                html,
                attachments: [{
                        filename: 'logo.png',
                        path: logoPath,
                        cid: 'logo_cid'
                    }]
            })
        } catch (error) {
            console.error("Error sending email: ", error);
            throw error;
        }
    }
}