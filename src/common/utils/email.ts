import nodemailer from 'nodemailer'
import * as  dotenv from 'dotenv'
import { BadRequestException } from '@nestjs/common'
import { templates } from './email.templates'
dotenv.config()

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})


export type emailType = 'verification' | 'reset' | 'invite'

export async function sendEmail(type: emailType, to: string, url: string,tenantName?: string,inviterName?: string, role?: string) {
    let template: any
    if (type === 'invite') {
        if (!tenantName || !inviterName || !role) {
            throw new BadRequestException('Invite email requires tenantName, inviterName, and role');
        }
        template = templates.invite(url, tenantName, inviterName, role);
    } else {
        template = templates[type](url);
    }
    try {
    await transporter.sendMail({
        from: 'Helpdeskly platform',
        to,
        subject: template.subject,
        html: template.html
    })
}catch(err: any){
    throw new BadRequestException('Too many emails per second')
}
}