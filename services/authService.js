import * as usersRepository from "../repositories/usersRepository.js";
import * as userDTO from "../dtos/userDto.js";
import * as bcrypt from "bcrypt"

export async function signUp(body = {}) {
    const { username, password } = body;
    
    if ((typeof username) !== "string") {
        const err = new Error('Username is required');
        err.status = 400;
        throw err;
    }

    if ((typeof password) !== "string") {
        const err = new Error('Password is required');
        err.status = 400;
        throw err;
    }

    if (username.trim().length < 3) {
        const err = new Error('Username is too short');
        err.status = 400;
        throw err;
    }

    if (password.length < 8) {
        const err = new Error('Password is too short');
        err.status = 400;
        throw err;
    }

    const userDuplicate = await usersRepository.findByUsername(username);
    if (userDuplicate) {
        const err = new Error('Username already taken');
        err.status = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await usersRepository.createUser(username, hashedPassword);

    return userDTO.userInfo(newUser);


}

