{

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
  const current = {
    errors: new Array(keys.length),
    hasErrors: false
  };

  current.translations = keys.map((key, i) => {
    if (prev && !prev.errors[i]) {
      // Use a previously formatted good value if there were no errors
      return prev.translations[i];
    }

    const args = sanitizeArgs(key[1]);
    const translation = method(ctx, entityErrors, key[0], args);
    if (entityErrors.length) {
      current.errors[i] = entityErrors.slice();
      entityErrors.length = 0;
      if (!current.hasErrors) {
        current.hasErrors = true;
      }
    }

    return translation;
  });

  return current;
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
    formatted.attrs = Object.create(null);
    for (let i = 0, trait; (trait = entity.traits[i]); i++) {
      const attr = ctx.format(trait, args, errors);
      if (attr !== null) {
        const key =
          trait.key.ns ? `${trait.key.ns}/${trait.key.name}` : trait.key.name;
        formatted.attrs[key] = attr;
      }
    }
  }

  return formatted;
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
      )
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
    if (!ctx && prev) {
      return prev.translations;
    }

    const current = method(ctx, keys, prev);

    // `hasErrors` is a flag set by `keysFromContext` to notify about errors
    // during the formatting.  We can't just check the `length` of the `errors`
    // property because it is fixed and equal to the length of `keys`.
    if (!current.hasErrors) {
      return current.translations;
    }

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
const FSI = '\u2068';
const PDI = '\u2069';

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
      args[name] = `${FSI}${value}${PDI}`;
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

function getDirection(code) {
  const tag = code.split('-')[0];
  return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ?
    'rtl' : 'ltr';
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
    )
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
          this.observer.observe(root, observerConfig)
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

class ChromeResourceBundle {
  constructor(lang, resources) {
    this.lang = lang;
    this.loaded = false;
    this.resources = resources;

    const data = Object.keys(resources).map(
      resId => resources[resId].data
    );

    if (data.every(d => d !== null)) {
      this.loaded = Promise.resolve(data);
    }
  }

  fetch() {
    if (!this.loaded) {
      this.loaded = Promise.all(
        Object.keys(this.resources).map(resId => {
          const { source, locale } = this.resources[resId];
          return L10nRegistry.fetchResource(source, resId, locale);
        })
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

Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource://gre/modules/L10nRegistry.jsm');
Components.utils.import('resource://gre/modules/IntlMessageContext.jsm');

// List of functions passed to `MessageContext` that will be available from
// within the localization entities.
//
// Example use (in FTL):
//
// open-settings = {OS() ->
//   [mac] Open Preferences
//  *[other] Open Settings
// }
const functions = {
  OS: function() {
    switch (Services.appinfo.OS) {
      case 'WINNT':
        return 'win';
      case 'Linux':
        return 'lin';
      case 'Darwin':
        return 'mac';
      case 'Android':
        return 'android';
      default:
        return 'other';
    }
  }
};

// This function is provided to the constructor of `Localization` object and is
// used to create new `MessageContext` objects for a given `lang` with selected
// builtin functions.
function createContext(lang) {
  return new MessageContext(lang, { functions });
}

// Following is the initial running code of l20n.js

// We create a new  `LocalizationObserver` and define an event listener
// for `languagechange` on it.
document.l10n = new LocalizationObserver();
window.addEventListener('languagechange', document.l10n);

// Next, we collect all l10n resource links, create new `Localization` objects
// and bind them to the `LocalizationObserver` instance.
for (const [name, resIds] of getResourceLinks(document.head || document)) {
  if (!document.l10n.has(name)) {
    createLocalization(name, resIds);
  }
}

function createLocalization(name, resIds) {
  // This function is called by `Localization` class to retrieve an array of
  // `ResourceBundle`s. In chrome-privileged setup we use the `L10nRegistry` to
  // get this array.
  function requestBundles(requestedLangs = navigator.languages) {
    return L10nRegistry.getResources(requestedLangs, resIds).then(
      ({bundles}) => bundles.map(
        bundle => new ChromeResourceBundle(bundle.locale, bundle.resources)
      )
    );
  }

  const l10n = new Localization(requestBundles, createContext);
  document.l10n.set(name, l10n);

  if (name === 'main') {
    // When document is ready, we trigger it's localization and initialize
    // `MutationObserver` on the root.
    documentReady().then(() => {
      const rootElem = document.documentElement;
      document.l10n.observeRoot(rootElem, l10n);
      document.l10n.translateRoot(rootElem, l10n);
    });
  }
}

}
