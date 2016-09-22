import { keysFromContext, valueFromContext, entityFromContext }
  from '../format';

export const properties = new WeakMap();
export const contexts = new WeakMap();

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
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
>>>>>>> Stashed changes
export class Localization {
  constructor(requestBundles, createContext) {
    this.interactive = requestBundles().then(
      bundles => fetchFirstBundle(bundles, createContext)
    );

    properties.set(this, {
      requestBundles, createContext
    });
<<<<<<< Updated upstream
=======

    /**
     * A Promise which resolves when the `Localization` instance has fetched
     * and parsed all localization resources in the user's first preferred
     * language (if available).
     *
     *     localization.interactive.then(callback);
     */
=======
export class Localization {
  constructor(requestBundles, createContext) {
>>>>>>> parent of 95d06e8... Marge with master of the l20n
    this.interactive = requestBundles().then(
      // Create a `MessageContext` for the first bundle right away.
      bundles => createHeadContext(bundles).then(
        // Force `this.interactive` to resolve to the list of bundles.
        () => bundles
      )
    );
>>>>>>> Stashed changes
  }

  requestLanguages(requestedLangs) {
    return this.interactive.then(
      bundles => changeLanguages(this, bundles, requestedLangs)
    );
  }

  formatWithFallback(bundles, keys, method, prev) {
    const ctx = contexts.get(bundles[0]);

    if (!ctx && prev) {
      return prev.translations;
    }

    const current = keysFromContext(ctx, keys, method, prev);

    if (!current.hasErrors) {
      return current.translations;
    }

    if (typeof console !== 'undefined') {
      current.errors.forEach(
        errs => errs.forEach(
          e => console.warn(e) // eslint-disable-line no-console
        )
      );
    }

    const { createContext } = properties.get(this);
    return fetchFirstBundle(bundles.slice(1), createContext).then(
      tailBundles => this.formatWithFallback(
        tailBundles, keys, method, current
      )
    );
  }

  formatEntities(keys) {
    return this.interactive.then(
      bundles => this.formatWithFallback(bundles, keys, entityFromContext)
    );
  }

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
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
=======
>>>>>>> parent of 95d06e8... Marge with master of the l20n
>>>>>>> Stashed changes
  formatValues(...keys) {
    const keyTuples = keys.map(
      key => Array.isArray(key) ? key : [key, null]
    );
    return this.interactive.then(
      bundles => this.formatWithFallback(bundles, keyTuples, valueFromContext)
    );
  }

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
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
=======
>>>>>>> parent of 95d06e8... Marge with master of the l20n
>>>>>>> Stashed changes
  formatValue(id, args) {
    return this.formatValues([id, args]).then(
      ([val]) => val
    );
  }

}

function createContextFromBundle(bundle, createContext) {
  return bundle.fetch().then(resources => {
    const ctx = createContext(bundle.lang);
    resources
      .filter(res => res !== null)
      .forEach(res => ctx.addMessages(res));
    contexts.set(bundle, ctx);
    return ctx;
  });
}

export function fetchFirstBundle(bundles, createContext) {
  const [bundle] = bundles;

  if (!bundle) {
    return Promise.resolve(bundles);
  }

  return createContextFromBundle(bundle, createContext).then(
    () => bundles
  );
}

function changeLanguages(l10n, oldBundles, requestedLangs) {
  const { requestBundles, createContext } = properties.get(l10n);

  return l10n.interactive = requestBundles(requestedLangs).then(
    newBundles => equal(oldBundles, newBundles) ?
      oldBundles : fetchFirstBundle(newBundles, createContext)
  );
}

function equal(bundles1, bundles2) {
  return bundles1.length === bundles2.length &&
    bundles1.every(({lang}, i) => lang === bundles2[i].lang);
}
