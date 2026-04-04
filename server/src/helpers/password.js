import crypto from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });

export const verifyPassword = (password, storedHash) =>
  new Promise((resolve, reject) => {
    const [salt, originalHash] = String(storedHash || "").split(":");
    if (!salt || !originalHash) {
      resolve(false);
      return;
    }

    crypto.scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      const originalBuffer = Buffer.from(originalHash, "hex");
      const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");

      if (originalBuffer.length !== derivedBuffer.length) {
        resolve(false);
        return;
      }

      resolve(crypto.timingSafeEqual(originalBuffer, derivedBuffer));
    });
  });
