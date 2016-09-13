import './polyfill';
import '../../intl/polyfill';
import { prioritizeLocales, PrioritizeLocales } from '../../intl/locale';

import { ContentLocalizationObserver } from '../../lib/observer/content';
import { HTMLLocalization } from '../../lib/dom/html';

import { ResourceBundle } from './io';
import { documentReady, getResourceLinks, getMeta } from './util';

function createContext(lang) {
  return new Intl.MessageContext(lang);
}

document.l10n = new ContentLocalizationObserver();
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
  const langs = PrioritizeLocales(availableLangs,navigator.languages.slice(),
  defaultLang);

  function requestBundles(requestedLangs = new Set(langs)) {
    const newLangs = prioritizeLocales(
      defaultLang, availableLangs, requestedLangs
    );

    const bundles = [];
    newLangs.forEach(lang => {
      bundles.push(new ResourceBundle(lang, resIds));
    });
    return Promise.resolve(bundles);
  }

  const l10n = new HTMLLocalization(requestBundles, createContext);
  document.l10n.set(name, l10n);

  if (name === 'main') {
    const rootElem = document.documentElement;
    document.l10n.observeRoot(rootElem, l10n);
    document.l10n.translateRoot(rootElem, l10n);
  }
}
