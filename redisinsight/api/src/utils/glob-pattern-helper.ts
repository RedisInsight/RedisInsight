const GLOB_SPEC_CHAR = ['!', '*', '?', '[', ']', '(', ')', '{', '}'];
const EXT_GLOB_SPEC_CHAR = ['@', '+'];

export const unescapeGlob = (value: string): string => {
  let result = value;

  [...GLOB_SPEC_CHAR, ...EXT_GLOB_SPEC_CHAR].forEach((char: string) => {
    const regex = new RegExp('\\'.repeat(3) + char, 'g');
    result = result.replace(regex, char);
  });

  return result.replace(/\\{2}/g, '\\');
};
