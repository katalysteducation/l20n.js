export function prioritizeLocales(def, availableLangs, requested) {
  const supportedLocales = new Set();
  for (const lang of requested) {
    if (availableLangs.has(lang)) {
      supportedLocales.add(lang);
    }
  }

  supportedLocales.add(def);
  return supportedLocales;
}

export function getDirection(code) {
  const tag = code.split('-')[0];
  return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ?
    'rtl' : 'ltr';
}

export function CanonicalizeLocaleList(locales) {
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

export function PrioritizeLocales(availableLocales,
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
      result[i] = `${array[0]} - ${array[1].toUpperCase()}`;
    }
  }

  return result;
}

export function LookupAvailableLocales(availableLocales, requestedLocales) {
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

export function BestAvailableLocale(availableLocales, locale) {
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
