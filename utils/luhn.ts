
/**
 * PEDAGOGICAL NOTE:
 * The Luhn algorithm is a standard checksum formula used to validate 
 * various identification numbers, such as credit card numbers.
 * In a phishing simulation, requiring a valid Luhn sequence adds 'credibility' 
 * to the fake interface, as real card numbers would be validated.
 */

export const validateLuhn = (cardNumber: string): boolean => {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
};
