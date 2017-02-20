class Node {
  constructor() {}
}

class NodeList extends Node {
  constructor(body = [], comment = null) {
    super();
    this.type = 'NodeList';
    this.body = body;
    this.comment = comment;
  }
}

class Resource extends NodeList {
  constructor(body = [], comment = null) {
    super(body, comment);
    this.type = 'Resource';
  }
}

class Section extends NodeList {
  constructor(key, body = [], comment = null) {
    super(body, comment);
    this.type = 'Section';
    this.key = key;
  }
}

class Entry extends Node {
  constructor() {
    super();
    this.type = 'Entry';
  }
}

class Identifier extends Node {
  constructor(name) {
    super();
    this.type = 'Identifier';
    this.name = name;
  }
}

class Pattern extends Node {
  constructor(source, elements, quoted = false) {
    super();
    this.type = 'Pattern';
    this.source = source;
    this.elements = elements;
    this.quoted = quoted;
  }
}

class Member extends Node {
  constructor(key, value, def = false) {
    super();
    this.type = 'Member';
    this.key = key;
    this.value = value;
    this.default = def;
  }
}

class Entity extends Entry {
  constructor(id, value = null, traits = [], comment = null) {
    super();
    this.type = 'Entity';
    this.id = id;
    this.value = value;
    this.traits = traits;
    this.comment = comment;
  }
}

class Placeable extends Node {
  constructor(expressions) {
    super();
    this.type = 'Placeable';
    this.expressions = expressions;
  }
}

class SelectExpression extends Node {
  constructor(expression, variants = null) {
    super();
    this.type = 'SelectExpression';
    this.expression = expression;
    this.variants = variants;
  }
}

class MemberExpression extends Node {
  constructor(obj, keyword) {
    super();
    this.type = 'MemberExpression';
    this.object = obj;
    this.keyword = keyword;
  }
}

class CallExpression extends Node {
  constructor(callee, args) {
    super();
    this.type = 'CallExpression';
    this.callee = callee;
    this.args = args;
  }
}

class ExternalArgument extends Node {
  constructor(name) {
    super();
    this.type = 'ExternalArgument';
    this.name = name;
  }
}

class KeyValueArg extends Node {
  constructor(name, value) {
    super();
    this.type = 'KeyValueArg';
    this.name = name;
    this.value = value;
  }
}

class EntityReference extends Identifier {
  constructor(name) {
    super(name);
    this.type = 'EntityReference';
  }
}

class FunctionReference extends Identifier {
  constructor(name) {
    super(name);
    this.type = 'FunctionReference';
  }
}

class Keyword extends Identifier {
  constructor(name, namespace = null) {
    super(name);
    this.type = 'Keyword';
    this.namespace = namespace;
  }
}

class Number extends Node {
  constructor(value) {
    super();
    this.type = 'Number';
    this.value = value;
  }
}

class TextElement extends Node {
  constructor(value) {
    super();
    this.type = 'TextElement';
    this.value = value;
  }
}

class Comment extends Node {
  constructor(content) {
    super();
    this.type = 'Comment';
    this.content = content;
  }
}

class JunkEntry extends Entry {
  constructor(content) {
    super();
    this.type = 'JunkEntry';
    this.content = content;
  }
}

export default {
  Node,
  Pattern,
  Member,
  Identifier,
  Entity,
  Section,
  Resource,
  Placeable,
  SelectExpression,
  MemberExpression,
  CallExpression,
  ExternalArgument,
  KeyValueArg,
  Number,
  EntityReference,
  FunctionReference,
  Keyword,
  TextElement,
  Comment,
  JunkEntry
};
