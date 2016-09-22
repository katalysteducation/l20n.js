import { getDirection } from '../../intl/locale';

const reHtml = /[&<>]/g;
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

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
export class LocalizationObserver {
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
   * Test if the `Localization` object with a given name is already bind.
   * See [docs/localization] for `Localization`'s API reference.'
   *
   * ```javascript
   * if (document.l10n.has('extra')) {
   *   const extraLocalization = document.l10n.get('extra');
   * }
   * ```
   * @param   {String} name - key for the object
   * @returns {Bool}
   */
  has(name) {
    return this.localizations.has(name);
  }

  /**
   * Retrieve a reference to the `Localization` object associated with the name
   * `name`.  See [docs/localization] for `Localization`'s API reference.

   * ```javascript
   * const mainLocalization = document.l10n.get('main');
   * const extraLocalization = document.l10n.get('extra');
   * ```
   *
   * @param   {String}        name - key for the object
   * @returns {Localization}
   */
  get(name) {
    return this.localizations.get(name);
  }

  /**
   * Sets a reference to the `Localization` object associated with the name
   * `name`.  See [docs/localization] for `Localization`'s API reference.

   * ```javascript
   * const loc = new Localization();
   * document.l10n.set('extra', loc);
   * ```
   *
   * @param   {String}       name - key for the object
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
   * Trigger the language negotation process with an array of `langCodes`.
   * Returns a promise with the negotiated array of language objects as above.
   *
   * ```javascript
   * document.l10n.requestLanguages(['de-DE', 'de', 'en-US']);
   * ```
   *
   * @param   {String[]}          requestedLangs - array of requested languages
   * @returns {Promise<String[]>}
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
   * @param {HTMLElement}             element - Element to set attributes on
   * @param {String}                  id      - l10n-id string
   * @param {Object<String,  String>} args    - KVP list of l10n arguments
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
   * @param {HTMLElement}  element - HTML element
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
   * @param {HTMLElement}  root - Root element
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
   * @param {HTMLElement} root - Root element
   * @returns {Bool}
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
   * @param  {DOMFragment} frag - DOMFragment to be translated
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
      translations => this.applyTranslations(l10n, elements, translations)
    );
  }

  /**
   * Translates a single DOM node asynchronously.
   *
   * Returns a `Promise` that gets resolved once the translation is complete.
   *
   * @param  {HTMLElement} element - HTML element to be translated
   * @returns {Promise}
   */
  translateElement(element) {
    const l10n = this.get(element.getAttribute('data-l10n-bundle') || 'main');
    return l10n.formatEntities([this.getKeysForElement(element)]).then(
      translations => this.applyTranslations(l10n, [element], translations)
    );
  }

  applyTranslations(l10n, elements, translations) {
    this.pause();
    for (let i = 0; i < elements.length; i++) {
      l10n.overlayElement(elements[i], translations[i]);
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
    const id = element.getAttribute('data-l10n-id');
    const args = element.getAttribute('data-l10n-args');
    const escapedArgs = args ?
      JSON.parse(args.replace(reHtml, match => htmlEntities[match])) : null;
    return [id, escapedArgs];
  }
}
