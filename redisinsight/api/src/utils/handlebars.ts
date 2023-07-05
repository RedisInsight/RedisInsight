export const hbsEq = (arg1, arg2, options) => (arg1 === arg2) ? options.fn(this) : options.inverse(this);
