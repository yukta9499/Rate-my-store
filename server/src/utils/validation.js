export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(pw) {
  // 8-16 chars, at least one uppercase and one special char
  const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>,.?/]).{8,16}$/;
  return re.test(pw);
}

export function validateName(name) {
  return typeof name === 'string' && name.length >= 20 && name.length <= 60;
}

export function validateAddress(address) {
  return typeof address === 'string' && address.length <= 400;
}
