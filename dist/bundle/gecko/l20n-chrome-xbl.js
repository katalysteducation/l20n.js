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
        formatted.attrs[trait.key.name] = attr;
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
 *
 * `HTMLLocalization` and `XULLocalization` extend `Localization` and provide
 * `document`-specific methods for sanitizing translations containing markup
 * before they're inserted into the DOM.
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

// Match the opening angle bracket (<) in HTML tags, and HTML entities like
// &amp;, &#0038;, &#x0026;.
const reOverlay = /<|&#?\w+;/;

/**
 * Overlay translation onto a DOM element.
 *
 * @param   {Localization} l10n
 * @param   {Element}      element
 * @param   {string}       translation
 * @private
 */
function overlayElement(l10n, element, translation) {
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
      overlay(l10n, element, tmpl.content);
    }
  }

  for (const key in translation.attrs) {
    if (l10n.isAttrAllowed({ name: key }, element)) {
      element.setAttribute(key, translation.attrs[key]);
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
function overlay(l10n, sourceElement, translationElement) {
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
      overlay(l10n, sourceChild, childElement);
      result.appendChild(sourceChild);
      continue;
    }

    if (l10n.isElementAllowed(childElement)) {
      const sanitizedChild = childElement.ownerDocument.createElement(
        childElement.nodeName);
      overlay(l10n, sanitizedChild, childElement);
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
      if (l10n.isAttrAllowed(attr, sourceElement)) {
        sourceElement.setAttribute(attr.name, attr.value);
      }
    }
  }
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

const ns = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

const allowed = {
  attributes: {
    global: [
      'accesskey', 'aria-label', 'aria-valuetext', 'aria-moz-hint', 'label'
    ],
    key: ['key', 'keycode'],
    textbox: ['placeholder'],
    toolbarbutton: ['tooltiptext'],
  }
};

/**
 * The XUL-specific Localization class.
 *
 * @extends Localization
 *
 */
class XULLocalization extends Localization {
  /**
   * Overlay a DOM element using markup from a translation.
   *
   * @param {Element} element
   * @param {string}  translation
   * @private
   */
  overlayElement(element, translation) {
    return overlayElement(this, element, translation);
  }

  /**
   * Check if element is allowed in this `Localization`'s document namespace.
   *
   * Always returns `false` for XUL elements.
   *
   * @returns {boolean}
   * @private
   */
  isElementAllowed() {
    return false;
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
  isAttrAllowed(attr, element) {
    // Bail if it isn't even a XUL element.
    if (element.namespaceURI !== ns) {
      return false;
    }

    const tagName = element.localName;
    const attrName = attr.name;

    // Is it a globally safe attribute?
    if (allowed.attributes.global.indexOf(attrName) !== -1) {
      return true;
    }

    // Are there no allowed attributes for this element?
    if (!allowed.attributes[tagName]) {
      return false;
    }

    // Is it allowed on this element?
    // XXX The allowed list should be amendable; https://bugzil.la/922573
    if (allowed.attributes[tagName].indexOf(attrName) !== -1) {
      return true;
    }

    return false;
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

this.EXPORTED_SYMBOLS = ['createLocalization', 'destroyLocalization'];

Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource://gre/modules/L10nRegistry.jsm');
Components.utils.import('resource://gre/modules/IntlMessageContext.jsm');

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

function createContext(lang) {
  return new MessageContext(lang, { functions });
}

function getRequestedLangs() {
  return Services.prefs.getComplexValue(
    'intl.accept_languages', Components.interfaces.nsIPrefLocalizedString
  ).data.split(',').map(String.trim);
}

function createLocalization(name, resIds, host, obs) {
  if (!obs.has(name)) {
    function requestBundles(requestedLangs = getRequestedLangs()) {
      return L10nRegistry.getResources(requestedLangs, resIds).then(
        ({bundles}) => bundles.map(
          bundle => new ChromeResourceBundle(bundle.locale, bundle.resources)
        )
      );
    }

    const l10n = new XULLocalization(requestBundles, createContext);
    obs.set(name, l10n);
  }

  const l10n = obs.get(name);
  obs.observeRoot(host, l10n);
  obs.translateRoot(host, l10n);
}

function destroyLocalization(name, host, obs) {
  obs.disconnectRoot(host);
}

this.createLocalization = createLocalization;
this.destroyLocalization = destroyLocalization;

}
