import bcrypt from 'bcrypt';

function generateHashedPassword(password: string) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword
}

export default generateHashedPassword;