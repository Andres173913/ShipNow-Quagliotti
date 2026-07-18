import bcrypt from "bcrypt";

import { config } from "../config/config.js";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, parseInt(config.SALT_ROUNDS));
};

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}