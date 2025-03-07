import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
function verifyResetPasswordToken(token:string, userInputCode:string){
    const secretKey: string = process.env.AUTH_SECRETKEY as unknown as string;
    try {
        const payload = jwt.verify(token, secretKey) as JwtPayload;
        const code = payload.code as string;
        return code === userInputCode;
    } catch (error) {
        console.error('Error in token verification: ', error);
        return false;
    }
}


export async function POST(req: NextRequest){
    try {
        const { resetCode, inputCode } = await req.json();
        if(verifyResetPasswordToken(resetCode, inputCode)){
            return NextResponse.json({message: "Valid Code"}, {status: 200});
        } else {
            return NextResponse.json({message: "Invalid or expired code"}, {status: 400});
        }
    } catch (error) {
        return NextResponse.json({message: error}, {status: 400});
    }
}