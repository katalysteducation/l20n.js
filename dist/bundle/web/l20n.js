{

// See docs/compat.md for more information on providing polyfills which are
// required for l20n.js to work in legacy browsers.
//
// The following are simple fixes which aren't included in any of the popular
// polyfill libraries.

// IE, Safari and Opera don't support it yet
if (typeof navigator !== 'undefined' && navigator.languages === undefined) {
  navigator.languages = [navigator.language];
}

// iOS Safari doesn't even have the Intl object defined
if (typeof Intl === 'undefined') {
  window.Intl = {};
}

/*eslint no-magic-numbers: [0]*/

const locales2rules = {
  'af': 3,
  'ak': 4,
  'am': 4,
  'ar': 1,
  'asa': 3,
  'az': 0,
  'be': 11,
  'bem': 3,
  'bez': 3,
  'bg': 3,
  'bh': 4,
  'bm': 0,
  'bn': 3,
  'bo': 0,
  'br': 20,
  'brx': 3,
  'bs': 11,
  'ca': 3,
  'cgg': 3,
  'chr': 3,
  'cs': 12,
  'cy': 17,
  'da': 3,
  'de': 3,
  'dv': 3,
  'dz': 0,
  'ee': 3,
  'el': 3,
  'en': 3,
  'eo': 3,
  'es': 3,
  'et': 3,
  'eu': 3,
  'fa': 0,
  'ff': 5,
  'fi': 3,
  'fil': 4,
  'fo': 3,
  'fr': 5,
  'fur': 3,
  'fy': 3,
  'ga': 8,
  'gd': 24,
  'gl': 3,
  'gsw': 3,
  'gu': 3,
  'guw': 4,
  'gv': 23,
  'ha': 3,
  'haw': 3,
  'he': 2,
  'hi': 4,
  'hr': 11,
  'hu': 0,
  'id': 0,
  'ig': 0,
  'ii': 0,
  'is': 3,
  'it': 3,
  'iu': 7,
  'ja': 0,
  'jmc': 3,
  'jv': 0,
  'ka': 0,
  'kab': 5,
  'kaj': 3,
  'kcg': 3,
  'kde': 0,
  'kea': 0,
  'kk': 3,
  'kl': 3,
  'km': 0,
  'kn': 0,
  'ko': 0,
  'ksb': 3,
  'ksh': 21,
  'ku': 3,
  'kw': 7,
  'lag': 18,
  'lb': 3,
  'lg': 3,
  'ln': 4,
  'lo': 0,
  'lt': 10,
  'lv': 6,
  'mas': 3,
  'mg': 4,
  'mk': 16,
  'ml': 3,
  'mn': 3,
  'mo': 9,
  'mr': 3,
  'ms': 0,
  'mt': 15,
  'my': 0,
  'nah': 3,
  'naq': 7,
  'nb': 3,
  'nd': 3,
  'ne': 3,
  'nl': 3,
  'nn': 3,
  'no': 3,
  'nr': 3,
  'nso': 4,
  'ny': 3,
  'nyn': 3,
  'om': 3,
  'or': 3,
  'pa': 3,
  'pap': 3,
  'pl': 13,
  'ps': 3,
  'pt': 3,
  'rm': 3,
  'ro': 9,
  'rof': 3,
  'ru': 11,
  'rwk': 3,
  'sah': 0,
  'saq': 3,
  'se': 7,
  'seh': 3,
  'ses': 0,
  'sg': 0,
  'sh': 11,
  'shi': 19,
  'sk': 12,
  'sl': 14,
  'sma': 7,
  'smi': 7,
  'smj': 7,
  'smn': 7,
  'sms': 7,
  'sn': 3,
  'so': 3,
  'sq': 3,
  'sr': 11,
  'ss': 3,
  'ssy': 3,
  'st': 3,
  'sv': 3,
  'sw': 3,
  'syr': 3,
  'ta': 3,
  'te': 3,
  'teo': 3,
  'th': 0,
  'ti': 4,
  'tig': 3,
  'tk': 3,
  'tl': 4,
  'tn': 3,
  'to': 0,
  'tr': 0,
  'ts': 3,
  'tzm': 22,
  'uk': 11,
  'ur': 3,
  've': 3,
  'vi': 0,
  'vun': 3,
  'wa': 4,
  'wae': 3,
  'wo': 0,
  'xh': 3,
  'xog': 3,
  'yo': 0,
  'zh': 0,
  'zu': 3
};

// utility functions for plural rules methods
function isIn(n, list) {
  return list.indexOf(n) !== -1;
}
function isBetween(n, start, end) {
  return typeof n === typeof start && start <= n && n <= end;
}

// list of all plural rules methods:
// map an integer to the plural form name to use
const pluralRules = {
  '0': function() {
    return 'other';
  },
  '1': function(n) {
    if ((isBetween((n % 100), 3, 10))) {
      return 'few';
    }
    if (n === 0) {
      return 'zero';
    }
    if ((isBetween((n % 100), 11, 99))) {
      return 'many';
    }
    if (n === 2) {
      return 'two';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '2': function(n) {
    if (n !== 0 && (n % 10) === 0) {
      return 'many';
    }
    if (n === 2) {
      return 'two';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '3': function(n) {
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '4': function(n) {
    if ((isBetween(n, 0, 1))) {
      return 'one';
    }
    return 'other';
  },
  '5': function(n) {
    if ((isBetween(n, 0, 2)) && n !== 2) {
      return 'one';
    }
    return 'other';
  },
  '6': function(n) {
    if (n === 0) {
      return 'zero';
    }
    if ((n % 10) === 1 && (n % 100) !== 11) {
      return 'one';
    }
    return 'other';
  },
  '7': function(n) {
    if (n === 2) {
      return 'two';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '8': function(n) {
    if ((isBetween(n, 3, 6))) {
      return 'few';
    }
    if ((isBetween(n, 7, 10))) {
      return 'many';
    }
    if (n === 2) {
      return 'two';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '9': function(n) {
    if (n === 0 || n !== 1 && (isBetween((n % 100), 1, 19))) {
      return 'few';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '10': function(n) {
    if ((isBetween((n % 10), 2, 9)) && !(isBetween((n % 100), 11, 19))) {
      return 'few';
    }
    if ((n % 10) === 1 && !(isBetween((n % 100), 11, 19))) {
      return 'one';
    }
    return 'other';
  },
  '11': function(n) {
    if ((isBetween((n % 10), 2, 4)) && !(isBetween((n % 100), 12, 14))) {
      return 'few';
    }
    if ((n % 10) === 0 ||
        (isBetween((n % 10), 5, 9)) ||
        (isBetween((n % 100), 11, 14))) {
      return 'many';
    }
    if ((n % 10) === 1 && (n % 100) !== 11) {
      return 'one';
    }
    return 'other';
  },
  '12': function(n) {
    if ((isBetween(n, 2, 4))) {
      return 'few';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '13': function(n) {
    if (n % 1 !== 0) {
      return 'other';
    }
    if ((isBetween((n % 10), 2, 4)) && !(isBetween((n % 100), 12, 14))) {
      return 'few';
    }
    if (n !== 1 && (isBetween((n % 10), 0, 1)) ||
        (isBetween((n % 10), 5, 9)) ||
        (isBetween((n % 100), 12, 14))) {
      return 'many';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '14': function(n) {
    if ((isBetween((n % 100), 3, 4))) {
      return 'few';
    }
    if ((n % 100) === 2) {
      return 'two';
    }
    if ((n % 100) === 1) {
      return 'one';
    }
    return 'other';
  },
  '15': function(n) {
    if (n === 0 || (isBetween((n % 100), 2, 10))) {
      return 'few';
    }
    if ((isBetween((n % 100), 11, 19))) {
      return 'many';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '16': function(n) {
    if ((n % 10) === 1 && n !== 11) {
      return 'one';
    }
    return 'other';
  },
  '17': function(n) {
    if (n === 3) {
      return 'few';
    }
    if (n === 0) {
      return 'zero';
    }
    if (n === 6) {
      return 'many';
    }
    if (n === 2) {
      return 'two';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '18': function(n) {
    if (n === 0) {
      return 'zero';
    }
    if ((isBetween(n, 0, 2)) && n !== 0 && n !== 2) {
      return 'one';
    }
    return 'other';
  },
  '19': function(n) {
    if ((isBetween(n, 2, 10))) {
      return 'few';
    }
    if ((isBetween(n, 0, 1))) {
      return 'one';
    }
    return 'other';
  },
  '20': function(n) {
    if ((isBetween((n % 10), 3, 4) || ((n % 10) === 9)) && !(
        isBetween((n % 100), 10, 19) ||
        isBetween((n % 100), 70, 79) ||
        isBetween((n % 100), 90, 99)
        )) {
      return 'few';
    }
    if ((n % 1000000) === 0 && n !== 0) {
      return 'many';
    }
    if ((n % 10) === 2 && !isIn((n % 100), [12, 72, 92])) {
      return 'two';
    }
    if ((n % 10) === 1 && !isIn((n % 100), [11, 71, 91])) {
      return 'one';
    }
    return 'other';
  },
  '21': function(n) {
    if (n === 0) {
      return 'zero';
    }
    if (n === 1) {
      return 'one';
    }
    return 'other';
  },
  '22': function(n) {
    if ((isBetween(n, 0, 1)) || (isBetween(n, 11, 99))) {
      return 'one';
    }
    return 'other';
  },
  '23': function(n) {
    if ((isBetween((n % 10), 1, 2)) || (n % 20) === 0) {
      return 'one';
    }
    return 'other';
  },
  '24': function(n) {
    if ((isBetween(n, 3, 10) || isBetween(n, 13, 19))) {
      return 'few';
    }
    if (isIn(n, [2, 12])) {
      return 'two';
    }
    if (isIn(n, [1, 11])) {
      return 'one';
    }
    return 'other';
  }
};

function getPluralRule(code) {
  // return a function that gives the plural form name for a given integer
  const index = locales2rules[code.replace(/-.*$/, '')];
  if (!(index in pluralRules)) {
    return () => 'other';
  }
  return pluralRules[index];
}

/**
 * An `L10nError` with information about language and entity ID in which
 * the error happened.
 */
class L10nError extends Error {
  constructor(message, id, lang) {
    super();
    this.name = 'L10nError';
    this.message = message;
    this.id = id;
    this.lang = lang;
  }
}

/*eslint no-magic-numbers: [0]*/

const MAX_PLACEABLES = 100;

/**
 * The `Parser` class is responsible for parsing FTL resources.
 *
 * It's only public method is `getResource(source)` which takes an FTL
 * string and returns a two element Array with an Object of entries
 * generated from the source as the first element and an array of L10nError
 * objects as the second.
 *
 * This parser is optimized for runtime performance.
 *
 * There is an equivalent of this parser in ftl/ast/parser which is
 * generating full AST which is useful for FTL tools.
 */
class EntriesParser {
  /**
   * @param {string} string
   * @returns {{}, []]}
   */
  getResource(string) {
    this._source = string;
    this._index = 0;
    this._length = string.length;

    // This variable is used for error recovery and reporting.
    this._lastGoodEntryEnd = 0;

    const entries = {};
    const errors = [];

    this.getWS();
    while (this._index < this._length) {
      try {
        this.getEntry(entries);
      } catch (e) {
        if (e instanceof L10nError) {
          errors.push(e);
          this.getJunkEntry();
        } else {
          throw e;
        }
      }
      this.getWS();
    }

    return [entries, errors];
  }

  getEntry(entries) {
    // The pointer here should either be at the beginning of the file
    // or right after new line.
    if (this._index !== 0 &&
        this._source[this._index - 1] !== '\n') {
      throw this.error('Expected new line and a new entry');
    }

    const ch = this._source[this._index];

    // We don't care about comments or sections at runtime
    if (ch === '#') {
      this.getComment();
      return;
    }

    if (ch === '[') {
      this.getSection();
      return;
    }

    if (ch !== '\n') {
      this.getEntity(entries);
    }
  }

  getSection() {
    this._index += 1;
    if (this._source[this._index] !== '[') {
      throw this.error('Expected "[[" to open a section');
    }

    this._index += 1;

    this.getLineWS();
    this.getKeyword();
    this.getLineWS();

    if (this._source[this._index] !== ']' ||
        this._source[this._index + 1] !== ']') {
      throw this.error('Expected "]]" to close a section');
    }

    this._index += 2;

    // sections are ignored in the runtime ast
    return undefined;
  }

  getEntity(entries) {
    const id = this.getIdentifier();

    this.getLineWS();

    let ch = this._source[this._index];

    if (ch !== '=') {
      throw this.error('Expected "=" after Entity ID');
    }

    this._index++;

    this.getLineWS();

    const val = this.getPattern();

    ch = this._source[this._index];

    // In the scenario when the pattern is quote-delimited
    // the pattern ends with the closing quote.
    if (ch === '\n') {
      this._index++;
      this.getLineWS();
      ch = this._source[this._index];
    }

    if ((ch === '[' && this._source[this._index + 1] !== '[') ||
        ch === '*') {

      const members = this.getMembers();
      entries[id] = {
        traits: members[0],
        def: members[1],
        val
      };

    } else if (typeof val === 'string') {
      entries[id] = val;
    } else if (val === undefined) {
      throw this.error(
        'Expected a value (like: " = value") or a trait (like: "[key] value")'
      );
    } else {
      entries[id] = {
        val
      };
    }
  }

  getWS() {
    let cc = this._source.charCodeAt(this._index);
    // space, \n, \t, \r
    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
      cc = this._source.charCodeAt(++this._index);
    }
  }

  getLineWS() {
    let cc = this._source.charCodeAt(this._index);
    // space, \t
    while (cc === 32 || cc === 9) {
      cc = this._source.charCodeAt(++this._index);
    }
  }

  getIdentifier() {
    const start = this._index;
    let cc = this._source.charCodeAt(this._index);

    if ((cc >= 97 && cc <= 122) || // a-z
        (cc >= 65 && cc <= 90) ||  // A-Z
        cc === 95) {               // _
      cc = this._source.charCodeAt(++this._index);
    } else {
      throw this.error('Expected an identifier (starting with [a-zA-Z_])');
    }

    while ((cc >= 97 && cc <= 122) || // a-z
           (cc >= 65 && cc <= 90) ||  // A-Z
           (cc >= 48 && cc <= 57) ||  // 0-9
           cc === 95 || cc === 45) {  // _-
      cc = this._source.charCodeAt(++this._index);
    }

    return this._source.slice(start, this._index);
  }

  getKeyword() {
    let name = '';
    let namespace = this.getIdentifier();

    // If the first character after identifier string is '/', it means
    // that what we collected so far is actually a namespace.
    //
    // But if it is not '/', that means that what we collected so far
    // is just the beginning of the keyword and we should continue collecting
    // it.
    // In that scenario, we're going to move charcters collected so far
    // from namespace variable to name variable and set namespace to null.
    //
    // For example, if the keyword is "Foo bar", at this point we only
    // collected "Foo", the index character is not "/", so we're going
    // to move on and see if the next character is allowed in the name.
    //
    // Because it's a space, it is and we'll continue collecting the name.
    //
    // In case the keyword is "Foo/bar", we're going to keep what we collected
    // so far as `namespace`, bump the index and start collecting the name.
    if (this._source[this._index] === '/') {
      this._index++;
    } else if (namespace) {
      name = namespace;
      namespace = null;
    }

    const start = this._index;
    let cc = this._source.charCodeAt(this._index);

    if ((cc >= 97 && cc <= 122) || // a-z
        (cc >= 65 && cc <= 90) ||  // A-Z
        cc === 95 || cc === 32) {  //  _
      cc = this._source.charCodeAt(++this._index);
    } else if (name.length === 0) {
      throw this.error('Expected an identifier (starting with [a-zA-Z_])');
    }

    while ((cc >= 97 && cc <= 122) || // a-z
           (cc >= 65 && cc <= 90) ||  // A-Z
           (cc >= 48 && cc <= 57) ||  // 0-9
           cc === 95 || cc === 45 || cc === 32) {  //  _-
      cc = this._source.charCodeAt(++this._index);
    }

    // If we encountered the end of name, we want to test is the last
    // collected character is a space.
    // If it is, we will backtrack to the last non-space character because
    // the keyword cannot end with a space character.
    while (this._source.charCodeAt(this._index - 1) === 32) {
      this._index--;
    }

    name += this._source.slice(start, this._index);

    return namespace ?
      { type: 'kw', ns: namespace, name } :
      { type: 'kw', name };
  }

  // We're going to first try to see if the pattern is simple.
  // If it is a simple, not quote-delimited string,
  // we can just look for the end of the line and read the string.
  //
  // Then, if either the line contains a placeable opening `{` or the
  // next line starts with a pipe `|`, we switch to complex pattern.
  getPattern() {
    const start = this._index;
    if (this._source[start] === '"') {
      return this.getComplexPattern();
    }
    let eol = this._source.indexOf('\n', this._index);

    if (eol === -1) {
      eol = this._length;
    }

    const line = start !== eol ?
      this._source.slice(start, eol) : undefined;

    if (line !== undefined && line.includes('{')) {
      return this.getComplexPattern();
    }

    this._index = eol + 1;

    this.getLineWS();

    if (this._source[this._index] === '|') {
      this._index = start;
      return this.getComplexPattern();
    }

    return line;
  }

  /* eslint-disable complexity */
  getComplexPattern() {
    let buffer = '';
    const content = [];
    let placeables = 0;

    // We actually use all three possible states of this variable:
    // true and false indicate if we're within a quote-delimited string
    // null indicates that the string is not quote-delimited
    let quoteDelimited = null;
    let firstLine = true;

    let ch = this._source[this._index];

    // If the string starts with \", \{ or \\ skip the first `\` and add the
    // following character to the buffer without interpreting it.
    if (ch === '\\' &&
      (this._source[this._index + 1] === '"' ||
       this._source[this._index + 1] === '{' ||
       this._source[this._index + 1] === '\\')) {
      buffer += this._source[this._index + 1];
      this._index += 2;
      ch = this._source[this._index];
    } else if (ch === '"') {
      // If the first character of the string is `"`, mark the string
      // as quote delimited.
      quoteDelimited = true;
      this._index++;
      ch = this._source[this._index];
    }

    while (this._index < this._length) {
      // This block handles multi-line strings combining strings seaprated
      // by new line and `|` character at the beginning of the next one.
      if (ch === '\n') {
        if (quoteDelimited) {
          throw this.error('Unclosed string');
        }
        this._index++;
        this.getLineWS();
        if (this._source[this._index] !== '|') {
          break;
        }
        if (firstLine && buffer.length) {
          throw this.error('Multiline string should have the ID line empty');
        }
        firstLine = false;
        this._index++;
        if (this._source[this._index] === ' ') {
          this._index++;
        }
        if (buffer.length) {
          buffer += '\n';
        }
        ch = this._source[this._index];
        continue;
      } else if (ch === '\\') {
        // We only handle `{` as a character that can be escaped in a string
        // and `"` if the string is quote delimited.
        const ch2 = this._source[this._index + 1];
        if ((quoteDelimited && ch2 === '"') ||
            ch2 === '{') {
          ch = ch2;
          this._index++;
        }
      } else if (quoteDelimited && ch === '"') {
        this._index++;
        quoteDelimited = false;
        break;
      } else if (ch === '{') {
        // Push the buffer to content array right before placeable
        if (buffer.length) {
          content.push(buffer);
        }
        if (placeables > MAX_PLACEABLES - 1) {
          throw this.error(
            `Too many placeables, maximum allowed is ${MAX_PLACEABLES}`);
        }
        buffer = '';
        content.push(this.getPlaceable());
        ch = this._source[this._index];
        placeables++;
        continue;
      }

      if (ch) {
        buffer += ch;
      }
      this._index++;
      ch = this._source[this._index];
    }

    if (quoteDelimited) {
      throw this.error('Unclosed string');
    }

    if (content.length === 0) {
      if (quoteDelimited !== null) {
        return buffer.length ? buffer : '';
      }
      return buffer.length ? buffer : undefined;
    }

    if (buffer.length) {
      content.push(buffer);
    }

    return content;
  }
  /* eslint-enable complexity */

  getPlaceable() {
    this._index++;

    const expressions = [];

    this.getLineWS();

    while (this._index < this._length) {
      const start = this._index;
      try {
        expressions.push(this.getPlaceableExpression());
      } catch (e) {
        throw this.error(e.description, start);
      }
      const ch = this._source[this._index];
      if (ch === '}') {
        this._index++;
        break;
      } else if (ch === ',') {
        this._index++;
        this.getWS();
      } else {
        throw this.error('Expected "}" or ","');
      }
    }

    return expressions;
  }

  getPlaceableExpression() {
    const selector = this.getCallExpression();
    let members;

    this.getWS();

    const ch = this._source[this._index];

    // If the expression is followed by `->` we're going to collect
    // its members and return it as a select expression.
    if (ch !== '}' && ch !== ',') {
      if (ch !== '-' || this._source[this._index + 1] !== '>') {
        throw this.error('Expected "}", "," or "->"');
      }
      this._index += 2; // ->

      this.getLineWS();

      if (this._source[this._index] !== '\n') {
        throw this.error('Members should be listed in a new line');
      }

      this.getWS();

      members = this.getMembers();

      if (members[0].length === 0) {
        throw this.error('Expected members for the select expression');
      }
    }

    if (members === undefined) {
      return selector;
    }
    return {
      type: 'sel',
      exp: selector,
      vars: members[0],
      def: members[1]
    };
  }

  getCallExpression() {
    const exp = this.getMemberExpression();

    if (this._source[this._index] !== '(') {
      return exp;
    }

    this._index++;

    const args = this.getCallArgs();

    this._index++;

    if (exp.type === 'ref') {
      exp.type = 'fun';
    }

    return {
      type: 'call',
      name: exp,
      args
    };
  }

  getCallArgs() {
    const args = [];

    if (this._source[this._index] === ')') {
      return args;
    }

    while (this._index < this._length) {
      this.getLineWS();

      const exp = this.getCallExpression();

      // EntityReference in this place may be an entity reference, like:
      // `call(foo)`, or, if it's followed by `:` it will be a key-value pair.
      if (exp.type !== 'ref' ||
         exp.namespace !== undefined) {
        args.push(exp);
      } else {
        this.getLineWS();

        if (this._source[this._index] === ':') {
          this._index++;
          this.getLineWS();

          const val = this.getCallExpression();

          // If the expression returned as a value of the argument
          // is not a quote delimited string, number or
          // external argument, throw an error.
          //
          // We don't have to check here if the pattern is quote delimited
          // because that's the only type of string allowed in expressions.
          if (typeof val === 'string' ||
              Array.isArray(val) ||
              val.type === 'num' ||
              val.type === 'ext') {
            args.push({
              type: 'kv',
              name: exp.name,
              val
            });
          } else {
            this._index = this._source.lastIndexOf(':', this._index) + 1;
            throw this.error(
              'Expected string in quotes, number or external argument');
          }

        } else {
          args.push(exp);
        }
      }

      this.getLineWS();

      if (this._source[this._index] === ')') {
        break;
      } else if (this._source[this._index] === ',') {
        this._index++;
      } else {
        throw this.error('Expected "," or ")"');
      }
    }

    return args;
  }

  getNumber() {
    let num = '';
    let cc = this._source.charCodeAt(this._index);

    // The number literal may start with negative sign `-`.
    if (cc === 45) {
      num += '-';
      cc = this._source.charCodeAt(++this._index);
    }

    // next, we expect at least one digit
    if (cc < 48 || cc > 57) {
      throw this.error(`Unknown literal "${num}"`);
    }

    // followed by potentially more digits
    while (cc >= 48 && cc <= 57) {
      num += this._source[this._index++];
      cc = this._source.charCodeAt(this._index);
    }

    // followed by an optional decimal separator `.`
    if (cc === 46) {
      num += this._source[this._index++];
      cc = this._source.charCodeAt(this._index);

      // followed by at least one digit
      if (cc < 48 || cc > 57) {
        throw this.error(`Unknown literal "${num}"`);
      }

      // and optionally more digits
      while (cc >= 48 && cc <= 57) {
        num += this._source[this._index++];
        cc = this._source.charCodeAt(this._index);
      }
    }

    return {
      type: 'num',
      val: num
    };
  }

  getMemberExpression() {
    let exp = this.getLiteral();

    // the obj element of the member expression
    // must be either an entity reference or another member expression.
    while (['ref', 'mem'].includes(exp.type) &&
      this._source[this._index] === '[') {
      const keyword = this.getMemberKey();
      exp = {
        type: 'mem',
        key: keyword,
        obj: exp
      };
    }

    return exp;
  }

  getMembers() {
    const members = [];
    let index = 0;
    let defaultIndex;

    while (this._index < this._length) {
      const ch = this._source[this._index];

      if ((ch !== '[' || this._source[this._index + 1] === '[') &&
          ch !== '*') {
        break;
      }
      if (ch === '*') {
        this._index++;
        defaultIndex = index;
      }

      if (this._source[this._index] !== '[') {
        throw this.error('Expected "["');
      }

      const key = this.getMemberKey();

      this.getLineWS();

      const member = {
        key,
        val: this.getPattern()
      };
      members[index++] = member;

      this.getWS();
    }

    return [members, defaultIndex];
  }

  // MemberKey may be a Keyword or Number
  getMemberKey() {
    this._index++;

    const cc = this._source.charCodeAt(this._index);
    let literal;

    if ((cc >= 48 && cc <= 57) || cc === 45) {
      literal = this.getNumber();
    } else {
      literal = this.getKeyword();
    }

    if (this._source[this._index] !== ']') {
      throw this.error('Expected "]"');
    }

    this._index++;
    return literal;
  }

  getLiteral() {
    const cc = this._source.charCodeAt(this._index);
    if ((cc >= 48 && cc <= 57) || cc === 45) {
      return this.getNumber();
    } else if (cc === 34) { // "
      return this.getPattern();
    } else if (cc === 36) { // $
      this._index++;
      return {
        type: 'ext',
        name: this.getIdentifier()
      };
    }

    return {
      type: 'ref',
      name: this.getIdentifier()
    };
  }

  // At runtime, we don't care about comments so we just have
  // to parse them properly and skip their content.
  getComment() {
    let eol = this._source.indexOf('\n', this._index);

    while (eol !== -1 && this._source[eol + 1] === '#') {
      this._index = eol + 2;

      eol = this._source.indexOf('\n', this._index);

      if (eol === -1) {
        break;
      }
    }

    if (eol === -1) {
      this._index = this._length;
    } else {
      this._index = eol + 1;
    }
  }

  error(message, start = null) {
    const pos = this._index;

    if (start === null) {
      start = pos;
    }
    start = this._findEntityStart(start);

    const context = this._source.slice(start, pos + 10);

    const msg =
      `\n\n  ${message}\nat pos ${pos}:\n------\n…${context}\n------`;
    const err = new L10nError(msg);

    const row = this._source.slice(0, pos).split('\n').length;
    const col = pos - this._source.lastIndexOf('\n', pos - 1);
    err._pos = {start: pos, end: undefined, col: col, row: row};
    err.offset = pos - start;
    err.description = message;
    err.context = context;
    return err;
  }

  getJunkEntry() {
    const pos = this._index;

    let nextEntity = this._findNextEntryStart(pos);

    if (nextEntity === -1) {
      nextEntity = this._length;
    }

    this._index = nextEntity;

    let entityStart = this._findEntityStart(pos);

    if (entityStart < this._lastGoodEntryEnd) {
      entityStart = this._lastGoodEntryEnd;
    }
  }

  _findEntityStart(pos) {
    let start = pos;

    while (true) {
      start = this._source.lastIndexOf('\n', start - 2);
      if (start === -1 || start === 0) {
        start = 0;
        break;
      }
      const cc = this._source.charCodeAt(start + 1);

      if ((cc >= 97 && cc <= 122) || // a-z
          (cc >= 65 && cc <= 90) ||  // A-Z
           cc === 95) {              // _
        start++;
        break;
      }
    }

    return start;
  }

  _findNextEntryStart(pos) {
    let start = pos;

    while (true) {
      if (start === 0 ||
          this._source[start - 1] === '\n') {
        const cc = this._source.charCodeAt(start);

        if ((cc >= 97 && cc <= 122) || // a-z
            (cc >= 65 && cc <= 90) ||  // A-Z
             cc === 95 || cc === 35 || cc === 91) {  // _#[
          break;
        }
      }

      start = this._source.indexOf('\n', start);

      if (start === -1) {
        break;
      }
      start++;
    }

    return start;
  }
}

const FTLRuntimeParser = {
  parseResource: function(string) {
    const parser = new EntriesParser();
    return parser.getResource(string);
  },
};

/**
 * The `FTLType` class is the base of FTL's type system.
 *
 * FTL types wrap JavaScript values and store additional configuration for
 * them, which can then be used in the `toString` method together with a proper
 * `Intl` formatter.
 */
class FTLType {

  /**
   * Create an `FTLType` instance.
   *
   * @param   {Any}    value - JavaScript value to wrap.
   * @param   {Object} opts  - Configuration.
   * @returns {FTLType}
   */
  constructor(value, opts) {
    this.value = value;
    this.opts = opts;
  }

  /**
   * Get the JavaScript value wrapped by this `FTLType` instance.
   *
   * @returns {Any}
   */
  valueOf() {
    return this.value;
  }

  /**
   * Stringify an instance of `FTLType`.
   *
   * This method can use `Intl` formatters memoized by the `MessageContext`
   * instance passed as an argument.
   *
   * @param   {MessageContext} ctx
   * @returns {string}
   */
  toString(ctx) {
    return this.value.toString(ctx);
  }
}

class FTLNone extends FTLType {
  toString() {
    return this.value || '???';
  }
}

class FTLNumber extends FTLType {
  constructor(value, opts) {
    super(parseFloat(value), opts);
  }
  toString(ctx) {
    const nf = ctx._memoizeIntlObject(
      Intl.NumberFormat, this.opts
    );
    return nf.format(this.value);
  }
}

class FTLDateTime extends FTLType {
  constructor(value, opts) {
    super(new Date(value), opts);
  }
  toString(ctx) {
    const dtf = ctx._memoizeIntlObject(
      Intl.DateTimeFormat, this.opts
    );
    return dtf.format(this.value);
  }
}

class FTLKeyword extends FTLType {
  toString() {
    const { name, namespace } = this.value;
    return namespace ? `${namespace}:${name}` : name;
  }
  match(ctx, other) {
    const { name, namespace } = this.value;
    if (other instanceof FTLKeyword) {
      return name === other.value.name && namespace === other.value.namespace;
    } else if (namespace) {
      return false;
    } else if (typeof other === 'string') {
      return name === other;
    } else if (other instanceof FTLNumber) {
      const pr = ctx._memoizeIntlObject(
        Intl.PluralRules, other.opts
      );
      return name === pr.select(other.valueOf());
    }
    return false;
  }
}

class FTLList extends Array {
  toString(ctx) {
    const lf = ctx._memoizeIntlObject(
      Intl.ListFormat // XXX add this.opts
    );
    const elems = this.map(
      elem => elem.toString(ctx)
    );
    return lf.format(elems);
  }
}

/**
 * @module
 *
 * The FTL resolver ships with a number of functions built-in.
 *
 * Each function take two arguments:
 *   - args - an array of positional args
 *   - opts - an object of key-value args
 *
 * Arguments to functions are guaranteed to already be instances of `FTLType`.
 * Functions must return `FTLType` objects as well.  For this reason it may be
 * necessary to unwrap the JavaScript value behind the FTL Value and to merge
 * the configuration of the argument with the configuration of the return
 * value.
 */
const builtins = {
  'NUMBER': ([arg], opts) =>
    new FTLNumber(arg.valueOf(), merge(arg.opts, opts)),
  'PLURAL': ([arg], opts) =>
    new FTLNumber(arg.valueOf(), merge(arg.opts, opts)),
  'DATETIME': ([arg], opts) =>
    new FTLDateTime(arg.valueOf(), merge(arg.opts, opts)),
  'LIST': args => FTLList.from(args),
  'LEN': ([arg]) => new FTLNumber(arg.valueOf().length),
  'TAKE': ([num, arg]) => FTLList.from(arg.valueOf().slice(0, num.value)),
  'DROP': ([num, arg]) => FTLList.from(arg.valueOf().slice(num.value)),
};

function merge(argopts, opts) {
  return Object.assign({}, argopts, valuesOf(opts));
}

function valuesOf(opts) {
  return Object.keys(opts).reduce(
    (seq, cur) => Object.assign({}, seq, {
      [cur]: opts[cur].valueOf()
    }), {});
}

/**
 * @module
 *
 * The role of the FTL resolver is to format a translation object to an
 * instance of `FTLType`.
 *
 * Translations can contain references to other entities or external arguments,
 * conditional logic in form of select expressions, traits which describe their
 * grammatical features, and can use FTL builtins which make use of the `Intl`
 * formatters to format numbers, dates, lists and more into the context's
 * language.  See the documentation of the FTL syntax for more information.
 *
 * In case of errors the resolver will try to salvage as much of the
 * translation as possible.  In rare situations where the resolver didn't know
 * how to recover from an error it will return an instance of `FTLNone`.
 *
 * `EntityReference`, `MemberExpression` and `SelectExpression` resolve to raw
 * Runtime Entries objects and the result of the resolution needs to be passed
 * into `Value` to get their real value.  This is useful for composing
 * expressions.  Consider:
 *
 *     brand-name[nominative]
 *
 * which is a `MemberExpression` with properties `obj: EntityReference` and
 * `key: Keyword`.  If `EntityReference` was resolved eagerly, it would
 * instantly resolve to the value of the `brand-name` entity.  Instead, we want
 * to get the entity object and look for its `nominative` trait.
 *
 * All other expressions (except for `FunctionReference` which is only used in
 * `CallExpression`) resolve to an instance of `FTLType`, which must then be
 * sringified with its `toString` method by the caller.
 */

// Prevent expansion of too long placeables.
const MAX_PLACEABLE_LENGTH = 2500;

/**
 * Map an array of JavaScript values into FTL Values.
 *
 * Used for external arguments of Array type and for implicit Lists in
 * placeables.
 *
 * @private
 */
function mapValues(env, arr) {
  const values = new FTLList();
  for (const elem of arr) {
    values.push(Value(env, elem));
  }
  return values;
}

/**
 * Helper for choosing the default value from a set of members.
 *
 * Used in SelectExpressions and Value.
 *
 * @private
 */
function DefaultMember(env, members, def) {
  if (members[def]) {
    return members[def];
  }

  const { errors } = env;
  errors.push(new RangeError('No default'));
  return new FTLNone();
}


/**
 * Resolve a reference to an entity to the entity object.
 *
 * @private
 */
function EntityReference(env, {name}) {
  const { ctx, errors } = env;
  const entity = ctx.messages.get(name);

  if (!entity) {
    errors.push(new ReferenceError(`Unknown entity: ${name}`));
    return new FTLNone(name);
  }

  return entity;
}

/**
 * Resolve a member expression to the member object.
 *
 * @private
 */
function MemberExpression(env, {obj, key}) {
  const entity = EntityReference(env, obj);
  if (entity instanceof FTLNone) {
    return entity;
  }

  const { ctx, errors } = env;
  const keyword = Value(env, key);

  if (entity.traits) {
    // Match the specified key against keys of each trait, in order.
    for (const member of entity.traits) {
      const memberKey = Value(env, member.key);
      if (keyword.match(ctx, memberKey)) {
        return member;
      }
    }
  }

  errors.push(new ReferenceError(`Unknown trait: ${keyword.toString(ctx)}`));
  return Value(env, entity);
}

/**
 * Resolve a select expression to the member object.
 *
 * @private
 */
function SelectExpression(env, {exp, vars, def}) {
  const selector = Value(env, exp);
  if (selector instanceof FTLNone) {
    return DefaultMember(env, vars, def);
  }

  // Match the selector against keys of each variant, in order.
  for (const variant of vars) {
    const key = Value(env, variant.key);

    // XXX A special case of numbers to avoid code repetition in types.js.
    if (key instanceof FTLNumber &&
        selector instanceof FTLNumber &&
        key.valueOf() === selector.valueOf()) {
      return variant;
    }

    const { ctx } = env;

    if (key instanceof FTLKeyword && key.match(ctx, selector)) {
      return variant;
    }
  }

  return DefaultMember(env, vars, def);
}


/**
 * Resolve expression to an FTL type.
 *
 * JavaScript strings are a special case.  Since they natively have the
 * `toString` method they can be used as if they were an FTL type without
 * paying the cost of creating a instance of one.
 *
 * @param   {Object} expr
 * @returns {FTLType}
 * @private
 */
function Value(env, expr) {
  // A fast-path for strings which are the most common case, and for `FTLNone`
  // which doesn't require any additional logic.
  if (typeof expr === 'string' || expr instanceof FTLNone) {
    return expr;
  }

  // The Runtime AST (Entries) encodes patterns (complex strings with
  // placeables) as Arrays.
  if (Array.isArray(expr)) {
    return Pattern(env, expr);
  }


  switch (expr.type) {
    case 'kw':
      return new FTLKeyword(expr);
    case 'num':
      return new FTLNumber(expr.val);
    case 'ext':
      return ExternalArgument(env, expr);
    case 'fun':
      return FunctionReference(env, expr);
    case 'call':
      return CallExpression(env, expr);
    case 'ref': {
      const entity = EntityReference(env, expr);
      return Value(env, entity);
    }
    case 'mem': {
      const member = MemberExpression(env, expr);
      return Value(env, member);
    }
    case 'sel': {
      const member = SelectExpression(env, expr);
      return Value(env, member);
    }
    case undefined: {
      // If it's a node with a value, resolve the value.
      if (expr.val !== undefined) {
        return Value(env, expr.val);
      }

      const def = DefaultMember(env, expr.traits, expr.def);
      return Value(env, def);
    }
    default:
      return new FTLNone();
  }
}

/**
 * Resolve a reference to an external argument.
 *
 * @private
 */
function ExternalArgument(env, {name}) {
  const { args, errors } = env;

  if (!args || !args.hasOwnProperty(name)) {
    errors.push(new ReferenceError(`Unknown external: ${name}`));
    return new FTLNone(name);
  }

  const arg = args[name];

  if (arg instanceof FTLType) {
    return arg;
  }

  // Convert the argument to an FTL type.
  switch (typeof arg) {
    case 'string':
      return arg;
    case 'number':
      return new FTLNumber(arg);
    case 'object':
      if (Array.isArray(arg)) {
        return mapValues(env, arg);
      }
      if (arg instanceof Date) {
        return new FTLDateTime(arg);
      }
    default:
      errors.push(
        new TypeError(`Unsupported external type: ${name}, ${typeof arg}`)
      );
      return new FTLNone(name);
  }
}

/**
 * Resolve a reference to a function.
 *
 * @private
 */
function FunctionReference(env, {name}) {
  // Some functions are built-in.  Others may be provided by the runtime via
  // the `MessageContext` constructor.
  const { ctx: { functions }, errors } = env;
  const func = functions[name] || builtins[name];

  if (!func) {
    errors.push(new ReferenceError(`Unknown function: ${name}()`));
    return new FTLNone(`${name}()`);
  }

  if (typeof func !== 'function') {
    errors.push(new TypeError(`Function ${name}() is not callable`));
    return new FTLNone(`${name}()`);
  }

  return func;
}

/**
 * Resolve a call to a Function with positional and key-value arguments.
 *
 * @private
 */
function CallExpression(env, {name, args}) {
  const callee = FunctionReference(env, name);

  if (callee instanceof FTLNone) {
    return callee;
  }

  const posargs = [];
  const keyargs = [];

  for (const arg of args) {
    if (arg.type === 'kv') {
      keyargs[arg.name] = Value(env, arg.val);
    } else {
      posargs.push(Value(env, arg));
    }
  }

  // XXX functions should also report errors
  return callee(posargs, keyargs);
}

/**
 * Resolve a pattern (a complex string with placeables).
 *
 * @private
 */
function Pattern(env, ptn) {
  const { ctx, dirty, errors } = env;

  if (dirty.has(ptn)) {
    errors.push(new RangeError('Cyclic reference'));
    return new FTLNone();
  }

  // Tag the pattern as dirty for the purpose of the current resolution.
  dirty.add(ptn);
  let result = '';

  for (const part of ptn) {
    if (typeof part === 'string') {
      result += part;
    } else {
      // Optimize the most common case: the placeable only has one expression.
      // Otherwise map its expressions to Values.
      const value = part.length === 1 ?
        Value(env, part[0]) : mapValues(env, part);

      const str = value.toString(ctx);
      if (str.length > MAX_PLACEABLE_LENGTH) {
        errors.push(
          new RangeError(
            'Too many characters in placeable ' +
            `(${str.length}, max allowed is ${MAX_PLACEABLE_LENGTH})`
          )
        );
        result += str.substr(0, MAX_PLACEABLE_LENGTH);
      } else {
        result += str;
      }
    }
  }

  dirty.delete(ptn);
  return result;
}

/**
 * Format a translation into an `FTLType`.
 *
 * The return value must be sringified with its `toString` method by the
 * caller.
 *
 * @param   {MessageContext} ctx
 * @param   {Object}         args
 * @param   {Object}         entity
 * @param   {Array}          errors
 * @returns {FTLType}
 */
function resolve(ctx, args, entity, errors = []) {
  const env = {
    ctx, args, errors, dirty: new WeakSet()
  };
  return Value(env, entity);
}

/**
 * Message contexts are single-language stores of translations.  They are
 * responsible for parsing translation resources in the FTL syntax and can
 * format translation units (entities) to strings.
 *
 * Always use `MessageContext.format` to retrieve translation units from
 * a context.  Translations can contain references to other entities or
 * external arguments, conditional logic in form of select expressions, traits
 * which describe their grammatical features, and can use FTL builtins which
 * make use of the `Intl` formatters to format numbers, dates, lists and more
 * into the context's language.  See the documentation of the FTL syntax for
 * more information.
 */
class MessageContext {

  /**
   * Create an instance of `MessageContext`.
   *
   * The `lang` argument is used to instantiate `Intl` formatters used by
   * translations.  The `options` object can be used to configure the context.
   *
   * Available options:
   *
   *   - functions - an object of additional functions available to
   *                 translations as builtins.
   *
   * @param   {string} lang      - Language of the context.
   * @param   {Object} [options]
   * @returns {MessageContext}
   */
  constructor(lang, options = {}) {
    this.lang = lang;
    this.functions = options.functions || {};
    this.messages = new Map();
    this.intls = new WeakMap();
  }

  /**
   * Add a translation resource to the context.
   *
   * The translation resource must use the FTL syntax.  It will be parsed by
   * the context and each translation unit (entity) will be available in the
   * `messages` map by its identifier.
   *
   *     ctx.addMessages('foo = Foo');
   *     ctx.messages.get('foo');
   *
   *     // Returns a raw representation of the 'foo' entity.
   *
   * Parsed entities should be formatted with the `format` method in case they
   * contain logic (references, select expressions etc.).
   *
   * @param   {string} source - Text resource with translations.
   * @returns {Array<Error>}
   */
  addMessages(source) {
    const [entries, errors] = FTLRuntimeParser.parseResource(source);
    for (const id in entries) {
      this.messages.set(id, entries[id]);
    }

    return errors;
  }

  /**
   * Format an entity to a string or null.
   *
   * Format a raw `entity` from the context's `messages` map into a string (or
   * a null if it has a null value).  `args` will be used to resolve references
   * to external arguments inside of the translation.
   *
   * In case of errors `format` will try to salvage as much of the translation
   * as possible and will still return a string.  For performance reasons, the
   * encountered errors are not returned but instead are appended to the
   * `errors` array passed as the third argument.
   *
   *     const errors = [];
   *     ctx.addMessages('hello = Hello, { $name }!');
   *     const hello = ctx.messages.get('hello');
   *     ctx.format(hello, { name: 'Jane' }, errors);
   *
   *     // Returns 'Hello, Jane!' and `errors` is empty.
   *
   *     ctx.format(hello, undefined, errors);
   *
   *     // Returns 'Hello, name!' and `errors` is now:
   *
   *     [<ReferenceError: Unknown external: name>]
   *
   * @param   {Object | string}    entity
   * @param   {Object | undefined} args
   * @param   {Array}              errors
   * @returns {?string}
   */
  format(entity, args, errors) {
    // optimize entities which are simple strings with no traits
    if (typeof entity === 'string') {
      return entity;
    }

    // optimize entities whose value is a simple string, and traits
    if (typeof entity.val === 'string') {
      return entity.val;
    }

    // optimize entities with null values and no default traits
    if (entity.val === undefined && entity.def === undefined) {
      return null;
    }

    const result = resolve(this, args, entity, errors);
    return result instanceof FTLNone ? null : result;
  }

  _memoizeIntlObject(ctor, opts) {
    const cache = this.intls.get(ctor) || {};
    const id = JSON.stringify(opts);

    if (!cache[id]) {
      cache[id] = new ctor(this.lang, opts);
      this.intls.set(ctor, cache);
    }

    return cache[id];
  }
}

Intl.MessageContext = MessageContext;
Intl.MessageNumberArgument = FTLNumber;
Intl.MessageDateTimeArgument = FTLDateTime;

if (!Intl.NumberFormat) {
  Intl.NumberFormat = function() {
    return {
      format(n) {
        return n;
      }
    };
  };
}

if (!Intl.PluralRules) {
  Intl.PluralRules = function(code) {
    const fn = getPluralRule(code);
    return {
      select(n) {
        return fn(n);
      }
    };
  };
}

if (!Intl.ListFormat) {
  Intl.ListFormat = function() {
    return {
      format(list) {
        return list.join(', ');
      }
    };
  };
}

function prioritizeLocales(def, availableLangs, requested) {
  const supportedLocales = new Set();
  for (const lang of requested) {
    if (availableLangs.has(lang)) {
      supportedLocales.add(lang);
    }
  }

  supportedLocales.add(def);
  return supportedLocales;
}

function getDirection(code) {
  const tag = code.split('-')[0];
  return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ?
    'rtl' : 'ltr';
}

function CanonicalizeLocaleList(locales) {
  if (locales === undefined) {
    return [];
  }
  const seen = [];
  if (typeof locales === 'string') {
    locales = [locales];
  }
  const O = locales;
  const len = O.length;
  let k = 0;
  while (k < len) {
    let tag = O[k];
    tag = tag.toLowerCase();
    if (seen.indexOf(tag) === -1) {
      seen.push(tag);
    }
    k++;
  }
  return seen;
}

function PrioritizeLocales(availableLocales,
  requestedLocales,
  defaultLocale) {

  let array = new Array();
  if (typeof availableLocales === 'object') {
    const iter = availableLocales.values();
    for (let z = 0; z < availableLocales.size; z++) {
      array.push(iter.next().value);
    }
  } else {
    array = availableLocales.slice();
  }

  availableLocales = CanonicalizeLocaleList(array);
  requestedLocales = CanonicalizeLocaleList(requestedLocales);

  const result = LookupAvailableLocales(availableLocales, requestedLocales);
  if (defaultLocale) {
    // if default locale is not present in result,
    // add it to the end of fallback chain
    defaultLocale = defaultLocale.toLowerCase();
    if (result.indexOf(defaultLocale) === -1) {
      result.push(defaultLocale);
    }
  }

  for (let i = 0; i < result.length; i++) {
    array = result[i].split('-');
    if (array.length === 2) {
      result[i] = `${array[0]}-${array[1].toUpperCase()}`;
    }
  }

  return result;
}

function LookupAvailableLocales(availableLocales, requestedLocales) {
  // Steps 1-2.
  const len = requestedLocales.length;
  const subset = [];

  // Steps 3-4.
  let k = 0;
  while (k < len) {
    // Steps 4.a-b.
    const locale = requestedLocales[k];

    // Step 4.c-d.
    const availableLocale = BestAvailableLocale(availableLocales, locale);
    if (availableLocale !== undefined) {
      // in LookupSupportedLocales it pushes locale here
      subset.push(availableLocale);
    }
    // Step 4.e.
    k++;
  }

  // Steps 5-6.
  return subset.slice(0);
}

function BestAvailableLocale(availableLocales, locale) {
  let candidate = locale;
  while (true) {
    if (availableLocales.indexOf(candidate) !== -1) {
      return candidate;
    }
    let pos = candidate.lastIndexOf('-');
    if (pos === -1) {
      return undefined;
    }
    if (pos >= 2 && candidate[pos - 2] === '-') {
      pos -= 2;
    }
    candidate = candidate.substring(0, pos);
  }
}

/**
 * @private
 *
 * This function is an inner function for `Localization.formatWithFallback`.
 *
 * It takes a `MessageContext`, list of l10n-ids and a method to be used for
 * key resolution (either `valueFromContext` or `entityFromContext`) and
 * optionally a value returned from `keysFromContext` executed against
 * another `MessageContext`.
 *
 * The idea here is that if the previous `MessageContext` did not resolve
 * all keys, we're calling this function with the next context to resolve
 * the remaining ones.
 *
 * In the function, we loop oer `keys` and check if we have the `prev`
 * passed and if it has an error entry for the position we're in.
 *
 * If it doesn't, it means that we have a good translation for this key and
 * we return it. If it does, we'll try to resolve the key using the passed
 * `MessageContext`.
 *
 * In the end, we return an Object with resolved translations, errors and
 * a boolean indicating if there were any errors found.
 *
 * The translations are either strings, if the method is `valueFromContext`
 * or objects with value and attributes if the method is `entityFromContext`.
 *
 * See `Localization.formatWithFallback` for more info on how this is used.
 *
 * @param {MessageContext} ctx
 * @param {Array<string>}  keys
 * @param {Function}       method
 * @param {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<string>|Array<{value: string, attrs: Object}>}} prev
 *
 * @returns {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<string>|Array<{value: string, attrs: Object}>}}
 */
function keysFromContext(method, sanitizeArgs, ctx, keys, prev) {
  const entityErrors = [];
  const result = {
    errors: new Array(keys.length),
    withoutFatal: new Array(keys.length),
    hasFatalErrors: false,
  };

  result.translations = keys.map((key, i) => {
    // Use a previously formatted good value if it had no errors.
    if (prev && !prev.errors[i] ) {
      return prev.translations[i];
    }

    // Clear last entity's errors.
    entityErrors.length = 0;
    const args = sanitizeArgs(key[1]);
    const translation = method(ctx, entityErrors, key[0], args);

    // No errors still? Use this translation as fallback to the previous one
    // which had errors.
    if (entityErrors.length === 0) {
      return translation;
    }

    // The rest of this function handles the scenario in which the translation
    // was formatted with errors.  Copy the errors to the result object so that
    // the Localization can handle them (e.g. console.warn about them).
    result.errors[i] = entityErrors.slice();

    // Formatting errors are not fatal and the translations are usually still
    // usable and can be good fallback values.  Fatal errors should signal to
    // the Localization that another fallback should be loaded.
    if (!entityErrors.some(isL10nError)) {
      result.withoutFatal[i] = true;
    } else if (!result.hasFatalErrors) {
      result.hasFatalErrors = true;
    }

    // Use the previous translation for this `key` even if it had formatting
    // errors.  This is usually closer the user's preferred language anyways.
    if (prev && prev.withoutFatal[i]) {
      // Mark this previous translation as a good potential fallback value in
      // case of further fallbacks.
      result.withoutFatal[i] = true;
      return prev.translations[i];
    }

    // If no good or almost good previous translation is available, return the
    // current translation.  In case of minor errors it's a partially
    // formatted translation.  In the worst-case scenario it an identifier of
    // the requested entity.
    return translation;
  });

  return result;
}

/**
 * @private
 *
 * This function is passed as a method to `keysFromContext` and resolve
 * a value of a single L10n Entity using provided `MessageContext`.
 *
 * If the function fails to retrieve the entity, it will return an ID of it.
 * If formatting fails, it will return a partially resolved entity.
 *
 * In both cases, an error is being added to the errors array.
 *
 * @param   {MessageContext} ctx
 * @param   {Array<Error>}   errors
 * @param   {string}         id
 * @param   {Object}         args
 * @returns {string}
 */
function valueFromContext(ctx, errors, id, args) {
  const entity = ctx.messages.get(id);

  if (entity === undefined) {
    errors.push(new L10nError(`Unknown entity: ${id}`));
    return id;
  }

  return ctx.format(entity, args, errors);
}

/**
 * @private
 *
 * This function is passed as a method to `keysFromContext` and resolve
 * a single L10n Entity using provided `MessageContext`.
 *
 * The function will return an object with a value and attributes of the
 * entity.
 *
 * If the function fails to retrieve the entity, the value is set to the ID of
 * an entity, and attrs to `null`. If formatting fails, it will return
 * a partially resolved value and attributes.
 *
 * In both cases, an error is being added to the errors array.
 *
 * @param   {MessageContext} ctx
 * @param   {Array<Error>}   errors
 * @param   {String}         id
 * @param   {Object}         args
 * @returns {Object}
 */
function entityFromContext(ctx, errors, id, args) {
  const entity = ctx.messages.get(id);

  if (entity === undefined) {
    errors.push(new L10nError(`Unknown entity: ${id}`));
    return { value: id, attrs: null };
  }

  const formatted = {
    value: ctx.format(entity, args, errors),
    attrs: null,
  };

  if (entity.traits) {
    formatted.attrs = [];
    for (let i = 0, trait; (trait = entity.traits[i]); i++) {
      if (!trait.key.hasOwnProperty('ns')) {
        continue;
      }
      const attr = ctx.format(trait, args, errors);
      if (attr !== null) {
        formatted.attrs.push([
          trait.key.ns,
          trait.key.name,
          attr
        ]);
      }
    }
  }

  return formatted;
}

/**
 * @private
 *
 * Test if an error is an instance of L10nError.
 *
 * @param   {Error}   error
 * @returns {boolean}
 */
function isL10nError(error) {
  return error instanceof L10nError;
}

const properties = new WeakMap();
const contexts = new WeakMap();

/**
 * The `Localization` class is responsible for fetching resources and
 * formatting translations.
 *
 * It implements the fallback strategy in case of errors encountered during the
 * formatting of translations.
 *
 * In HTML and XUL, l20n.js will create an instance of `Localization` for the
 * default set of `<link rel="localization">` elements.  You can get
 * a reference to it via:
 *
 *     const localization = document.l10n.get('main');
 *
 * Different names can be specified via the `name` attribute on the `<link>`
 * elements.  One `document` can have more than one `Localization` instance,
 * but one `Localization` instance can only be assigned to a single `document`.
 */
class Localization {

  /**
   * Create an instance of the `Localization` class.
   *
   * The instance's configuration is provided by two runtime-dependent
   * functions passed to the constructor.
   *
   * The `requestBundles` function takes an array of language codes and returns
   * a Promise of an array of lazy `ResourceBundle` instances.  The
   * `Localization` instance will imediately call the `fetch` method of the
   * first bundle returned by `requestBundles` and may call `fetch` on
   * subsequent bundles in fallback scenarios.
   *
   * The array of bundles is the de-facto current fallback chain of languages
   * and fetch locations.
   *
   * The `createContext` function takes a language code and returns an instance
   * of `Intl.MessageContext`.  Since it's also provided to the constructor by
   * the runtime it may pass runtime-specific `functions` to the
   * `MessageContext` instances it creates.
   *
   * @param   {Function}     requestBundles
   * @param   {Function}     createContext
   * @returns {Localization}
   */
  constructor(requestBundles, createContext) {
    const createHeadContext =
      bundles => createHeadContextWith(createContext, bundles);

    // Keep `requestBundles` and `createHeadContext` private.
    properties.set(this, {
      requestBundles, createHeadContext
    });

    /**
     * A Promise which resolves when the `Localization` instance has fetched
     * and parsed all localization resources in the user's first preferred
     * language (if available).
     *
     *     localization.interactive.then(callback);
     */
    this.interactive = requestBundles().then(
      // Create a `MessageContext` for the first bundle right away.
      bundles => createHeadContext(bundles).then(
        // Force `this.interactive` to resolve to the list of bundles.
        () => bundles
      )
    );
  }

  /**
   * Initiate the change of the currently negotiated languages.
   *
   * `requestLanguages` takes an array of language codes representing user's
   * updated language preferences.
   *
   * @param   {Array<string>}     requestedLangs
   * @returns {Promise<Array<ResourceBundle>>}
   */
  requestLanguages(requestedLangs) {
    const { requestBundles, createHeadContext } = properties.get(this);

    // Assign to `this.interactive` to make all translations requested after
    // the language change request come from the new fallback chain.
    return this.interactive = Promise.all(
      // Get the current bundles to be able to compare them to the new result
      // of the language negotiation.
      [this.interactive, requestBundles(requestedLangs)]
    ).then(([oldBundles, newBundles]) => {
      if (equal(oldBundles, newBundles)) {
        return oldBundles;
      }

      return createHeadContext(newBundles).then(
        () => newBundles
      );
    });
  }

  /**
   * Format translations and handle fallback if needed.
   *
   * Format translations for `keys` from `MessageContext` instances
   * corresponding to the current bundles.  In case of errors, fetch the next
   * bundle in the fallback chain, create a context for it, and recursively
   * call `formatWithFallback` again.
   *
   * @param   {Array<ResourceBundle>} bundles - Current bundles.
   * @param   {Array<Array>}          keys    - Translation keys to format.
   * @param   {Function}              method  - Formatting function.
   * @param   {Array<string>}         [prev]  - Previous translations.
   * @returns {Array<string> | Promise<Array<string>>}
   * @private
   */
  formatWithFallback(bundles, ctx, keys, method, prev) {
    // If a context for the head bundle doesn't exist we've reached the last
    // bundle in the fallback chain.  This is the end condition which returns
    // the translations formatted during the previous (recursive) calls to
    // `formatWithFallback`.
    if (!ctx) {
      return prev.translations;
    }

    const current = method(ctx, keys, prev);

    // In Gecko `console` needs to imported explicitly.
    if (typeof console !== 'undefined') {
      // The `errors` property is an array of arrays, each containing all
      // errors encountered for the translation at the same position in `keys`.
      // If there were no errors for a given translation, `errors` will contain
      // an `undefined` instead of the array of errors.  Most translations are
      // simple string which don't produce errors.
      current.errors.forEach(
        errs => errs ? errs.forEach(
          e => console.warn(e) // eslint-disable-line no-console
        ) : null
      );
    }

    // `hasFatalErrors` is a flag set by `keysFromContext` to notify about
    // errors during the formatting.  We can't just check the `length` of the
    // `errors` property because it is fixed and equal to the length of `keys`.
    if (!current.hasFatalErrors) {
      return current.translations;
    }

    // At this point we need to fetch the next bundle in the fallback chain and
    // create a `MessageContext` instance for it.
    const tailBundles = bundles.slice(1);
    const { createHeadContext } = properties.get(this);

    return createHeadContext(tailBundles).then(
      next => this.formatWithFallback(
        tailBundles, next, keys, method, current
      )
    );
  }

  /**
   * Format translations into {value, attrs} objects.
   *
   * This is an internal method used by `LocalizationObserver` instances.  The
   * fallback logic is the same as in `formatValues` but the argument type is
   * stricter (an array of arrays) and it returns {value, attrs} objects which
   * are suitable for the translation of DOM elements.
   *
   *     document.l10n.formatEntities([j
   *       ['hello', { who: 'Mary' }],
   *       ['welcome', undefined]
   *     ]).then(console.log);
   *
   *     // [
   *     //   { value: 'Hello, Mary!', attrs: null },
   *     //   { value: 'Welcome!', attrs: { title: 'Hello' } }
   *     // ]
   *
   * Returns a Promise resolving to an array of the translation strings.
   *
   * @param   {Array<Array>} keys
   * @returns {Promise<Array<{value: string, attrs: Object}>>}
   * @private
   */
  formatEntities(keys) {
    return this.interactive.then(
      bundles => this.formatWithFallback(
        bundles, contexts.get(bundles[0]), keys, entitiesFromContext
      )
    );
  }

  /**
   * Retrieve translations corresponding to the passed keys.
   *
   * A generalized version of `Localization.formatValue`.  Keys can either be
   * simple string identifiers or `[id, args]` arrays.
   *
   *     document.l10n.formatValues(
   *       ['hello', { who: 'Mary' }],
   *       ['hello', { who: 'John' }],
   *       'welcome'
   *     ).then(console.log);
   *
   *     // ['Hello, Mary!', 'Hello, John!', 'Welcome!']
   *
   * Returns a Promise resolving to an array of the translation strings.
   *
   * @param   {...(Array | string)} keys
   * @returns {Promise<Array<string>>}
   */
  formatValues(...keys) {
    // Convert string keys into arrays that `formatWithFallback` expects.
    const keyTuples = keys.map(
      key => Array.isArray(key) ? key : [key, null]
    );
    return this.interactive.then(
      bundles => this.formatWithFallback(
        bundles, contexts.get(bundles[0]), keyTuples, valuesFromContext
      )
    );
  }

  /**
   * Retrieve the translation corresponding to the `id` identifier.
   *
   * If passed, `args` is a simple hash object with a list of variables that
   * will be interpolated in the value of the translation.
   *
   *     localization.formatValue(
   *       'hello', { who: 'world' }
   *     ).then(console.log);
   *
   *     // 'Hello, world!'
   *
   * Returns a Promise resolving to the translation string.
   *
   * Use this sparingly for one-off messages which don't need to be
   * retranslated when the user changes their language preferences, e.g. in
   * notifications.
   *
   * @param   {string}  id     - Identifier of the translation to format
   * @param   {Object}  [args] - Optional external arguments
   * @returns {Promise<string>}
   */
  formatValue(id, args) {
    return this.formatValues([id, args]).then(
      ([val]) => val
    );
  }

}

/**
 * Create a `MessageContext` for the first bundle in the fallback chain.
 *
 * Fetches the bundle's resources and creates a context from them.
 *
 * @param   {Array<ResourceBundle>} bundle
 * @param   {Function}              createContext
 * @returns {Promise<MessageContext>}
 * @private
 */
function createHeadContextWith(createContext, bundles) {
  const [bundle] = bundles;

  if (!bundle) {
    return Promise.resolve(null);
  }

  return bundle.fetch().then(resources => {
    const ctx = createContext(bundle.lang);
    resources
      // Filter out resources which failed to load correctly (e.g. 404).
      .filter(res => res !== null)
      .forEach(res => ctx.addMessages(res));
    // Save the reference to the context.
    contexts.set(bundle, ctx);
    return ctx;
  });
}

/**
 *
 * Test if two fallback chains are functionally the same.
 *
 * @param   {Array<ResourceBundle>} bundles1
 * @param   {Array<ResourceBundle>} bundles2
 * @returns {boolean}
 * @private
 */
function equal(bundles1, bundles2) {
  return bundles1.length === bundles2.length &&
    bundles1.every(({lang}, i) => lang === bundles2[i].lang);
}

// A regexp to sanitize HTML tags and entities.
const reHtml = /[&<>]/g;
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

// Unicode bidi isolation characters.
//const FSI = '\u2068';
//const PDI = '\u2069';

/**
 * Sanitize string-typed arguments.
 *
 * Escape HTML tags and entities and wrap values in the Unicode Isolation Marks
 * (FSI and PDI) to ensure the proper directionality of the interpolated text.
 *
 * @param   {Object} args
 * @returns {Object}
 * @private
 */
function sanitizeArgs(args) {
  for (const name in args) {
    const arg = args[name];
    if (typeof arg === 'string') {
      const value = arg.replace(reHtml, match => htmlEntities[match]);
      args[name] = value;
    }
  }
  return args;
}

/**
 * A bound version of `keysFromContext` using `entityFromContext`.
 *
 * @param {MessageContext} ctx
 * @param {Array<Array>}   keys
 * @param {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<{value: string, attrs: Object}>
 * }} prev
 * @returns {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<{value: string, attrs: Object}>
 * }}
 * @private
 */
function entitiesFromContext(ctx, keys, prev) {
  return keysFromContext(entityFromContext, sanitizeArgs, ctx, keys, prev);
}

/**
 * A bound version of `keysFromContext` using `valueFromContext`.
 *
 * @param {MessageContext} ctx
 * @param {Array<Array>}   keys
 * @param {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<string>}} prev
 * @returns {{
 *   errors: Array<Error>,
 *   hasErrors: boolean,
 *   translations: Array<string>}}
 * @private
 */
function valuesFromContext(ctx, keys, prev) {
  return keysFromContext(valueFromContext, sanitizeArgs, ctx, keys, prev);
}

// Match the opening angle bracket (<) in HTML tags, and HTML entities like
// &amp;, &#0038;, &#x0026;.
const reOverlay = /<|&#?\w+;/;

// XXX The allowed list should be amendable; https://bugzil.la/922573.
const ALLOWED_ELEMENTS = {
  'http://www.w3.org/1999/xhtml': [
    'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data',
    'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u',
    'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr'
  ],
};

const ALLOWED_ATTRIBUTES = {
  'http://www.w3.org/1999/xhtml': {
    global: ['title', 'aria-label', 'aria-valuetext', 'aria-moz-hint'],
    a: ['download'],
    area: ['download', 'alt'],
    // value is special-cased in isAttrAllowed
    input: ['alt', 'placeholder'],
    menuitem: ['label'],
    menu: ['label'],
    optgroup: ['label'],
    option: ['label'],
    track: ['label'],
    img: ['alt'],
    textarea: ['placeholder'],
    th: ['abbr']
  },
  'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul': {
    global: [
      'accesskey', 'aria-label', 'aria-valuetext', 'aria-moz-hint', 'label'
    ],
    key: ['key', 'keycode'],
    textbox: ['placeholder'],
    toolbarbutton: ['tooltiptext'],
  }
};

const DOM_NAMESPACES = {
  'html': 'http://www.w3.org/1999/xhtml',
  'xul': 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',

  // Reverse map for overlays.
  'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul': 'xul',
  'http://www.w3.org/1999/xhtml': 'html',
};


/**
 * Overlay translation onto a DOM element.
 *
 * @param   {Element}      element
 * @param   {string}       translation
 * @private
 */
function overlayElement(element, translation) {
  const value = translation.value;

  if (typeof value === 'string') {
    if (!reOverlay.test(value)) {
      // If the translation doesn't contain any markup skip the overlay logic.
      element.textContent = value;
    } else {
      // Else start with an inert template element and move its children into
      // `element` but such that `element`'s own children are not replaced.
      const tmpl = element.ownerDocument.createElementNS(
        'http://www.w3.org/1999/xhtml', 'template');
      tmpl.innerHTML = value;
      // Overlay the node with the DocumentFragment.
      overlay(element, tmpl.content);
    }
  }

  for (const key in translation.attrs) {
    const [ns, name] =
      key.includes('/') ? key.split('/', 2) : [null, key];
    if (isAttrAllowed({ ns, name }, element)) {
      element.setAttribute(name, translation.attrs[key]);
    }
  }
}

// The goal of overlay is to move the children of `translationElement`
// into `sourceElement` such that `sourceElement`'s own children are not
// replaced, but only have their text nodes and their attributes modified.
//
// We want to make it possible for localizers to apply text-level semantics to
// the translations and make use of HTML entities. At the same time, we
// don't trust translations so we need to filter unsafe elements and
// attributes out and we don't want to break the Web by replacing elements to
// which third-party code might have created references (e.g. two-way
// bindings in MVC frameworks).
function overlay(sourceElement, translationElement) {
  const result = translationElement.ownerDocument.createDocumentFragment();
  let k, attr;

  // Take one node from translationElement at a time and check it against
  // the allowed list or try to match it with a corresponding element
  // in the source.
  let childElement;
  while ((childElement = translationElement.childNodes[0])) {
    translationElement.removeChild(childElement);

    if (childElement.nodeType === childElement.TEXT_NODE) {
      result.appendChild(childElement);
      continue;
    }

    const index = getIndexOfType(childElement);
    const sourceChild = getNthElementOfType(sourceElement, childElement, index);
    if (sourceChild) {
      // There is a corresponding element in the source, let's use it.
      overlay(sourceChild, childElement);
      result.appendChild(sourceChild);
      continue;
    }

    if (isElementAllowed(childElement)) {
      const sanitizedChild = childElement.ownerDocument.createElement(
        childElement.nodeName);
      overlay(sanitizedChild, childElement);
      result.appendChild(sanitizedChild);
      continue;
    }

    // Otherwise just take this child's textContent.
    result.appendChild(
      translationElement.ownerDocument.createTextNode(
        childElement.textContent));
  }

  // Clear `sourceElement` and append `result` which by this time contains
  // `sourceElement`'s original children, overlayed with translation.
  sourceElement.textContent = '';
  sourceElement.appendChild(result);

  // If we're overlaying a nested element, translate the allowed
  // attributes; top-level attributes are handled in `overlayElement`.
  // XXX Attributes previously set here for another language should be
  // cleared if a new language doesn't use them; https://bugzil.la/922577
  if (translationElement.attributes) {
    for (k = 0, attr; (attr = translationElement.attributes[k]); k++) {
      if (isAttrAllowed({
        ns: DOM_NAMESPACES[translationElement.namespaceURI],
        name: attr.name
      }, sourceElement)) {
        sourceElement.setAttribute(attr.name, attr.value);
      }
    }
  }
}

/**
 * Check if element is allowed in the translation.
 *
 * This method is used by the sanitizer when the translation markup contains
 * an element which is not present in the source code.
 *
 * @param   {Element} element
 * @returns {boolean}
 * @private
 */
function isElementAllowed(element) {
  const allowed = ALLOWED_ELEMENTS[element.namespaceURI];
  if (!allowed) {
    return false;
  }

  return allowed.indexOf(element.tagName.toLowerCase()) !== -1;
}

/**
 * Check if attribute is allowed for the given element.
 *
 * This method is used by the sanitizer when the translation markup contains
 * DOM attributes, or when the translation has traits which map to DOM
 * attributes.
 *
 * @param   {{name: string}} attr
 * @param   {Element}        element
 * @returns {boolean}
 * @private
 */
function isAttrAllowed(attr, element) {
  // Does it have a namespace that matches the element's?
  if (attr.ns === null || DOM_NAMESPACES[attr.ns] !== element.namespaceURI) {
    return false;
  }
  const allowed = ALLOWED_ATTRIBUTES[element.namespaceURI];
  if (!allowed) {
    return false;
  }

  const attrName = attr.name.toLowerCase();
  const elemName = element.tagName.toLowerCase();

  // Is it a globally safe attribute?
  if (allowed.global.indexOf(attrName) !== -1) {
    return true;
  }

  // Are there no allowed attributes for this element?
  if (!allowed[elemName]) {
    return false;
  }

  // Is it allowed on this element?
  if (allowed[elemName].indexOf(attrName) !== -1) {
    return true;
  }

  // Special case for value on HTML inputs with type button, reset, submit
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
      elemName === 'input' && attrName === 'value') {
    const type = element.type.toLowerCase();
    if (type === 'submit' || type === 'button' || type === 'reset') {
      return true;
    }
  }

  return false;
}

// Get n-th immediate child of context that is of the same type as element.
// XXX Use querySelector(':scope > ELEMENT:nth-of-type(index)'), when:
// 1) :scope is widely supported in more browsers and 2) it works with
// DocumentFragments.
function getNthElementOfType(context, element, index) {
  let nthOfType = 0;
  for (let i = 0, child; (child = context.children[i]); i++) {
    if (child.nodeType === child.ELEMENT_NODE &&
        child.tagName.toLowerCase() === element.tagName.toLowerCase()) {
      if (nthOfType === index) {
        return child;
      }
      nthOfType++;
    }
  }
  return null;
}

// Get the index of the element among siblings of the same type.
function getIndexOfType(element) {
  let index = 0;
  let child;
  while ((child = element.previousElementSibling)) {
    if (child.tagName === element.tagName) {
      index++;
    }
  }
  return index;
}

const observerConfig = {
  attributes: true,
  characterData: false,
  childList: true,
  subtree: true,
  attributeFilter: ['data-l10n-id', 'data-l10n-args', 'data-l10n-bundle']
};

/**
 * The `LocalizationObserver` class is responsible for localizing DOM trees.
 * It also implements the iterable protocol which allows iterating over and
 * retrieving available `Localization` objects.
 *
 * Each `document` will have its corresponding `LocalizationObserver` instance
 * created automatically on startup, as `document.l10n`.
 */
class LocalizationObserver {
  /**
   * @returns {LocalizationObserver}
   */
  constructor() {
    this.localizations = new Map();
    this.roots = new WeakMap();
    this.observer = new MutationObserver(
      mutations => this.translateMutations(mutations)
    );
  }

  /**
   * Test if the `Localization` object with a given name already exists.
   *
   * ```javascript
   * if (document.l10n.has('extra')) {
   *   const extraLocalization = document.l10n.get('extra');
   * }
   * ```
   * @param   {string} name - key for the object
   * @returns {boolean}
   */
  has(name) {
    return this.localizations.has(name);
  }

  /**
   * Retrieve a reference to the `Localization` object by name.
   *
   * ```javascript
   * const mainLocalization = document.l10n.get('main');
   * const extraLocalization = document.l10n.get('extra');
   * ```
   *
   * @param   {string}        name - key for the object
   * @returns {Localization}
   */
  get(name) {
    return this.localizations.get(name);
  }

  /**
   * Sets a reference to the `Localization` object by name.
   *
   * ```javascript
   * const loc = new Localization();
   * document.l10n.set('extra', loc);
   * ```
   *
   * @param   {string}       name - key for the object
   * @param   {Localization} value - `Localization` object
   * @returns {LocalizationObserver}
   */
  set(name, value) {
    this.localizations.set(name, value);
    return this;
  }

  *[Symbol.iterator]() {
    yield* this.localizations;
  }

  handleEvent() {
    return this.requestLanguages();
  }

  /**
   * Trigger the language negotation process with an array of language codes.
   * Returns a promise with the negotiated array of language objects as above.
   *
   * ```javascript
   * document.l10n.requestLanguages(['de-DE', 'de', 'en-US']);
   * ```
   *
   * @param   {Array<string>} requestedLangs - array of requested languages
   * @returns {Promise<Array<string>>}
   */
  requestLanguages(requestedLangs) {
    const localizations = Array.from(this.localizations.values());
    return Promise.all(
      localizations.map(l10n => l10n.requestLanguages(requestedLangs))
    ).then(
      () => this.translateAllRoots()
    );
  }

  /**
   * Set the `data-l10n-id` and `data-l10n-args` attributes on DOM elements.
   * L20n makes use of mutation observers to detect changes to `data-l10n-*`
   * attributes and translate elements asynchronously.  `setAttributes` is
   * a convenience method which allows to translate DOM elements declaratively.
   *
   * You should always prefer to use `data-l10n-id` on elements (statically in
   * HTML or dynamically via `setAttributes`) over manually retrieving
   * translations with `format`.  The use of attributes ensures that the
   * elements can be retranslated when the user changes their language
   * preferences.
   *
   * ```javascript
   * document.l10n.setAttributes(
   *   document.querySelector('#welcome'), 'hello', { who: 'world' }
   * );
   * ```
   *
   * This will set the following attributes on the `#welcome` element.  L20n's
   * MutationObserver will pick up this change and will localize the element
   * asynchronously.
   *
   * ```html
   * <p id='welcome'
   *   data-l10n-id='hello'
   *   data-l10n-args='{"who": "world"}'>
   * </p>
   *
   * @param {Element}             element - Element to set attributes on
   * @param {string}                  id      - l10n-id string
   * @param {Object<string, string>} args    - KVP list of l10n arguments
   * ```
   */
  setAttributes(element, id, args) {
    element.setAttribute('data-l10n-id', id);
    if (args) {
      element.setAttribute('data-l10n-args', JSON.stringify(args));
    }
    return element;
  }

  /**
   * Get the `data-l10n-*` attributes from DOM elements.
   *
   * ```javascript
   * document.l10n.getAttributes(
   *   document.querySelector('#welcome')
   * );
   * // -> { id: 'hello', args: { who: 'world' } }
   * ```
   *
   * @param   {Element}  element - HTML element
   * @returns {{id: string, args: Object}}
   */
  getAttributes(element) {
    return {
      id: element.getAttribute('data-l10n-id'),
      args: JSON.parse(element.getAttribute('data-l10n-args'))
    };
  }

  /**
   * Add a new root to the list of observed ones.
   *
   * @param {Element}      root - Root to observe.
   * @param {Localization} l10n - `Localization` object
   */
  observeRoot(root, l10n = this.get('main')) {
    if (!this.roots.has(l10n)) {
      this.roots.set(l10n, new Set());
    }
    this.roots.get(l10n).add(root);
    this.observer.observe(root, observerConfig);
  }

  /**
   * Remove a root from the list of observed ones.
   * If the root is the last to be associated with a given `Localization` object
   * the `Localization` object association will also be removed.
   *
   * Returns `true` if the root was the last one associated with at least
   * one `Localization` object.
   *
   * @param   {Element} root - Root to disconnect.
   * @returns {boolean}
   */
  disconnectRoot(root) {
    let wasLast = false;

    this.pause();
    for (const [name, l10n] of this.localizations) {
      const roots = this.roots.get(l10n);
      if (roots && roots.has(root)) {
        roots.delete(root);
        if (roots.size === 0) {
          wasLast = true;
          this.localizations.delete(name);
          this.roots.delete(l10n);
        }
      }
    }
    this.resume();

    return wasLast;
  }

  /**
   * Pauses the `MutationObserver`
   */
  pause() {
    this.observer.disconnect();
  }

  /**
   * Resumes the `MutationObserver`
   */
  resume() {
    for (const l10n of this.localizations.values()) {
      if (this.roots.has(l10n)) {
        for (const root of this.roots.get(l10n)) {
          this.observer.observe(root, observerConfig);
        }
      }
    }
  }

  /**
   * Triggers translation of all roots associated with the
   * `LocalizationObserver`.
   *
   * Returns a `Promise` which is resolved once all translations are
   * completed.
   *
   * @returns {Promise}
   */
  translateAllRoots() {
    const localizations = Array.from(this.localizations.values());
    return Promise.all(
      localizations.map(
        l10n => this.translateRoots(l10n)
      )
    );
  }

  translateRoots(l10n) {
    if (!this.roots.has(l10n)) {
      return Promise.resolve();
    }

    const roots = Array.from(this.roots.get(l10n));
    return Promise.all(
      roots.map(root => this.translateRoot(root, l10n))
    );
  }

  translateRoot(root, l10n) {
    function setLangs() {
      return l10n.interactive.then(bundles => {
        const langs = bundles.map(bundle => bundle.lang);
        const wasLocalizedBefore = root.hasAttribute('langs');

        root.setAttribute('langs', langs.join(' '));
        root.setAttribute('lang', langs[0]);
        root.setAttribute('dir', getDirection(langs[0]));

        if (wasLocalizedBefore) {
          root.dispatchEvent(new CustomEvent('DOMRetranslated', {
            bubbles: false,
            cancelable: false,
          }));
        }
      });
    }

    return this.translateRootContent(root).then(setLangs);
  }

  translateRootContent(root) {
    const anonChildren = document.getAnonymousNodes ?
      document.getAnonymousNodes(root) : null;
    if (!anonChildren) {
      return this.translateFragment(root);
    }

    return Promise.all(
      [root, ...anonChildren].map(node => this.translateFragment(node))
    );
  }

  translateMutations(mutations) {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case 'attributes':
          this.translateElement(mutation.target);
          break;
        case 'childList':
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === addedNode.ELEMENT_NODE) {
              if (addedNode.childElementCount) {
                this.translateFragment(addedNode);
              } else if (addedNode.hasAttribute('data-l10n-id')) {
                this.translateElement(addedNode);
              }
            }
          }
          break;
      }
    }
  }

  /**
   * Translate a DOM node or fragment asynchronously.
   *
   * You can manually trigger translation (or re-translation) of a DOM fragment
   * with `translateFragment`.  Use the `data-l10n-id` and `data-l10n-args`
   * attributes to mark up the DOM with information about which translations to
   * use.
   *
   * Returns a `Promise` that gets resolved once the translation is complete.
   *
   * @param   {DOMFragment} frag - DOMFragment to be translated
   * @returns {Promise}
   */
  translateFragment(frag) {
    return Promise.all(
      this.groupTranslatablesByLocalization(frag).map(
        elemsWithL10n => this.translateElements(
          elemsWithL10n[0], elemsWithL10n[1]
        )
      )
    );
  }

  translateElements(l10n, elements) {
    if (!elements.length) {
      return [];
    }

    const keys = elements.map(this.getKeysForElement);
    return l10n.formatEntities(keys).then(
      translations => this.applyTranslations(elements, translations)
    );
  }

  /**
   * Translates a single DOM node asynchronously.
   *
   * Returns a `Promise` that gets resolved once the translation is complete.
   *
   * @param   {Element} element - HTML element to be translated
   * @returns {Promise}
   */
  translateElement(element) {
    const l10n = this.get(element.getAttribute('data-l10n-bundle') || 'main');
    return l10n.formatEntities([this.getKeysForElement(element)]).then(
      translations => this.applyTranslations([element], translations)
    );
  }

  applyTranslations(elements, translations) {
    this.pause();
    for (let i = 0; i < elements.length; i++) {
      overlayElement(elements[i], translations[i]);
    }
    this.resume();
  }

  groupTranslatablesByLocalization(frag) {
    const elemsWithL10n = [];
    for (const loc of this.localizations) {
      elemsWithL10n.push(
        [loc[1], this.getTranslatables(frag, loc[0])]
      );
    }
    return elemsWithL10n;
  }

  getTranslatables(element, bundleName) {
    const query = bundleName === 'main' ?
      '[data-l10n-bundle="main"], [data-l10n-id]:not([data-l10n-bundle])' :
      `[data-l10n-bundle=${bundleName}]`;
    const nodes = Array.from(element.querySelectorAll(query));

    if (typeof element.hasAttribute === 'function' &&
        element.hasAttribute('data-l10n-id')) {
      const elemBundleName = element.getAttribute('data-l10n-bundle');
      if (elemBundleName === null || elemBundleName === bundleName) {
        nodes.push(element);
      }
    }

    return nodes;
  }

  getKeysForElement(element) {
    return [
      element.getAttribute('data-l10n-id'),
      // In XUL documents missing attributes return `''` here which breaks
      // JSON.parse.  HTML documents return `null`.
      JSON.parse(element.getAttribute('data-l10n-args') || null)
    ];
  }
}

const HTTP_STATUS_CODE_OK = 200;

function load(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain');
    }

    xhr.open('GET', url, true);

    xhr.addEventListener('load', e => {
      if (e.target.status === HTTP_STATUS_CODE_OK ||
          e.target.status === 0) {
        resolve(e.target.responseText);
      } else {
        reject(new Error(`${url} not found`));
      }
    });

    xhr.addEventListener('error',
      () => reject(new Error(`${url} failed to load`))
    );
    xhr.addEventListener('timeout',
      () => reject(new Error(`${url} timed out`))
    );

    xhr.send(null);
  });
}

function fetchResource(res, lang) {
  const url = res.replace('{locale}', lang);
  return load(url).catch(() => null);
}

class ResourceBundle {
  constructor(lang, resIds) {
    this.lang = lang;
    this.loaded = false;
    this.resIds = resIds;
  }

  fetch() {
    if (!this.loaded) {
      this.loaded = Promise.all(
        this.resIds.map(resId => fetchResource(resId, this.lang))
      );
    }

    return this.loaded;
  }
}

// A document.ready shim
// https://github.com/whatwg/html/issues/127
function documentReady() {
  const rs = document.readyState;
  // !important
  // if (rs === 'interactive' || rs === 'completed') {
  if (rs !== 'loading') {
    return Promise.resolve();
  }

  return new Promise(
    resolve => document.addEventListener(
      'readystatechange', resolve, { once: true }
    )
  );
}

function getResourceLinks(elem) {
  return Array.prototype.map.call(
    elem.querySelectorAll('link[rel="localization"]'),
    el => [el.getAttribute('href'), el.getAttribute('name') || 'main']
  ).reduce(
    (seq, [href, name]) => seq.set(name, (seq.get(name) || []).concat(href)),
    new Map()
  );
}

function getMeta(head) {
  let availableLangs = new Set();
  let defaultLang = null;
  let appVersion = null;

  // XXX take last found instead of first?
  const metas = Array.from(head.querySelectorAll(
    'meta[name="availableLanguages"],' +
    'meta[name="defaultLanguage"],' +
    'meta[name="appVersion"]')
  );
  for (const meta of metas) {
    const name = meta.getAttribute('name');
    const content = meta.getAttribute('content').trim();
    switch (name) {
      case 'availableLanguages':
        availableLangs = new Set(content.split(',').map(lang => {
          return lang.trim();
        }));
        break;
      case 'defaultLanguage':
        defaultLang = content;
        break;
      case 'appVersion':
        appVersion = content;
    }
  }

  return {
    defaultLang,
    availableLangs,
    appVersion
  };
}

function createContext(lang) {
  return new Intl.MessageContext(lang);
}

document.l10n = new LocalizationObserver();
window.addEventListener('languagechange', document.l10n);

documentReady().then(() => {
  const { defaultLang, availableLangs } = getMeta(document.head);
  for (const [name, resIds] of getResourceLinks(document.head)) {
    if (!document.l10n.has(name)) {
      createLocalization(name, resIds, defaultLang, availableLangs);
    }
  }
});

function createLocalization(name, resIds, defaultLang, availableLangs) {

  function requestBundles(
    requestedLangs = new Set(PrioritizeLocales(availableLangs,
      navigator.languages.slice(),defaultLang))) {
    const newLangs = prioritizeLocales(
      defaultLang, availableLangs, requestedLangs
    );

    const bundles = [];
    newLangs.forEach(lang => {
      bundles.push(new ResourceBundle(lang, resIds));
    });
    return Promise.resolve(bundles);
  }

  const l10n = new Localization(requestBundles, createContext);
  document.l10n.set(name, l10n);

  if (name === 'main') {
    const rootElem = document.documentElement;
    document.l10n.observeRoot(rootElem, l10n);
    document.l10n.translateRoot(rootElem, l10n);
  }
}

}