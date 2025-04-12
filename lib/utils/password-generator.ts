/**
 * Generates a secure random password with specified length and character types
 * @param length The length of the password (default: 12)
 * @param includeUppercase Include uppercase letters (default: true)
 * @param includeLowercase Include lowercase letters (default: true)
 * @param includeNumbers Include numbers (default: true)
 * @param includeSpecial Include special characters (default: true)
 * @returns A randomly generated password
 */
export function generateSecurePassword(
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSpecial = true,
): string {
  // Define character sets
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?"

  // Create the character pool based on options
  let charPool = ""
  if (includeUppercase) charPool += uppercaseChars
  if (includeLowercase) charPool += lowercaseChars
  if (includeNumbers) charPool += numberChars
  if (includeSpecial) charPool += specialChars

  // Ensure at least one character set is selected
  if (charPool.length === 0) {
    charPool = lowercaseChars + numberChars
  }

  // Generate the password
  let password = ""

  // Ensure at least one character from each selected type
  if (includeUppercase) {
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
  }
  if (includeLowercase) {
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  }
  if (includeNumbers) {
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
  }
  if (includeSpecial) {
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  }

  // Fill the rest of the password
  const remainingLength = length - password.length
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length)
    password += charPool.charAt(randomIndex)
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleString(password)
}

/**
 * Shuffles a string randomly
 * @param str The string to shuffle
 * @returns The shuffled string
 */
function shuffleString(str: string): string {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}
