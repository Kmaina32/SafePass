
const CHAR_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export function generatePassword(length = 16): string {
    const allChars = Object.values(CHAR_SETS).join('');
    let password = '';

    // Ensure at least one character from each set
    password += CHAR_SETS.lowercase[Math.floor(Math.random() * CHAR_SETS.lowercase.length)];
    password += CHAR_SETS.uppercase[Math.floor(Math.random() * CHAR_SETS.uppercase.length)];
    password += CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)];
    password += CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)];

    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize the character order
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}
