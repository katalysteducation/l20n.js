'use strict';

import assert from 'assert';

import '../../src/intl/polyfill';
import { MessageContext } from '../../src/intl/context';
import { ftl } from '../util';

describe('External arguments', function() {
  let ctx, errs;

  beforeEach(function() {
    errs = [];
  });

  describe('in values', function(){
    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = Foo { $num }
        bar = { foo }
        baz =
            [trait] Baz Trait { $num }
        qux = { "a" ->
            [a]     Baz Variant A { $num }
        }
      `);
    });

    it('can be used in the entity value', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, 'Foo 3');
      assert.equal(errs.length, 0);
    });

    it('can be used in the entity value which is referenced', function() {
      const msg = ctx.messages.get('bar');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, 'Foo 3');
      assert.equal(errs.length, 0);
    });

    it('can be used in a trait', function() {
      const msg = ctx.messages.get('baz').traits[0];
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, 'Baz Trait 3');
      assert.equal(errs.length, 0);
    });

    it('can be used in a variant', function() {
      const msg = ctx.messages.get('qux');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, 'Baz Variant A 3');
      assert.equal(errs.length, 0);
    });
  });

  describe('in selectors', function(){
    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $num -> 
            [3] Foo
        }
      `);
    });

    it('can be used as a selector', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, 'Foo');
      assert.equal(errs.length, 0);
    });
  });

  describe('in function calls', function(){
    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { NUMBER($num) }
        bar = { NUMBER(1, minimumFractionDigits: $num) }
      `);
    });

    it('can be a positional argument', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, '3');
      assert.equal(errs.length, 0);
    });

    it('can be a keyed argument', function() {
      const msg = ctx.messages.get('bar');
      const val = ctx.format(msg, { num: 3 }, errs);
      assert.equal(val, '1.000');
      assert.equal(errs.length, 0);
    });
  });

  describe('simple errors', function(){
    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $arg }
      `);
    });

    it('falls back to argument\'s name if it\'s missing', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, {}, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof ReferenceError); // unknown external
    });

    it('cannot be an dict-like object', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { arg: { prop: 1 } }, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof TypeError); // unsupported external type
    });

    it('cannot be a boolean', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { arg: true }, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof TypeError); // unsupported external type
    });

    it('cannot be undefined', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { arg: undefined }, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof TypeError); // unsupported external type
    });

    it('cannot be null', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { arg: null }, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof TypeError); // unsupported external type
    });

    it('cannot be a function', function() {
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, { arg: () => null }, errs);
      assert.equal(val, 'arg');
      assert(errs[0] instanceof TypeError); // unsupported external type
    });
  });

  describe('and strings', function(){
    let args;

    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $arg }
      `);
      args = {
        arg: 'Argument',
      };
    });

    it('can be a string', function(){
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, args, errs);
      assert.equal(val, 'Argument');
      assert.equal(errs.length, 0);
    });
  });

  describe('and numbers', function(){
    let args;

    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $arg }
      `);
      args = {
        arg: 1
      };
    });

    it('can be a number', function(){
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, args, errs);
      assert.equal(val, '1');
      assert.equal(errs.length, 0);
    });
  });

  describe('and arrays', function(){
    let args;

    before(function() {
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $arg1 }
        bar = { $arg2 }
      `);
      args = {
        arg1: ["a", "b"],
        arg2: ["a", 1]
      };
    });

    it('can be an array of strings', function(){
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, args, errs);
      assert.equal(val, 'a, b');
      assert.equal(errs.length, 0);
    });

    // XXX When passed as external args, convert JS types to FTL types
    // https://bugzil.la/1307116
    it.skip('can be an array of strings and numbers', function(){
      const msg = ctx.messages.get('bar');
      const val = ctx.format(msg, args, errs);
      assert.equal(val, 'a, 1');
      assert.equal(errs.length, 0);
    });
  });

  describe('and dates', function(){
    let args, dtf;

    before(function() {
      dtf = new Intl.DateTimeFormat('en-US');
      ctx = new MessageContext('en-US', { useIsolating: false });
      ctx.addMessages(ftl`
        foo = { $arg }
      `);
      args = {
        arg: new Date('2016-09-29')
      };
    });

    it('can be a date', function(){
      const msg = ctx.messages.get('foo');
      const val = ctx.format(msg, args, errs);
      // format the date argument to account for the testrunner's timezone
      assert.equal(val, dtf.format(args.arg));
      assert.equal(errs.length, 0);
    });
  });

});
