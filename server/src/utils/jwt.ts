import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode("secret");

export const createToken = async (id: string) => {
  const token = await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return token;
};

export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload;
};
