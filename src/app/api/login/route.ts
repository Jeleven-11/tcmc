import { NextResponse } from 'next/server';
import { query, } from '@/app/lib/db';
import { FieldPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
interface User {
    id: string
    username: string;
    name?: string;
    role?: string;
    contact_num?: string;
    password: string;
    user_id?: string;
    emailVerified?: boolean
}
function generateAuthToken(userData:User, remember:boolean=false) {
  const secretKey = process.env.AUTH_SECRETKEY;
  
  // Check if the AUTH_SECRETKEY environment variable is set
  if (!secretKey) {
    throw new Error('AUTH_SECRETKEY environment variable is not set');
  }
  
  // Extract relevant user data to include in the JWT payload
  const { id, username, name, role, contact_num, password, user_id }: User = userData;

  // Define the payload to be included in the token
  const payload = {
    id,
    username,
    name,
    role,
    contact_num,
    password,
    user_id
  };
  function getExpiryInSeconds(expiry: string): number {
    const num = parseInt(expiry.slice(0, -1), 10);
    const unit = expiry.slice(-1);
    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 60 * 60;
      case 'd':
        return num * 60 * 60 * 24;
      default:
        throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }
  let tokenExpiry = '2d';
  if (remember){
      tokenExpiry = '14d';
  }
  const expiryInSeconds = getExpiryInSeconds(tokenExpiry);
  const secretKeyBuffer = Buffer.from(secretKey, 'utf8');
  // Generate the token with the specified payload and secret key
  const token = jwt.sign(payload, secretKeyBuffer, { expiresIn: expiryInSeconds });
  console.log(`Generated a token that expires in ${tokenExpiry}`);
  return token;
}
export async function POST(req: Request){
  if (req.method === "POST"){
    try{
        const { inp, password } = await req.json()
        if (!inp || !password)
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })

        const column = (inp.length > 0) && inp.startsWith('0') ? 'contact_num' : 'username'
        const qStr = `SELECT * FROM users WHERE ${column} = ? LIMIT 1`

        const queryValues = [inp || "", password || ""].filter(Boolean)
        const rows: [User, FieldPacket[]] = await query(qStr, queryValues) as [User, FieldPacket[]]
        if (!rows || !rows[0])
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })

        //const data = JSON.parse(JSON.stringify(rows[0])) as User
        const data = rows[0]
        const isPassValid = await bcrypt.compare(password, data.password)
        if (!isPassValid)
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })

        const userData = {
            id: data.id,
            username: data.username,
            name: data.name,
            role: data.role,
            contactNum: data.contact_num,
            password: '',//do not include the password
            user_id: data.user_id
        }
        const authToken = generateAuthToken(userData, true)
        const response = NextResponse.json({ message: "Login successful", token: authToken }, { status: 200 })
    
        // set Kokey
        // const response = NextResponse.json({ message: "Login successful"}, { status: 200 })
        response.cookies.set("currentUser", JSON.stringify(authToken),{
            httpOnly: true, // true ni kay para di ma access or ma read through console, or ma manipulate ang kokeyy sa client side
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            maxAge: 60 * 60 * 24 * 7, // 1 week expiration (sec, min, hr, day)
            path: "/admin", // cookie accessible on all routes
        })

        // add csrf for more secure tinapa
        // add add encrypted token to the cookie

        return response
    } catch (error) {
        console.error('Database Error:', error)
        return NextResponse.json({ message: 'An error occurred while connecting to the satellite...' }, { status: 500 })
    }
  } else return NextResponse.json({ message: 'Invalid request method' }, { status: 405 })
}