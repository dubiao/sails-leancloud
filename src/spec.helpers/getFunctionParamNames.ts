const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;
const SPACES = /\s/mg;
const BEFORE_OPENING_PAREN = /^[^(]*\(/mg;
const AFTER_CLOSING_PAREN = /^([^)]*)\).*$/mg;

export function getFunctionParamNames(fn: Function): string[] {
  const code = fn.toString()
                 .replace(SPACES, '')
                 .replace(COMMENTS, '')
                 .replace(FAT_ARROWS, '')
                 .replace(DEFAULT_PARAMS, '')
                 .replace(BEFORE_OPENING_PAREN, '')
                 .replace(AFTER_CLOSING_PAREN, '$1');

  return code ? code.split(',') : [];
}
