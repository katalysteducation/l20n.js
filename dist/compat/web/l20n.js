'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

{
  (function () {

    // utility functions for plural rules methods
    var isIn = function isIn(n, list) {
      return list.indexOf(n) !== -1;
    };

    var isBetween = function isBetween(n, start, end) {
      return (typeof n === 'undefined' ? 'undefined' : _typeof(n)) === (typeof start === 'undefined' ? 'undefined' : _typeof(start)) && start <= n && n <= end;
    };

    // list of all plural rules methods:
    // map an integer to the plural form name to use


    var getPluralRule = function getPluralRule(code) {
      // return a function that gives the plural form name for a given integer
      var index = locales2rules[code.replace(/-.*$/, '')];
      if (!(index in pluralRules)) {
        return function () {
          return 'other';
        };
      }
      return pluralRules[index];
    };

    /**
     * An `L10nError` with information about language and entity ID in which
     * the error happened.
     */


    var merge = function merge(argopts, opts) {
      return Object.assign({}, argopts, valuesOf(opts));
    };

    var valuesOf = function valuesOf(opts) {
      return Object.keys(opts).reduce(function (seq, cur) {
        var _Object$assign;

        return Object.assign({}, seq, (_Object$assign = {}, _Object$assign[cur] = opts[cur].valueOf(), _Object$assign));
      }, {});
    };

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


    /**
     * Map an array of JavaScript values into FTL Values.
     *
     * Used for external arguments of Array type and for implicit Lists in
     * placeables.
     *
     * @private
     */
    var mapValues = function mapValues(env, arr) {
      var values = new FTLList();
      for (var _iterator = arr, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref7;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref7 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref7 = _i.value;
        }

        var elem = _ref7;

        values.push(Value(env, elem));
      }
      return values;
    };

    /**
     * Helper for choosing the default value from a set of members.
     *
     * Used in SelectExpressions and Value.
     *
     * @private
     */


    var DefaultMember = function DefaultMember(env, members, def) {
      if (members[def]) {
        return members[def];
      }

      var errors = env.errors;

      errors.push(new RangeError('No default'));
      return new FTLNone();
    };

    /**
     * Resolve a reference to an entity to the entity object.
     *
     * @private
     */


    var EntityReference = function EntityReference(env, _ref8) {
      var name = _ref8.name;
      var ctx = env.ctx,
          errors = env.errors;

      var entity = ctx.messages.get(name);

      if (!entity) {
        errors.push(new ReferenceError('Unknown entity: ' + name));
        return new FTLNone(name);
      }

      return entity;
    };

    /**
     * Resolve a member expression to the member object.
     *
     * @private
     */


    var MemberExpression = function MemberExpression(env, _ref9) {
      var obj = _ref9.obj,
          key = _ref9.key;

      var entity = EntityReference(env, obj);
      if (entity instanceof FTLNone) {
        return entity;
      }

      var ctx = env.ctx,
          errors = env.errors;

      var keyword = Value(env, key);

      if (entity.traits) {
        // Match the specified key against keys of each trait, in order.
        for (var _iterator2 = entity.traits, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref10;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref10 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref10 = _i2.value;
          }

          var member = _ref10;

          var memberKey = Value(env, member.key);
          if (keyword.match(ctx, memberKey)) {
            return member;
          }
        }
      }

      errors.push(new ReferenceError('Unknown trait: ' + keyword.toString(ctx)));
      return Value(env, entity);
    };

    /**
     * Resolve a select expression to the member object.
     *
     * @private
     */


    var SelectExpression = function SelectExpression(env, _ref11) {
      var exp = _ref11.exp,
          vars = _ref11.vars,
          def = _ref11.def;

      var selector = Value(env, exp);
      if (selector instanceof FTLNone) {
        return DefaultMember(env, vars, def);
      }

      // Match the selector against keys of each variant, in order.
      for (var _iterator3 = vars, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref12;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref12 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref12 = _i3.value;
        }

        var variant = _ref12;

        var key = Value(env, variant.key);

        // XXX A special case of numbers to avoid code repetition in types.js.
        if (key instanceof FTLNumber && selector instanceof FTLNumber && key.valueOf() === selector.valueOf()) {
          return variant;
        }

        var _ctx = env.ctx;


        if (key instanceof FTLKeyword && key.match(_ctx, selector)) {
          return variant;
        }
      }

      return DefaultMember(env, vars, def);
    };

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


    var Value = function Value(env, expr) {
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
        case 'ref':
          {
            var entity = EntityReference(env, expr);
            return Value(env, entity);
          }
        case 'mem':
          {
            var member = MemberExpression(env, expr);
            return Value(env, member);
          }
        case 'sel':
          {
            var _member = SelectExpression(env, expr);
            return Value(env, _member);
          }
        case undefined:
          {
            // If it's a node with a value, resolve the value.
            if (expr.val !== undefined) {
              return Value(env, expr.val);
            }

            var def = DefaultMember(env, expr.traits, expr.def);
            return Value(env, def);
          }
        default:
          return new FTLNone();
      }
    };

    /**
     * Resolve a reference to an external argument.
     *
     * @private
     */


    var ExternalArgument = function ExternalArgument(env, _ref13) {
      var name = _ref13.name;
      var args = env.args,
          errors = env.errors;


      if (!args || !args.hasOwnProperty(name)) {
        errors.push(new ReferenceError('Unknown external: ' + name));
        return new FTLNone(name);
      }

      var arg = args[name];

      if (arg instanceof FTLType) {
        return arg;
      }

      // Convert the argument to an FTL type.
      switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
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
          errors.push(new TypeError('Unsupported external type: ' + name + ', ' + (typeof arg === 'undefined' ? 'undefined' : _typeof(arg))));
          return new FTLNone(name);
      }
    };

    /**
     * Resolve a reference to a function.
     *
     * @private
     */


    var FunctionReference = function FunctionReference(env, _ref14) {
      var name = _ref14.name;

      // Some functions are built-in.  Others may be provided by the runtime via
      // the `MessageContext` constructor.
      var functions = env.ctx.functions,
          errors = env.errors;

      var func = functions[name] || builtins[name];

      if (!func) {
        errors.push(new ReferenceError('Unknown function: ' + name + '()'));
        return new FTLNone(name + '()');
      }

      if (typeof func !== 'function') {
        errors.push(new TypeError('Function ' + name + '() is not callable'));
        return new FTLNone(name + '()');
      }

      return func;
    };

    /**
     * Resolve a call to a Function with positional and key-value arguments.
     *
     * @private
     */


    var CallExpression = function CallExpression(env, _ref15) {
      var name = _ref15.name,
          args = _ref15.args;

      var callee = FunctionReference(env, name);

      if (callee instanceof FTLNone) {
        return callee;
      }

      var posargs = [];
      var keyargs = [];

      for (var _iterator4 = args, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
        var _ref16;

        if (_isArray4) {
          if (_i4 >= _iterator4.length) break;
          _ref16 = _iterator4[_i4++];
        } else {
          _i4 = _iterator4.next();
          if (_i4.done) break;
          _ref16 = _i4.value;
        }

        var _arg = _ref16;

        if (_arg.type === 'kv') {
          keyargs[_arg.name] = Value(env, _arg.val);
        } else {
          posargs.push(Value(env, _arg));
        }
      }

      // XXX functions should also report errors
      return callee(posargs, keyargs);
    };

    /**
     * Resolve a pattern (a complex string with placeables).
     *
     * @private
     */


    var Pattern = function Pattern(env, ptn) {
      var ctx = env.ctx,
          dirty = env.dirty,
          errors = env.errors;


      if (dirty.has(ptn)) {
        errors.push(new RangeError('Cyclic reference'));
        return new FTLNone();
      }

      // Tag the pattern as dirty for the purpose of the current resolution.
      dirty.add(ptn);
      var result = '';

      for (var _iterator5 = ptn, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref17;

        if (_isArray5) {
          if (_i5 >= _iterator5.length) break;
          _ref17 = _iterator5[_i5++];
        } else {
          _i5 = _iterator5.next();
          if (_i5.done) break;
          _ref17 = _i5.value;
        }

        var part = _ref17;

        if (typeof part === 'string') {
          result += part;
        } else {
          // Optimize the most common case: the placeable only has one expression.
          // Otherwise map its expressions to Values.
          var value = part.length === 1 ? Value(env, part[0]) : mapValues(env, part);

          var str = value.toString(ctx);
          if (str.length > MAX_PLACEABLE_LENGTH) {
            errors.push(new RangeError('Too many characters in placeable ' + ('(' + str.length + ', max allowed is ' + MAX_PLACEABLE_LENGTH + ')')));
            result += str.substr(0, MAX_PLACEABLE_LENGTH);
          } else {
            result += str;
          }
        }
      }

      dirty.delete(ptn);
      return result;
    };

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


    var resolve = function resolve(ctx, args, entity) {
      var errors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      var env = {
        ctx: ctx, args: args, errors: errors, dirty: new WeakSet()
      };
      return Value(env, entity);
    };

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


    var prioritizeLocales = function prioritizeLocales(def, availableLangs, requested) {
      var supportedLocales = new Set();
      for (var _iterator6 = requested, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
        var _ref18;

        if (_isArray6) {
          if (_i6 >= _iterator6.length) break;
          _ref18 = _iterator6[_i6++];
        } else {
          _i6 = _iterator6.next();
          if (_i6.done) break;
          _ref18 = _i6.value;
        }

        var lang = _ref18;

        if (availableLangs.has(lang)) {
          supportedLocales.add(lang);
        }
      }

      supportedLocales.add(def);
      return supportedLocales;
    };

    var getDirection = function getDirection(code) {
      var tag = code.split('-')[0];
      return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ? 'rtl' : 'ltr';
    };

    var CanonicalizeLocaleList = function CanonicalizeLocaleList(locales) {
      if (locales === undefined) {
        return [];
      }
      var seen = [];
      if (typeof locales === 'string') {
        locales = [locales];
      }
      var O = locales;
      var len = O.length;
      var k = 0;
      while (k < len) {
        var tag = O[k];
        tag = tag.toLowerCase();
        if (seen.indexOf(tag) === -1) {
          seen.push(tag);
        }
        k++;
      }
      return seen;
    };

    var PrioritizeLocales = function PrioritizeLocales(availableLocales, requestedLocales, defaultLocale) {

      var array = new Array();
      if ((typeof availableLocales === 'undefined' ? 'undefined' : _typeof(availableLocales)) === 'object') {
        var iter = availableLocales.values();
        for (var z = 0; z < availableLocales.size; z++) {
          array.push(iter.next().value);
        }
      } else {
        array = availableLocales.slice();
      }

      availableLocales = CanonicalizeLocaleList(array);
      requestedLocales = CanonicalizeLocaleList(requestedLocales);

      var result = LookupAvailableLocales(availableLocales, requestedLocales);
      if (defaultLocale) {
        // if default locale is not present in result,
        // add it to the end of fallback chain
        defaultLocale = defaultLocale.toLowerCase();
        if (result.indexOf(defaultLocale) === -1) {
          result.push(defaultLocale);
        }
      }

      for (var i = 0; i < result.length; i++) {
        array = result[i].split('-');
        if (array.length === 2) {
          result[i] = array[0] + ' - ' + array[1].toUpperCase();
        }
      }

      return result;
    };

    var LookupAvailableLocales = function LookupAvailableLocales(availableLocales, requestedLocales) {
      // Steps 1-2.
      var len = requestedLocales.length;
      var subset = [];

      // Steps 3-4.
      var k = 0;
      while (k < len) {
        // Steps 4.a-b.
        var locale = requestedLocales[k];

        // Step 4.c-d.
        var availableLocale = BestAvailableLocale(availableLocales, locale);
        if (availableLocale !== undefined) {
          // in LookupSupportedLocales it pushes locale here
          subset.push(availableLocale);
        }
        // Step 4.e.
        k++;
      }

      // Steps 5-6.
      return subset.slice(0);
    };

    var BestAvailableLocale = function BestAvailableLocale(availableLocales, locale) {
      var candidate = locale;
      while (true) {
        if (availableLocales.indexOf(candidate) !== -1) {
          return candidate;
        }
        var pos = candidate.lastIndexOf('-');
        if (pos === -1) {
          return undefined;
        }
        if (pos >= 2 && candidate[pos - 2] === '-') {
          pos -= 2;
        }
        candidate = candidate.substring(0, pos);
      }
    };

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


    var keysFromContext = function keysFromContext(method, sanitizeArgs, ctx, keys, prev) {
      var entityErrors = [];
      var current = {
        errors: new Array(keys.length),
        hasErrors: false
      };

      current.translations = keys.map(function (key, i) {
        if (prev && !prev.errors[i]) {
          // Use a previously formatted good value if there were no errors
          return prev.translations[i];
        }

        var args = sanitizeArgs(key[1]);
        var translation = method(ctx, entityErrors, key[0], args);
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
    };

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


    var valueFromContext = function valueFromContext(ctx, errors, id, args) {
      var entity = ctx.messages.get(id);

      if (entity === undefined) {
        errors.push(new L10nError('Unknown entity: ' + id));
        return id;
      }

      return ctx.format(entity, args, errors);
    };

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


    var entityFromContext = function entityFromContext(ctx, errors, id, args) {
      var entity = ctx.messages.get(id);

      if (entity === undefined) {
        errors.push(new L10nError('Unknown entity: ' + id));
        return { value: id, attrs: null };
      }

      var formatted = {
        value: ctx.format(entity, args, errors),
        attrs: null
      };

      if (entity.traits) {
        formatted.attrs = Object.create(null);
        for (var i = 0, trait; trait = entity.traits[i]; i++) {
          var attr = ctx.format(trait, args, errors);
          if (attr !== null) {
            var key = trait.key.ns ? trait.key.ns + '/' + trait.key.name : trait.key.name;
            formatted.attrs[key] = attr;
          }
        }
      }

      return formatted;
    };

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
    var createHeadContextWith = function createHeadContextWith(createContext, bundles) {
      var bundle = bundles[0];


      if (!bundle) {
        return Promise.resolve(null);
      }

      return bundle.fetch().then(function (resources) {
        var ctx = createContext(bundle.lang);
        resources
        // Filter out resources which failed to load correctly (e.g. 404).
        .filter(function (res) {
          return res !== null;
        }).forEach(function (res) {
          return ctx.addMessages(res);
        });
        // Save the reference to the context.
        contexts.set(bundle, ctx);
        return ctx;
      });
    };

    /**
     *
     * Test if two fallback chains are functionally the same.
     *
     * @param   {Array<ResourceBundle>} bundles1
     * @param   {Array<ResourceBundle>} bundles2
     * @returns {boolean}
     * @private
     */


    var equal = function equal(bundles1, bundles2) {
      return bundles1.length === bundles2.length && bundles1.every(function (_ref21, i) {
        var lang = _ref21.lang;
        return lang === bundles2[i].lang;
      });
    };

    // A regexp to sanitize HTML tags and entities.


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
    var sanitizeArgs = function sanitizeArgs(args) {
      for (var name in args) {
        var _arg2 = args[name];
        if (typeof _arg2 === 'string') {
          var value = _arg2.replace(reHtml, function (match) {
            return htmlEntities[match];
          });
          args[name] = '' + FSI + value + PDI;
        }
      }
      return args;
    };

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


    var entitiesFromContext = function entitiesFromContext(ctx, keys, prev) {
      return keysFromContext(entityFromContext, sanitizeArgs, ctx, keys, prev);
    };

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


    var valuesFromContext = function valuesFromContext(ctx, keys, prev) {
      return keysFromContext(valueFromContext, sanitizeArgs, ctx, keys, prev);
    };

    // Match the opening angle bracket (<) in HTML tags, and HTML entities like
    // &amp;, &#0038;, &#x0026;.


    /**
     * Overlay translation onto a DOM element.
     *
     * @param   {Element}      element
     * @param   {string}       translation
     * @private
     */
    var overlayElement = function overlayElement(element, translation) {
      var value = translation.value;

      if (typeof value === 'string') {
        if (!reOverlay.test(value)) {
          // If the translation doesn't contain any markup skip the overlay logic.
          element.textContent = value;
        } else {
          // Else start with an inert template element and move its children into
          // `element` but such that `element`'s own children are not replaced.
          var tmpl = element.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'template');
          tmpl.innerHTML = value;
          // Overlay the node with the DocumentFragment.
          overlay(element, tmpl.content);
        }
      }

      for (var key in translation.attrs) {
        var _ref22 = key.includes('/') ? key.split('/', 2) : [null, key],
            ns = _ref22[0],
            name = _ref22[1];

        if (isAttrAllowed({ ns: ns, name: name }, element)) {
          element.setAttribute(name, translation.attrs[key]);
        }
      }
    };

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


    var overlay = function overlay(sourceElement, translationElement) {
      var result = translationElement.ownerDocument.createDocumentFragment();
      var k = void 0,
          attr = void 0;

      // Take one node from translationElement at a time and check it against
      // the allowed list or try to match it with a corresponding element
      // in the source.
      var childElement = void 0;
      while (childElement = translationElement.childNodes[0]) {
        translationElement.removeChild(childElement);

        if (childElement.nodeType === childElement.TEXT_NODE) {
          result.appendChild(childElement);
          continue;
        }

        var _index = getIndexOfType(childElement);
        var sourceChild = getNthElementOfType(sourceElement, childElement, _index);
        if (sourceChild) {
          // There is a corresponding element in the source, let's use it.
          overlay(sourceChild, childElement);
          result.appendChild(sourceChild);
          continue;
        }

        if (isElementAllowed(childElement)) {
          var sanitizedChild = childElement.ownerDocument.createElement(childElement.nodeName);
          overlay(sanitizedChild, childElement);
          result.appendChild(sanitizedChild);
          continue;
        }

        // Otherwise just take this child's textContent.
        result.appendChild(translationElement.ownerDocument.createTextNode(childElement.textContent));
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
        for (k = 0, attr; attr = translationElement.attributes[k]; k++) {
          if (isAttrAllowed({
            ns: DOM_NAMESPACES[translationElement.namespaceURI],
            name: attr.name
          }, sourceElement)) {
            sourceElement.setAttribute(attr.name, attr.value);
          }
        }
      }
    };

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


    var isElementAllowed = function isElementAllowed(element) {
      var allowed = ALLOWED_ELEMENTS[element.namespaceURI];
      if (!allowed) {
        return false;
      }

      return allowed.indexOf(element.tagName.toLowerCase()) !== -1;
    };

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


    var isAttrAllowed = function isAttrAllowed(attr, element) {
      // Does it have a namespace that matches the element's?
      if (attr.ns === null || DOM_NAMESPACES[attr.ns] !== element.namespaceURI) {
        return false;
      }
      var allowed = ALLOWED_ATTRIBUTES[element.namespaceURI];
      if (!allowed) {
        return false;
      }

      var attrName = attr.name.toLowerCase();
      var elemName = element.tagName.toLowerCase();

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
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml' && elemName === 'input' && attrName === 'value') {
        var type = element.type.toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'reset') {
          return true;
        }
      }

      return false;
    };

    // Get n-th immediate child of context that is of the same type as element.
    // XXX Use querySelector(':scope > ELEMENT:nth-of-type(index)'), when:
    // 1) :scope is widely supported in more browsers and 2) it works with
    // DocumentFragments.


    var getNthElementOfType = function getNthElementOfType(context, element, index) {
      var nthOfType = 0;
      for (var i = 0, _child; _child = context.children[i]; i++) {
        if (_child.nodeType === _child.ELEMENT_NODE && _child.tagName.toLowerCase() === element.tagName.toLowerCase()) {
          if (nthOfType === index) {
            return _child;
          }
          nthOfType++;
        }
      }
      return null;
    };

    // Get the index of the element among siblings of the same type.


    var getIndexOfType = function getIndexOfType(element) {
      var index = 0;
      var child = void 0;
      while (child = element.previousElementSibling) {
        if (child.tagName === element.tagName) {
          index++;
        }
      }
      return index;
    };

    var load = function load(url) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain');
        }

        xhr.open('GET', url, true);

        xhr.addEventListener('load', function (e) {
          if (e.target.status === HTTP_STATUS_CODE_OK || e.target.status === 0) {
            resolve(e.target.responseText);
          } else {
            reject(new Error(url + ' not found'));
          }
        });

        xhr.addEventListener('error', function () {
          return reject(new Error(url + ' failed to load'));
        });
        xhr.addEventListener('timeout', function () {
          return reject(new Error(url + ' timed out'));
        });

        xhr.send(null);
      });
    };

    var fetchResource = function fetchResource(res, lang) {
      var url = res.replace('{locale}', lang);
      return load(url).catch(function () {
        return null;
      });
    };

    // A document.ready shim
    // https://github.com/whatwg/html/issues/127
    var documentReady = function documentReady() {
      var rs = document.readyState;
      // !important
      // if (rs === 'interactive' || rs === 'completed') {
      if (rs !== 'loading') {
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        return document.addEventListener('readystatechange', resolve, { once: true });
      });
    };

    var getResourceLinks = function getResourceLinks(elem) {
      return Array.prototype.map.call(elem.querySelectorAll('link[rel="localization"]'), function (el) {
        return [el.getAttribute('href'), el.getAttribute('name') || 'main'];
      }).reduce(function (seq, _ref30) {
        var href = _ref30[0],
            name = _ref30[1];
        return seq.set(name, (seq.get(name) || []).concat(href));
      }, new Map());
    };

    var getMeta = function getMeta(head) {
      var availableLangs = new Set();
      var defaultLang = null;
      var appVersion = null;

      // XXX take last found instead of first?
      var metas = Array.from(head.querySelectorAll('meta[name="availableLanguages"],' + 'meta[name="defaultLanguage"],' + 'meta[name="appVersion"]'));
      for (var _iterator13 = metas, _isArray13 = Array.isArray(_iterator13), _i13 = 0, _iterator13 = _isArray13 ? _iterator13 : _iterator13[Symbol.iterator]();;) {
        var _ref31;

        if (_isArray13) {
          if (_i13 >= _iterator13.length) break;
          _ref31 = _iterator13[_i13++];
        } else {
          _i13 = _iterator13.next();
          if (_i13.done) break;
          _ref31 = _i13.value;
        }

        var meta = _ref31;

        var name = meta.getAttribute('name');
        var _content = meta.getAttribute('content').trim();
        switch (name) {
          case 'availableLanguages':
            availableLangs = new Set(_content.split(',').map(function (lang) {
              return lang.trim();
            }));
            break;
          case 'defaultLanguage':
            defaultLang = _content;
            break;
          case 'appVersion':
            appVersion = _content;
        }
      }

      return {
        defaultLang: defaultLang,
        availableLangs: availableLangs,
        appVersion: appVersion
      };
    };

    var createContext = function createContext(lang) {
      return new Intl.MessageContext(lang);
    };

    var createLocalization = function createLocalization(name, resIds, defaultLang, availableLangs) {
      var langs = PrioritizeLocales(availableLangs, navigator.languages.slice(), defaultLang);

      function requestBundles() {
        var requestedLangs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Set(langs);

        var newLangs = prioritizeLocales(defaultLang, availableLangs, requestedLangs);

        var bundles = [];
        newLangs.forEach(function (lang) {
          bundles.push(new ResourceBundle(lang, resIds));
        });
        return Promise.resolve(bundles);
      }

      var l10n = new Localization(requestBundles, createContext);
      document.l10n.set(name, l10n);

      if (name === 'main') {
        var rootElem = document.documentElement;
        document.l10n.observeRoot(rootElem, l10n);
        document.l10n.translateRoot(rootElem, l10n);
      }
    };

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

    var locales2rules = {
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
    };var pluralRules = {
      '0': function _() {
        return 'other';
      },
      '1': function _(n) {
        if (isBetween(n % 100, 3, 10)) {
          return 'few';
        }
        if (n === 0) {
          return 'zero';
        }
        if (isBetween(n % 100, 11, 99)) {
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
      '2': function _(n) {
        if (n !== 0 && n % 10 === 0) {
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
      '3': function _(n) {
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '4': function _(n) {
        if (isBetween(n, 0, 1)) {
          return 'one';
        }
        return 'other';
      },
      '5': function _(n) {
        if (isBetween(n, 0, 2) && n !== 2) {
          return 'one';
        }
        return 'other';
      },
      '6': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (n % 10 === 1 && n % 100 !== 11) {
          return 'one';
        }
        return 'other';
      },
      '7': function _(n) {
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '8': function _(n) {
        if (isBetween(n, 3, 6)) {
          return 'few';
        }
        if (isBetween(n, 7, 10)) {
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
      '9': function _(n) {
        if (n === 0 || n !== 1 && isBetween(n % 100, 1, 19)) {
          return 'few';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '10': function _(n) {
        if (isBetween(n % 10, 2, 9) && !isBetween(n % 100, 11, 19)) {
          return 'few';
        }
        if (n % 10 === 1 && !isBetween(n % 100, 11, 19)) {
          return 'one';
        }
        return 'other';
      },
      '11': function _(n) {
        if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
          return 'few';
        }
        if (n % 10 === 0 || isBetween(n % 10, 5, 9) || isBetween(n % 100, 11, 14)) {
          return 'many';
        }
        if (n % 10 === 1 && n % 100 !== 11) {
          return 'one';
        }
        return 'other';
      },
      '12': function _(n) {
        if (isBetween(n, 2, 4)) {
          return 'few';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '13': function _(n) {
        if (n % 1 !== 0) {
          return 'other';
        }
        if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
          return 'few';
        }
        if (n !== 1 && isBetween(n % 10, 0, 1) || isBetween(n % 10, 5, 9) || isBetween(n % 100, 12, 14)) {
          return 'many';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '14': function _(n) {
        if (isBetween(n % 100, 3, 4)) {
          return 'few';
        }
        if (n % 100 === 2) {
          return 'two';
        }
        if (n % 100 === 1) {
          return 'one';
        }
        return 'other';
      },
      '15': function _(n) {
        if (n === 0 || isBetween(n % 100, 2, 10)) {
          return 'few';
        }
        if (isBetween(n % 100, 11, 19)) {
          return 'many';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '16': function _(n) {
        if (n % 10 === 1 && n !== 11) {
          return 'one';
        }
        return 'other';
      },
      '17': function _(n) {
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
      '18': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (isBetween(n, 0, 2) && n !== 0 && n !== 2) {
          return 'one';
        }
        return 'other';
      },
      '19': function _(n) {
        if (isBetween(n, 2, 10)) {
          return 'few';
        }
        if (isBetween(n, 0, 1)) {
          return 'one';
        }
        return 'other';
      },
      '20': function _(n) {
        if ((isBetween(n % 10, 3, 4) || n % 10 === 9) && !(isBetween(n % 100, 10, 19) || isBetween(n % 100, 70, 79) || isBetween(n % 100, 90, 99))) {
          return 'few';
        }
        if (n % 1000000 === 0 && n !== 0) {
          return 'many';
        }
        if (n % 10 === 2 && !isIn(n % 100, [12, 72, 92])) {
          return 'two';
        }
        if (n % 10 === 1 && !isIn(n % 100, [11, 71, 91])) {
          return 'one';
        }
        return 'other';
      },
      '21': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '22': function _(n) {
        if (isBetween(n, 0, 1) || isBetween(n, 11, 99)) {
          return 'one';
        }
        return 'other';
      },
      '23': function _(n) {
        if (isBetween(n % 10, 1, 2) || n % 20 === 0) {
          return 'one';
        }
        return 'other';
      },
      '24': function _(n) {
        if (isBetween(n, 3, 10) || isBetween(n, 13, 19)) {
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

    var L10nError = function (_Error) {
      _inherits(L10nError, _Error);

      function L10nError(message, id, lang) {
        _classCallCheck(this, L10nError);

        var _this = _possibleConstructorReturn(this, _Error.call(this));

        _this.name = 'L10nError';
        _this.message = message;
        _this.id = id;
        _this.lang = lang;
        return _this;
      }

      return L10nError;
    }(Error);

    /*eslint no-magic-numbers: [0]*/

    var MAX_PLACEABLES = 100;

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

    var EntriesParser = function () {
      function EntriesParser() {
        _classCallCheck(this, EntriesParser);
      }

      /**
       * @param {string} string
       * @returns {{}, []]}
       */
      EntriesParser.prototype.getResource = function getResource(string) {
        this._source = string;
        this._index = 0;
        this._length = string.length;

        // This variable is used for error recovery and reporting.
        this._lastGoodEntryEnd = 0;

        var entries = {};
        var errors = [];

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
      };

      EntriesParser.prototype.getEntry = function getEntry(entries) {
        // The pointer here should either be at the beginning of the file
        // or right after new line.
        if (this._index !== 0 && this._source[this._index - 1] !== '\n') {
          throw this.error('Expected new line and a new entry');
        }

        var ch = this._source[this._index];

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
        return;
      };

      EntriesParser.prototype.getSection = function getSection() {
        this._index += 1;
        if (this._source[this._index] !== '[') {
          throw this.error('Expected "[[" to open a section');
        }

        this._index += 1;

        this.getLineWS();
        this.getKeyword();
        this.getLineWS();

        if (this._source[this._index] !== ']' || this._source[this._index + 1] !== ']') {
          throw this.error('Expected "]]" to close a section');
        }

        this._index += 2;

        // sections are ignored in the runtime ast
        return undefined;
      };

      EntriesParser.prototype.getEntity = function getEntity(entries) {
        var id = this.getIdentifier();

        this.getLineWS();

        var ch = this._source[this._index];

        if (ch !== '=') {
          throw this.error('Expected "=" after Entity ID');
        }

        this._index++;

        this.getLineWS();

        var val = this.getPattern();

        ch = this._source[this._index];

        // In the scenario when the pattern is quote-delimited
        // the pattern ends with the closing quote.
        if (ch === '\n') {
          this._index++;
          this.getLineWS();
          ch = this._source[this._index];
        }

        if (ch === '[' && this._source[this._index + 1] !== '[' || ch === '*') {

          var _members = this.getMembers();
          entries[id] = {
            traits: _members[0],
            def: _members[1],
            val: val
          };
        } else if (typeof val === 'string') {
          entries[id] = val;
        } else if (val === undefined) {
          throw this.error('Expected a value (like: " = value") or a trait (like: "[key] value")');
        } else {
          entries[id] = {
            val: val
          };
        }
      };

      EntriesParser.prototype.getWS = function getWS() {
        var cc = this._source.charCodeAt(this._index);
        // space, \n, \t, \r
        while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
          cc = this._source.charCodeAt(++this._index);
        }
      };

      EntriesParser.prototype.getLineWS = function getLineWS() {
        var cc = this._source.charCodeAt(this._index);
        // space, \t
        while (cc === 32 || cc === 9) {
          cc = this._source.charCodeAt(++this._index);
        }
      };

      EntriesParser.prototype.getIdentifier = function getIdentifier() {
        var start = this._index;
        var cc = this._source.charCodeAt(this._index);

        if (cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc === 95) {
          // _
          cc = this._source.charCodeAt(++this._index);
        } else {
          throw this.error('Expected an identifier (starting with [a-zA-Z_])');
        }

        while (cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc >= 48 && cc <= 57 || // 0-9
        cc === 95 || cc === 45) {
          // _-
          cc = this._source.charCodeAt(++this._index);
        }

        return this._source.slice(start, this._index);
      };

      EntriesParser.prototype.getKeyword = function getKeyword() {
        var name = '';
        var namespace = this.getIdentifier();

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

        var start = this._index;
        var cc = this._source.charCodeAt(this._index);

        if (cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc === 95 || cc === 32) {
          //  _
          cc = this._source.charCodeAt(++this._index);
        } else if (name.length === 0) {
          throw this.error('Expected an identifier (starting with [a-zA-Z_])');
        }

        while (cc >= 97 && cc <= 122 || // a-z
        cc >= 65 && cc <= 90 || // A-Z
        cc >= 48 && cc <= 57 || // 0-9
        cc === 95 || cc === 45 || cc === 32) {
          //  _-
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

        return namespace ? { type: 'kw', ns: namespace, name: name } : { type: 'kw', name: name };
      };

      // We're going to first try to see if the pattern is simple.
      // If it is a simple, not quote-delimited string,
      // we can just look for the end of the line and read the string.
      //
      // Then, if either the line contains a placeable opening `{` or the
      // next line starts with a pipe `|`, we switch to complex pattern.


      EntriesParser.prototype.getPattern = function getPattern() {
        var start = this._index;
        if (this._source[start] === '"') {
          return this.getComplexPattern();
        }
        var eol = this._source.indexOf('\n', this._index);

        if (eol === -1) {
          eol = this._length;
        }

        var line = start !== eol ? this._source.slice(start, eol) : undefined;

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
      };

      /* eslint-disable complexity */


      EntriesParser.prototype.getComplexPattern = function getComplexPattern() {
        var buffer = '';
        var content = [];
        var placeables = 0;

        // We actually use all three possible states of this variable:
        // true and false indicate if we're within a quote-delimited string
        // null indicates that the string is not quote-delimited
        var quoteDelimited = null;
        var firstLine = true;

        var ch = this._source[this._index];

        // If the string starts with \", \{ or \\ skip the first `\` and add the
        // following character to the buffer without interpreting it.
        if (ch === '\\' && (this._source[this._index + 1] === '"' || this._source[this._index + 1] === '{' || this._source[this._index + 1] === '\\')) {
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
            var ch2 = this._source[this._index + 1];
            if (quoteDelimited && ch2 === '"' || ch2 === '{') {
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
              throw this.error('Too many placeables, maximum allowed is ' + MAX_PLACEABLES);
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
      };
      /* eslint-enable complexity */

      EntriesParser.prototype.getPlaceable = function getPlaceable() {
        this._index++;

        var expressions = [];

        this.getLineWS();

        while (this._index < this._length) {
          var _start = this._index;
          try {
            expressions.push(this.getPlaceableExpression());
          } catch (e) {
            throw this.error(e.description, _start);
          }
          var _ch = this._source[this._index];
          if (_ch === '}') {
            this._index++;
            break;
          } else if (_ch === ',') {
            this._index++;
            this.getWS();
          } else {
            throw this.error('Expected "}" or ","');
          }
        }

        return expressions;
      };

      EntriesParser.prototype.getPlaceableExpression = function getPlaceableExpression() {
        var selector = this.getCallExpression();
        var members = void 0;

        this.getWS();

        var ch = this._source[this._index];

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
      };

      EntriesParser.prototype.getCallExpression = function getCallExpression() {
        var exp = this.getMemberExpression();

        if (this._source[this._index] !== '(') {
          return exp;
        }

        this._index++;

        var args = this.getCallArgs();

        this._index++;

        if (exp.type === 'ref') {
          exp.type = 'fun';
        }

        return {
          type: 'call',
          name: exp,
          args: args
        };
      };

      EntriesParser.prototype.getCallArgs = function getCallArgs() {
        var args = [];

        if (this._source[this._index] === ')') {
          return args;
        }

        while (this._index < this._length) {
          this.getLineWS();

          var _exp = this.getCallExpression();

          // EntityReference in this place may be an entity reference, like:
          // `call(foo)`, or, if it's followed by `:` it will be a key-value pair.
          if (_exp.type !== 'ref' || _exp.namespace !== undefined) {
            args.push(_exp);
          } else {
            this.getLineWS();

            if (this._source[this._index] === ':') {
              this._index++;
              this.getLineWS();

              var val = this.getCallExpression();

              // If the expression returned as a value of the argument
              // is not a quote delimited string, number or
              // external argument, throw an error.
              //
              // We don't have to check here if the pattern is quote delimited
              // because that's the only type of string allowed in expressions.
              if (typeof val === 'string' || Array.isArray(val) || val.type === 'num' || val.type === 'ext') {
                args.push({
                  type: 'kv',
                  name: _exp.name,
                  val: val
                });
              } else {
                this._index = this._source.lastIndexOf(':', this._index) + 1;
                throw this.error('Expected string in quotes, number or external argument');
              }
            } else {
              args.push(_exp);
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
      };

      EntriesParser.prototype.getNumber = function getNumber() {
        var num = '';
        var cc = this._source.charCodeAt(this._index);

        // The number literal may start with negative sign `-`.
        if (cc === 45) {
          num += '-';
          cc = this._source.charCodeAt(++this._index);
        }

        // next, we expect at least one digit
        if (cc < 48 || cc > 57) {
          throw this.error('Unknown literal "' + num + '"');
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
            throw this.error('Unknown literal "' + num + '"');
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
      };

      EntriesParser.prototype.getMemberExpression = function getMemberExpression() {
        var exp = this.getLiteral();

        // the obj element of the member expression
        // must be either an entity reference or another member expression.
        while (['ref', 'mem'].includes(exp.type) && this._source[this._index] === '[') {
          var keyword = this.getMemberKey();
          exp = {
            type: 'mem',
            key: keyword,
            obj: exp
          };
        }

        return exp;
      };

      EntriesParser.prototype.getMembers = function getMembers() {
        var members = [];
        var index = 0;
        var defaultIndex = void 0;

        while (this._index < this._length) {
          var _ch2 = this._source[this._index];

          if ((_ch2 !== '[' || this._source[this._index + 1] === '[') && _ch2 !== '*') {
            break;
          }
          if (_ch2 === '*') {
            this._index++;
            defaultIndex = index;
          }

          if (this._source[this._index] !== '[') {
            throw this.error('Expected "["');
          }

          var key = this.getMemberKey();

          this.getLineWS();

          var member = {
            key: key,
            val: this.getPattern()
          };
          members[index++] = member;

          this.getWS();
        }

        return [members, defaultIndex];
      };

      // MemberKey may be a Keyword or Number


      EntriesParser.prototype.getMemberKey = function getMemberKey() {
        this._index++;

        var cc = this._source.charCodeAt(this._index);
        var literal = void 0;

        if (cc >= 48 && cc <= 57 || cc === 45) {
          literal = this.getNumber();
        } else {
          literal = this.getKeyword();
        }

        if (this._source[this._index] !== ']') {
          throw this.error('Expected "]"');
        }

        this._index++;
        return literal;
      };

      EntriesParser.prototype.getLiteral = function getLiteral() {
        var cc = this._source.charCodeAt(this._index);
        if (cc >= 48 && cc <= 57 || cc === 45) {
          return this.getNumber();
        } else if (cc === 34) {
          // "
          return this.getPattern();
        } else if (cc === 36) {
          // $
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
      };

      // At runtime, we don't care about comments so we just have
      // to parse them properly and skip their content.


      EntriesParser.prototype.getComment = function getComment() {
        var eol = this._source.indexOf('\n', this._index);

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
      };

      EntriesParser.prototype.error = function error(message) {
        var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var pos = this._index;

        if (start === null) {
          start = pos;
        }
        start = this._findEntityStart(start);

        var context = this._source.slice(start, pos + 10);

        var msg = '\n\n  ' + message + '\nat pos ' + pos + ':\n------\n\u2026' + context + '\n------';
        var err = new L10nError(msg);

        var row = this._source.slice(0, pos).split('\n').length;
        var col = pos - this._source.lastIndexOf('\n', pos - 1);
        err._pos = { start: pos, end: undefined, col: col, row: row };
        err.offset = pos - start;
        err.description = message;
        err.context = context;
        return err;
      };

      EntriesParser.prototype.getJunkEntry = function getJunkEntry() {
        var pos = this._index;

        var nextEntity = this._findNextEntryStart(pos);

        if (nextEntity === -1) {
          nextEntity = this._length;
        }

        this._index = nextEntity;

        var entityStart = this._findEntityStart(pos);

        if (entityStart < this._lastGoodEntryEnd) {
          entityStart = this._lastGoodEntryEnd;
        }
      };

      EntriesParser.prototype._findEntityStart = function _findEntityStart(pos) {
        var start = pos;

        while (true) {
          start = this._source.lastIndexOf('\n', start - 2);
          if (start === -1 || start === 0) {
            start = 0;
            break;
          }
          var _cc = this._source.charCodeAt(start + 1);

          if (_cc >= 97 && _cc <= 122 || // a-z
          _cc >= 65 && _cc <= 90 || // A-Z
          _cc === 95) {
            // _
            start++;
            break;
          }
        }

        return start;
      };

      EntriesParser.prototype._findNextEntryStart = function _findNextEntryStart(pos) {
        var start = pos;

        while (true) {
          if (start === 0 || this._source[start - 1] === '\n') {
            var _cc2 = this._source.charCodeAt(start);

            if (_cc2 >= 97 && _cc2 <= 122 || // a-z
            _cc2 >= 65 && _cc2 <= 90 || // A-Z
            _cc2 === 95 || _cc2 === 35 || _cc2 === 91) {
              // _#[
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
      };

      return EntriesParser;
    }();

    var FTLRuntimeParser = {
      parseResource: function parseResource(string) {
        var parser = new EntriesParser();
        return parser.getResource(string);
      }
    };

    /**
     * The `FTLType` class is the base of FTL's type system.
     *
     * FTL types wrap JavaScript values and store additional configuration for
     * them, which can then be used in the `toString` method together with a proper
     * `Intl` formatter.
     */

    var FTLType = function () {

      /**
       * Create an `FTLType` instance.
       *
       * @param   {Any}    value - JavaScript value to wrap.
       * @param   {Object} opts  - Configuration.
       * @returns {FTLType}
       */
      function FTLType(value, opts) {
        _classCallCheck(this, FTLType);

        this.value = value;
        this.opts = opts;
      }

      /**
       * Get the JavaScript value wrapped by this `FTLType` instance.
       *
       * @returns {Any}
       */


      FTLType.prototype.valueOf = function valueOf() {
        return this.value;
      };

      /**
       * Stringify an instance of `FTLType`.
       *
       * This method can use `Intl` formatters memoized by the `MessageContext`
       * instance passed as an argument.
       *
       * @param   {MessageContext} ctx
       * @returns {string}
       */


      FTLType.prototype.toString = function toString(ctx) {
        return this.value.toString(ctx);
      };

      return FTLType;
    }();

    var FTLNone = function (_FTLType) {
      _inherits(FTLNone, _FTLType);

      function FTLNone() {
        _classCallCheck(this, FTLNone);

        return _possibleConstructorReturn(this, _FTLType.apply(this, arguments));
      }

      FTLNone.prototype.toString = function toString() {
        return this.value || '???';
      };

      return FTLNone;
    }(FTLType);

    var FTLNumber = function (_FTLType2) {
      _inherits(FTLNumber, _FTLType2);

      function FTLNumber(value, opts) {
        _classCallCheck(this, FTLNumber);

        return _possibleConstructorReturn(this, _FTLType2.call(this, parseFloat(value), opts));
      }

      FTLNumber.prototype.toString = function toString(ctx) {
        var nf = ctx._memoizeIntlObject(Intl.NumberFormat, this.opts);
        return nf.format(this.value);
      };

      return FTLNumber;
    }(FTLType);

    var FTLDateTime = function (_FTLType3) {
      _inherits(FTLDateTime, _FTLType3);

      function FTLDateTime(value, opts) {
        _classCallCheck(this, FTLDateTime);

        return _possibleConstructorReturn(this, _FTLType3.call(this, new Date(value), opts));
      }

      FTLDateTime.prototype.toString = function toString(ctx) {
        var dtf = ctx._memoizeIntlObject(Intl.DateTimeFormat, this.opts);
        return dtf.format(this.value);
      };

      return FTLDateTime;
    }(FTLType);

    var FTLKeyword = function (_FTLType4) {
      _inherits(FTLKeyword, _FTLType4);

      function FTLKeyword() {
        _classCallCheck(this, FTLKeyword);

        return _possibleConstructorReturn(this, _FTLType4.apply(this, arguments));
      }

      FTLKeyword.prototype.toString = function toString() {
        var _value = this.value,
            name = _value.name,
            namespace = _value.namespace;

        return namespace ? namespace + ':' + name : name;
      };

      FTLKeyword.prototype.match = function match(ctx, other) {
        var _value2 = this.value,
            name = _value2.name,
            namespace = _value2.namespace;

        if (other instanceof FTLKeyword) {
          return name === other.value.name && namespace === other.value.namespace;
        } else if (namespace) {
          return false;
        } else if (typeof other === 'string') {
          return name === other;
        } else if (other instanceof FTLNumber) {
          var pr = ctx._memoizeIntlObject(Intl.PluralRules, other.opts);
          return name === pr.select(other.valueOf());
        }
        return false;
      };

      return FTLKeyword;
    }(FTLType);

    var FTLList = function (_Array) {
      _inherits(FTLList, _Array);

      function FTLList() {
        _classCallCheck(this, FTLList);

        return _possibleConstructorReturn(this, _Array.apply(this, arguments));
      }

      FTLList.prototype.toString = function toString(ctx) {
        var lf = ctx._memoizeIntlObject(Intl.ListFormat // XXX add this.opts
        );
        var elems = this.map(function (elem) {
          return elem.toString(ctx);
        });
        return lf.format(elems);
      };

      return FTLList;
    }(Array);

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


    var builtins = {
      'NUMBER': function NUMBER(_ref, opts) {
        var arg = _ref[0];
        return new FTLNumber(arg.valueOf(), merge(arg.opts, opts));
      },
      'PLURAL': function PLURAL(_ref2, opts) {
        var arg = _ref2[0];
        return new FTLNumber(arg.valueOf(), merge(arg.opts, opts));
      },
      'DATETIME': function DATETIME(_ref3, opts) {
        var arg = _ref3[0];

        var dateT = arg.split('T');
        var date = dateT[0].split('-');
        var time = dateT[1].split(':');
        arg = Date(date[0], date[1] - 1, date[2], time[0], time[1], parseInt(time[2]));
        new FTLDateTime(arg.valueOf(), merge(arg.opts, opts));
      },
      'LIST': function LIST(args) {
        return FTLList.from(args);
      },
      'LEN': function LEN(_ref4) {
        var arg = _ref4[0];
        return new FTLNumber(arg.valueOf().length);
      },
      'TAKE': function TAKE(_ref5) {
        var num = _ref5[0],
            arg = _ref5[1];
        return FTLList.from(arg.valueOf().slice(0, num.value));
      },
      'DROP': function DROP(_ref6) {
        var num = _ref6[0],
            arg = _ref6[1];
        return FTLList.from(arg.valueOf().slice(num.value));
      }
    };

    var MAX_PLACEABLE_LENGTH = 2500;
    var MessageContext = function () {

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
      function MessageContext(lang) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, MessageContext);

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


      MessageContext.prototype.addMessages = function addMessages(source) {
        var _FTLRuntimeParser$par = FTLRuntimeParser.parseResource(source),
            entries = _FTLRuntimeParser$par[0],
            errors = _FTLRuntimeParser$par[1];

        for (var id in entries) {
          this.messages.set(id, entries[id]);
        }

        return errors;
      };

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


      MessageContext.prototype.format = function format(entity, args, errors) {
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

        var result = resolve(this, args, entity, errors);
        return result instanceof FTLNone ? null : result;
      };

      MessageContext.prototype._memoizeIntlObject = function _memoizeIntlObject(ctor, opts) {
        var cache = this.intls.get(ctor) || {};
        var id = JSON.stringify(opts);

        if (!cache[id]) {
          cache[id] = new ctor(this.lang, opts);
          this.intls.set(ctor, cache);
        }

        return cache[id];
      };

      return MessageContext;
    }();

    Intl.MessageContext = MessageContext;
    Intl.MessageNumberArgument = FTLNumber;
    Intl.MessageDateTimeArgument = FTLDateTime;

    if (!Intl.NumberFormat) {
      Intl.NumberFormat = function () {
        return {
          format: function format(n) {
            return n;
          }
        };
      };
    }

    if (!Intl.PluralRules) {
      Intl.PluralRules = function (code) {
        var fn = getPluralRule(code);
        return {
          select: function select(n) {
            return fn(n);
          }
        };
      };
    }

    if (!Intl.ListFormat) {
      Intl.ListFormat = function () {
        return {
          format: function format(list) {
            return list.join(', ');
          }
        };
      };
    }

    var properties = new WeakMap();
    var contexts = new WeakMap();

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

    var Localization = function () {

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
      function Localization(requestBundles, createContext) {
        _classCallCheck(this, Localization);

        var createHeadContext = function createHeadContext(bundles) {
          return createHeadContextWith(createContext, bundles);
        };

        // Keep `requestBundles` and `createHeadContext` private.
        properties.set(this, {
          requestBundles: requestBundles, createHeadContext: createHeadContext
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
        function (bundles) {
          return createHeadContext(bundles).then(
          // Force `this.interactive` to resolve to the list of bundles.
          function () {
            return bundles;
          });
        });
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


      Localization.prototype.requestLanguages = function requestLanguages(requestedLangs) {
        var _properties$get = properties.get(this),
            requestBundles = _properties$get.requestBundles,
            createHeadContext = _properties$get.createHeadContext;

        // Assign to `this.interactive` to make all translations requested after
        // the language change request come from the new fallback chain.


        return this.interactive = Promise.all(
        // Get the current bundles to be able to compare them to the new result
        // of the language negotiation.
        [this.interactive, requestBundles(requestedLangs)]).then(function (_ref19) {
          var oldBundles = _ref19[0],
              newBundles = _ref19[1];

          if (equal(oldBundles, newBundles)) {
            return oldBundles;
          }

          return createHeadContext(newBundles).then(function () {
            return newBundles;
          });
        });
      };

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


      Localization.prototype.formatWithFallback = function formatWithFallback(bundles, ctx, keys, method, prev) {
        var _this7 = this;

        // If a context for the head bundle doesn't exist we've reached the last
        // bundle in the fallback chain.  This is the end condition which returns
        // the translations formatted during the previous (recursive) calls to
        // `formatWithFallback`.
        if (!ctx && prev) {
          return prev.translations;
        }

        var current = method(ctx, keys, prev);

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
          current.errors.forEach(function (errs) {
            return errs ? errs.forEach(function (e) {
              return console.warn(e);
            } // eslint-disable-line no-console
            ) : null;
          });
        }

        // At this point we need to fetch the next bundle in the fallback chain and
        // create a `MessageContext` instance for it.
        var tailBundles = bundles.slice(1);

        var _properties$get2 = properties.get(this),
            createHeadContext = _properties$get2.createHeadContext;

        return createHeadContext(tailBundles).then(function (next) {
          return _this7.formatWithFallback(tailBundles, next, keys, method, current);
        });
      };

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


      Localization.prototype.formatEntities = function formatEntities(keys) {
        var _this8 = this;

        return this.interactive.then(function (bundles) {
          return _this8.formatWithFallback(bundles, contexts.get(bundles[0]), keys, entitiesFromContext);
        });
      };

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


      Localization.prototype.formatValues = function formatValues() {
        var _this9 = this;

        for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
          keys[_key] = arguments[_key];
        }

        // Convert string keys into arrays that `formatWithFallback` expects.
        var keyTuples = keys.map(function (key) {
          return Array.isArray(key) ? key : [key, null];
        });
        return this.interactive.then(function (bundles) {
          return _this9.formatWithFallback(bundles, contexts.get(bundles[0]), keyTuples, valuesFromContext);
        });
      };

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


      Localization.prototype.formatValue = function formatValue(id, args) {
        return this.formatValues([id, args]).then(function (_ref20) {
          var val = _ref20[0];
          return val;
        });
      };

      return Localization;
    }();

    var reHtml = /[&<>]/g;
    var htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    // Unicode bidi isolation characters.
    var FSI = '\u2068';
    var PDI = '\u2069';var reOverlay = /<|&#?\w+;/;

    // XXX The allowed list should be amendable; https://bugzil.la/922573.
    var ALLOWED_ELEMENTS = {
      'http://www.w3.org/1999/xhtml': ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr']
    };

    var ALLOWED_ATTRIBUTES = {
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
        global: ['accesskey', 'aria-label', 'aria-valuetext', 'aria-moz-hint', 'label'],
        key: ['key', 'keycode'],
        textbox: ['placeholder'],
        toolbarbutton: ['tooltiptext']
      }
    };

    var DOM_NAMESPACES = {
      'html': 'http://www.w3.org/1999/xhtml',
      'xul': 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',

      // Reverse map for overlays.
      'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul': 'xul',
      'http://www.w3.org/1999/xhtml': 'html'
    };

    var observerConfig = {
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

    var LocalizationObserver = function () {
      /**
       * @returns {LocalizationObserver}
       */
      function LocalizationObserver() {
        var _this10 = this;

        _classCallCheck(this, LocalizationObserver);

        this.localizations = new Map();
        this.roots = new WeakMap();
        this.observer = new MutationObserver(function (mutations) {
          return _this10.translateMutations(mutations);
        });
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


      LocalizationObserver.prototype.has = function has(name) {
        return this.localizations.has(name);
      };

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


      LocalizationObserver.prototype.get = function get(name) {
        return this.localizations.get(name);
      };

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


      LocalizationObserver.prototype.set = function set(name, value) {
        this.localizations.set(name, value);
        return this;
      };

      LocalizationObserver.prototype[Symbol.iterator] = regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.delegateYield(this.localizations, 't0', 1);

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      });

      LocalizationObserver.prototype.handleEvent = function handleEvent() {
        return this.requestLanguages();
      };

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


      LocalizationObserver.prototype.requestLanguages = function requestLanguages(requestedLangs) {
        var _this11 = this;

        var localizations = Array.from(this.localizations.values());
        return Promise.all(localizations.map(function (l10n) {
          return l10n.requestLanguages(requestedLangs);
        })).then(function () {
          return _this11.translateAllRoots();
        });
      };

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


      LocalizationObserver.prototype.setAttributes = function setAttributes(element, id, args) {
        element.setAttribute('data-l10n-id', id);
        if (args) {
          element.setAttribute('data-l10n-args', JSON.stringify(args));
        }
        return element;
      };

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


      LocalizationObserver.prototype.getAttributes = function getAttributes(element) {
        return {
          id: element.getAttribute('data-l10n-id'),
          args: JSON.parse(element.getAttribute('data-l10n-args'))
        };
      };

      /**
       * Add a new root to the list of observed ones.
       *
       * @param {Element}      root - Root to observe.
       * @param {Localization} l10n - `Localization` object
       */


      LocalizationObserver.prototype.observeRoot = function observeRoot(root) {
        var l10n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.get('main');

        if (!this.roots.has(l10n)) {
          this.roots.set(l10n, new Set());
        }
        this.roots.get(l10n).add(root);
        this.observer.observe(root, observerConfig);
      };

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


      LocalizationObserver.prototype.disconnectRoot = function disconnectRoot(root) {
        var wasLast = false;

        this.pause();
        for (var _iterator7 = this.localizations, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
          var _ref23;

          if (_isArray7) {
            if (_i7 >= _iterator7.length) break;
            _ref23 = _iterator7[_i7++];
          } else {
            _i7 = _iterator7.next();
            if (_i7.done) break;
            _ref23 = _i7.value;
          }

          var _ref24 = _ref23,
              name = _ref24[0],
              l10n = _ref24[1];

          var roots = this.roots.get(l10n);
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
      };

      /**
       * Pauses the `MutationObserver`
       */


      LocalizationObserver.prototype.pause = function pause() {
        this.observer.disconnect();
      };

      /**
       * Resumes the `MutationObserver`
       */


      LocalizationObserver.prototype.resume = function resume() {
        for (var _iterator8 = this.localizations.values(), _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
          var _ref25;

          if (_isArray8) {
            if (_i8 >= _iterator8.length) break;
            _ref25 = _iterator8[_i8++];
          } else {
            _i8 = _iterator8.next();
            if (_i8.done) break;
            _ref25 = _i8.value;
          }

          var l10n = _ref25;

          if (this.roots.has(l10n)) {
            for (var _iterator9 = this.roots.get(l10n), _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : _iterator9[Symbol.iterator]();;) {
              var _ref26;

              if (_isArray9) {
                if (_i9 >= _iterator9.length) break;
                _ref26 = _iterator9[_i9++];
              } else {
                _i9 = _iterator9.next();
                if (_i9.done) break;
                _ref26 = _i9.value;
              }

              var root = _ref26;

              this.observer.observe(root, observerConfig);
            }
          }
        }
      };

      /**
       * Triggers translation of all roots associated with the
       * `LocalizationObserver`.
       *
       * Returns a `Promise` which is resolved once all translations are
       * completed.
       *
       * @returns {Promise}
       */


      LocalizationObserver.prototype.translateAllRoots = function translateAllRoots() {
        var _this12 = this;

        var localizations = Array.from(this.localizations.values());
        return Promise.all(localizations.map(function (l10n) {
          return _this12.translateRoots(l10n);
        }));
      };

      LocalizationObserver.prototype.translateRoots = function translateRoots(l10n) {
        var _this13 = this;

        if (!this.roots.has(l10n)) {
          return Promise.resolve();
        }

        var roots = Array.from(this.roots.get(l10n));
        return Promise.all(roots.map(function (root) {
          return _this13.translateRoot(root, l10n);
        }));
      };

      LocalizationObserver.prototype.translateRoot = function translateRoot(root, l10n) {
        function setLangs() {
          return l10n.interactive.then(function (bundles) {
            var langs = bundles.map(function (bundle) {
              return bundle.lang;
            });
            var wasLocalizedBefore = root.hasAttribute('langs');

            root.setAttribute('langs', langs.join(' '));
            root.setAttribute('lang', langs[0]);
            root.setAttribute('dir', getDirection(langs[0]));

            if (wasLocalizedBefore) {
              root.dispatchEvent(new CustomEvent('DOMRetranslated', {
                bubbles: false,
                cancelable: false
              }));
            }
          });
        }

        return this.translateRootContent(root).then(setLangs);
      };

      LocalizationObserver.prototype.translateRootContent = function translateRootContent(root) {
        var _this14 = this;

        var anonChildren = document.getAnonymousNodes ? document.getAnonymousNodes(root) : null;
        if (!anonChildren) {
          return this.translateFragment(root);
        }

        return Promise.all([root].concat(anonChildren).map(function (node) {
          return _this14.translateFragment(node);
        }));
      };

      LocalizationObserver.prototype.translateMutations = function translateMutations(mutations) {
        for (var _iterator10 = mutations, _isArray10 = Array.isArray(_iterator10), _i10 = 0, _iterator10 = _isArray10 ? _iterator10 : _iterator10[Symbol.iterator]();;) {
          var _ref27;

          if (_isArray10) {
            if (_i10 >= _iterator10.length) break;
            _ref27 = _iterator10[_i10++];
          } else {
            _i10 = _iterator10.next();
            if (_i10.done) break;
            _ref27 = _i10.value;
          }

          var mutation = _ref27;

          switch (mutation.type) {
            case 'attributes':
              this.translateElement(mutation.target);
              break;
            case 'childList':
              for (var _iterator11 = mutation.addedNodes, _isArray11 = Array.isArray(_iterator11), _i11 = 0, _iterator11 = _isArray11 ? _iterator11 : _iterator11[Symbol.iterator]();;) {
                var _ref28;

                if (_isArray11) {
                  if (_i11 >= _iterator11.length) break;
                  _ref28 = _iterator11[_i11++];
                } else {
                  _i11 = _iterator11.next();
                  if (_i11.done) break;
                  _ref28 = _i11.value;
                }

                var addedNode = _ref28;

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
      };

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


      LocalizationObserver.prototype.translateFragment = function translateFragment(frag) {
        var _this15 = this;

        return Promise.all(this.groupTranslatablesByLocalization(frag).map(function (elemsWithL10n) {
          return _this15.translateElements(elemsWithL10n[0], elemsWithL10n[1]);
        }));
      };

      LocalizationObserver.prototype.translateElements = function translateElements(l10n, elements) {
        var _this16 = this;

        if (!elements.length) {
          return [];
        }

        var keys = elements.map(this.getKeysForElement);
        return l10n.formatEntities(keys).then(function (translations) {
          return _this16.applyTranslations(elements, translations);
        });
      };

      /**
       * Translates a single DOM node asynchronously.
       *
       * Returns a `Promise` that gets resolved once the translation is complete.
       *
       * @param   {Element} element - HTML element to be translated
       * @returns {Promise}
       */


      LocalizationObserver.prototype.translateElement = function translateElement(element) {
        var _this17 = this;

        var l10n = this.get(element.getAttribute('data-l10n-bundle') || 'main');
        return l10n.formatEntities([this.getKeysForElement(element)]).then(function (translations) {
          return _this17.applyTranslations([element], translations);
        });
      };

      LocalizationObserver.prototype.applyTranslations = function applyTranslations(elements, translations) {
        this.pause();
        for (var i = 0; i < elements.length; i++) {
          overlayElement(elements[i], translations[i]);
        }
        this.resume();
      };

      LocalizationObserver.prototype.groupTranslatablesByLocalization = function groupTranslatablesByLocalization(frag) {
        var elemsWithL10n = [];
        for (var _iterator12 = this.localizations, _isArray12 = Array.isArray(_iterator12), _i12 = 0, _iterator12 = _isArray12 ? _iterator12 : _iterator12[Symbol.iterator]();;) {
          var _ref29;

          if (_isArray12) {
            if (_i12 >= _iterator12.length) break;
            _ref29 = _iterator12[_i12++];
          } else {
            _i12 = _iterator12.next();
            if (_i12.done) break;
            _ref29 = _i12.value;
          }

          var loc = _ref29;

          elemsWithL10n.push([loc[1], this.getTranslatables(frag, loc[0])]);
        }
        return elemsWithL10n;
      };

      LocalizationObserver.prototype.getTranslatables = function getTranslatables(element, bundleName) {
        var query = bundleName === 'main' ? '[data-l10n-bundle="main"], [data-l10n-id]:not([data-l10n-bundle])' : '[data-l10n-bundle=' + bundleName + ']';
        var nodes = Array.from(element.querySelectorAll(query));

        if (typeof element.hasAttribute === 'function' && element.hasAttribute('data-l10n-id')) {
          var elemBundleName = element.getAttribute('data-l10n-bundle');
          if (elemBundleName === null || elemBundleName === bundleName) {
            nodes.push(element);
          }
        }

        return nodes;
      };

      LocalizationObserver.prototype.getKeysForElement = function getKeysForElement(element) {
        return [element.getAttribute('data-l10n-id'),
        // In XUL documents missing attributes return `''` here which breaks
        // JSON.parse.  HTML documents return `null`.
        JSON.parse(element.getAttribute('data-l10n-args') || null)];
      };

      return LocalizationObserver;
    }();

    var HTTP_STATUS_CODE_OK = 200;

    var ResourceBundle = function () {
      function ResourceBundle(lang, resIds) {
        _classCallCheck(this, ResourceBundle);

        this.lang = lang;
        this.loaded = false;
        this.resIds = resIds;
      }

      ResourceBundle.prototype.fetch = function fetch() {
        var _this18 = this;

        if (!this.loaded) {
          this.loaded = Promise.all(this.resIds.map(function (resId) {
            return fetchResource(resId, _this18.lang);
          }));
        }

        return this.loaded;
      };

      return ResourceBundle;
    }();

    document.l10n = new LocalizationObserver();
    window.addEventListener('languagechange', document.l10n);

    documentReady().then(function () {
      var _getMeta = getMeta(document.head),
          defaultLang = _getMeta.defaultLang,
          availableLangs = _getMeta.availableLangs;

      for (var _iterator14 = getResourceLinks(document.head), _isArray14 = Array.isArray(_iterator14), _i14 = 0, _iterator14 = _isArray14 ? _iterator14 : _iterator14[Symbol.iterator]();;) {
        var _ref32;

        if (_isArray14) {
          if (_i14 >= _iterator14.length) break;
          _ref32 = _iterator14[_i14++];
        } else {
          _i14 = _iterator14.next();
          if (_i14.done) break;
          _ref32 = _i14.value;
        }

        var _ref33 = _ref32,
            name = _ref33[0],
            resIds = _ref33[1];

        if (!document.l10n.has(name)) {
          createLocalization(name, resIds, defaultLang, availableLangs);
        }
      }
    });
  })();
}