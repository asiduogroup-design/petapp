import crypto from "node:crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "petapp-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload) =>
  crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");

export const createAuthToken = (userId) => {
  const payload = JSON.stringify({
    userId,
    exp: Date.now() + TOKEN_TTL_MS,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature || "");
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.userId || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
