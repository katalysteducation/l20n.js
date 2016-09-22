import { ChromeLocalizationObserver } from '../../lib/observer/chrome';
import { XULLocalization } from '../../lib/dom/xul';

import { ChromeResourceBundle } from './io';
import { XULDocumentReady, getResourceLinks, createObserve } from './util';

Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource://gre/modules/L10nRegistry.jsm');
Components.utils.import('resource://gre/modules/IntlMessageContext.jsm');

// List of functions passed to `MessageContext` that will be available
// from within the localization entities.
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

// This function is provided to the constructor of `Localization` object
// and is used to create new `MessageContext` objects for a given `lang`
// with selected builtin functions.

function createContext(lang) {
  return new MessageContext(lang, { functions });
}

// This is the initial running code of l20n.js
// We create a new  `ChromeLocalizationObserver` and define an event
// listener for `languagechange` on it.
document.l10n = new ChromeLocalizationObserver();
window.addEventListener('languagechange', document.l10n);

// Next, we collect all l10n resource links, create new `Localization`
// objects and bind them to the `LocalizationObserver` instance.
for (const [name, resIds] of getResourceLinks(document)) {
  if (!document.l10n.has(name)) {
    createLocalization(name, resIds);
  }
}

function createLocalization(name, resIds) {
  // This function is called by `Localization` class to
  // retrieve `ResourceBundle`.
  //
  // In chrome-privileged setup we're using `L10nRegistry` for that.
  function requestBundles(requestedLangs = navigator.languages) {
    return L10nRegistry.getResources(requestedLangs, resIds).then(
      ({bundles}) => bundles.map(
        bundle => new ChromeResourceBundle(bundle.locale, bundle.resources)
      )
    );
  }

  const l10n = new XULLocalization(requestBundles, createContext);

  // This creates nsIObserver's observe method bound to `LocalizationObserver`
  l10n.observe = createObserve(document.l10n);

  // This adds observer handlers on our custom events that will
  // be triggered when L10nRegistry notifies on resource updates.
  window.addEventListener('load', () => {
    Services.obs.addObserver(l10n, 'language-registry-update', false);
    Services.obs.addObserver(l10n, 'language-registry-incremental', false);
  });

  window.addEventListener('unload', () => {
    Services.obs.removeObserver(l10n, 'language-registry-update');
    Services.obs.removeObserver(l10n, 'language-registry-incremental');
  });

  document.l10n.set(name, l10n);

  if (name === 'main') {
    // When document is ready, we trigger it's localization and
    // initialize `MutationObserver` on the root.
    XULDocumentReady().then(() => {
      const rootElem = document.documentElement;
      document.l10n.observeRoot(rootElem, l10n);
      document.l10n.translateRoot(rootElem, l10n);
    });
  }
}
