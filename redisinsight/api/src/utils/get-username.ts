export const getUsername = (): string => (
  process.env.SUDO_USER ||
  process.env.C9_USER ||
  process.env.LOGNAME ||
  process.env.USER ||
  process.env.LNAME ||
  process.env.USERNAME ||
  ''
);
