
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(payload: object) {
  console.log(JWT_SECRET);
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}




