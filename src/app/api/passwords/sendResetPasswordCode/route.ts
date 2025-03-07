import { NextRequest, NextResponse } from 'next/server';
import sendMail from '@/app/lib/mailer';
import jwt from 'jsonwebtoken';
function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateResetPasswordToken(code:string){
    const secretKey:string = process.env.AUTH_SECRETKEY as unknown as string;
    
    const payload = {
        code
    };
    const tokenExpiry = '15m';
    const token = jwt.sign(payload, secretKey, { expiresIn: tokenExpiry });
    return token;
}
export async function POST(req: NextRequest){
    try {
        const { email } = await req.json();
        const code:string = generateSixDigitCode();
        const resetToken = generateResetPasswordToken(code);
        const message = {
            from: process.env.WEB_APP_EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text: `Use the code below to reset your password: ${code}`,
            html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px;">
                <p>Dear user,</p>
                <p>We received a request to reset your password. Use the code below to reset your password:</p>
                <p style="font-size: 24px; font-weight: bold; color: #ff0000;">${code}</p>
                <p>This code is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
                <p>Thank you,</p>
                <p>TCMC</p>
            </div>`
        };
    
        const response = await sendMail(email, message.subject, message.text, message.html);
        if (response.success) {
            console.log('Password reset email sent successfully');
            return NextResponse.json({ token: resetToken }, { status: 200 });
        } else {
            console.error('Error sending email:', response.error);
            return NextResponse.json({ error: response.error }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing request', error);
        return NextResponse.json({error: error}, {status: 400});
    }
}