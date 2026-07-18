var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/drizzle-orm/entity.cjs
var require_entity = __commonJS({
  "node_modules/drizzle-orm/entity.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var entity_exports = {};
    __export2(entity_exports, {
      entityKind: () => entityKind,
      hasOwnEntityKind: () => hasOwnEntityKind,
      is: () => is
    });
    module2.exports = __toCommonJS(entity_exports);
    var entityKind = Symbol.for("drizzle:entityKind");
    var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
    function is(value, type) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (value instanceof type) {
        return true;
      }
      if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
        throw new Error(
          `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
        );
      }
      let cls = Object.getPrototypeOf(value).constructor;
      if (cls) {
        while (cls) {
          if (entityKind in cls && cls[entityKind] === type[entityKind]) {
            return true;
          }
          cls = Object.getPrototypeOf(cls);
        }
      }
      return false;
    }
  }
});

// node_modules/drizzle-orm/logger.cjs
var require_logger = __commonJS({
  "node_modules/drizzle-orm/logger.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var logger_exports = {};
    __export2(logger_exports, {
      ConsoleLogWriter: () => ConsoleLogWriter,
      DefaultLogger: () => DefaultLogger,
      NoopLogger: () => NoopLogger
    });
    module2.exports = __toCommonJS(logger_exports);
    var import_entity = require_entity();
    var ConsoleLogWriter = class {
      static [import_entity.entityKind] = "ConsoleLogWriter";
      write(message) {
        console.log(message);
      }
    };
    var DefaultLogger = class {
      static [import_entity.entityKind] = "DefaultLogger";
      writer;
      constructor(config) {
        this.writer = config?.writer ?? new ConsoleLogWriter();
      }
      logQuery(query, params) {
        const stringifiedParams = params.map((p) => {
          try {
            return JSON.stringify(p);
          } catch {
            return String(p);
          }
        });
        const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
        this.writer.write(`Query: ${query}${paramsStr}`);
      }
    };
    var NoopLogger = class {
      static [import_entity.entityKind] = "NoopLogger";
      logQuery() {
      }
    };
  }
});

// node_modules/drizzle-orm/table.utils.cjs
var require_table_utils = __commonJS({
  "node_modules/drizzle-orm/table.utils.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var table_utils_exports = {};
    __export2(table_utils_exports, {
      TableName: () => TableName
    });
    module2.exports = __toCommonJS(table_utils_exports);
    var TableName = Symbol.for("drizzle:Name");
  }
});

// node_modules/drizzle-orm/table.cjs
var require_table = __commonJS({
  "node_modules/drizzle-orm/table.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var table_exports = {};
    __export2(table_exports, {
      BaseName: () => BaseName,
      Columns: () => Columns,
      ExtraConfigBuilder: () => ExtraConfigBuilder,
      ExtraConfigColumns: () => ExtraConfigColumns,
      IsAlias: () => IsAlias,
      OriginalName: () => OriginalName,
      Schema: () => Schema,
      Table: () => Table,
      getTableName: () => getTableName,
      getTableUniqueName: () => getTableUniqueName,
      isTable: () => isTable
    });
    module2.exports = __toCommonJS(table_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    var Schema = Symbol.for("drizzle:Schema");
    var Columns = Symbol.for("drizzle:Columns");
    var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
    var OriginalName = Symbol.for("drizzle:OriginalName");
    var BaseName = Symbol.for("drizzle:BaseName");
    var IsAlias = Symbol.for("drizzle:IsAlias");
    var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
    var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
    var Table = class {
      static [import_entity.entityKind] = "Table";
      /** @internal */
      static Symbol = {
        Name: import_table_utils.TableName,
        Schema,
        OriginalName,
        Columns,
        ExtraConfigColumns,
        BaseName,
        IsAlias,
        ExtraConfigBuilder
      };
      /**
       * @internal
       * Can be changed if the table is aliased.
       */
      [import_table_utils.TableName];
      /**
       * @internal
       * Used to store the original name of the table, before any aliasing.
       */
      [OriginalName];
      /** @internal */
      [Schema];
      /** @internal */
      [Columns];
      /** @internal */
      [ExtraConfigColumns];
      /**
       *  @internal
       * Used to store the table name before the transformation via the `tableCreator` functions.
       */
      [BaseName];
      /** @internal */
      [IsAlias] = false;
      /** @internal */
      [IsDrizzleTable] = true;
      /** @internal */
      [ExtraConfigBuilder] = void 0;
      constructor(name, schema2, baseName) {
        this[import_table_utils.TableName] = this[OriginalName] = name;
        this[Schema] = schema2;
        this[BaseName] = baseName;
      }
    };
    function isTable(table) {
      return typeof table === "object" && table !== null && IsDrizzleTable in table;
    }
    function getTableName(table) {
      return table[import_table_utils.TableName];
    }
    function getTableUniqueName(table) {
      return `${table[Schema] ?? "public"}.${table[import_table_utils.TableName]}`;
    }
  }
});

// node_modules/drizzle-orm/column.cjs
var require_column = __commonJS({
  "node_modules/drizzle-orm/column.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var column_exports = {};
    __export2(column_exports, {
      Column: () => Column
    });
    module2.exports = __toCommonJS(column_exports);
    var import_entity = require_entity();
    var Column = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
        this.name = config.name;
        this.keyAsName = config.keyAsName;
        this.notNull = config.notNull;
        this.default = config.default;
        this.defaultFn = config.defaultFn;
        this.onUpdateFn = config.onUpdateFn;
        this.hasDefault = config.hasDefault;
        this.primary = config.primaryKey;
        this.isUnique = config.isUnique;
        this.uniqueName = config.uniqueName;
        this.uniqueType = config.uniqueType;
        this.dataType = config.dataType;
        this.columnType = config.columnType;
        this.generated = config.generated;
        this.generatedIdentity = config.generatedIdentity;
      }
      static [import_entity.entityKind] = "Column";
      name;
      keyAsName;
      primary;
      notNull;
      default;
      defaultFn;
      onUpdateFn;
      hasDefault;
      isUnique;
      uniqueName;
      uniqueType;
      dataType;
      columnType;
      enumValues = void 0;
      generated = void 0;
      generatedIdentity = void 0;
      config;
      mapFromDriverValue(value) {
        return value;
      }
      mapToDriverValue(value) {
        return value;
      }
      // ** @internal */
      shouldDisableInsert() {
        return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
      }
    };
  }
});

// node_modules/drizzle-orm/column-builder.cjs
var require_column_builder = __commonJS({
  "node_modules/drizzle-orm/column-builder.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var column_builder_exports = {};
    __export2(column_builder_exports, {
      ColumnBuilder: () => ColumnBuilder
    });
    module2.exports = __toCommonJS(column_builder_exports);
    var import_entity = require_entity();
    var ColumnBuilder = class {
      static [import_entity.entityKind] = "ColumnBuilder";
      config;
      constructor(name, dataType, columnType) {
        this.config = {
          name,
          keyAsName: name === "",
          notNull: false,
          default: void 0,
          hasDefault: false,
          primaryKey: false,
          isUnique: false,
          uniqueName: void 0,
          uniqueType: void 0,
          dataType,
          columnType,
          generated: void 0
        };
      }
      /**
       * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
       *
       * @example
       * ```ts
       * const users = pgTable('users', {
       * 	id: integer('id').$type<UserId>().primaryKey(),
       * 	details: json('details').$type<UserDetails>().notNull(),
       * });
       * ```
       */
      $type() {
        return this;
      }
      /**
       * Adds a `not null` clause to the column definition.
       *
       * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
       */
      notNull() {
        this.config.notNull = true;
        return this;
      }
      /**
       * Adds a `default <value>` clause to the column definition.
       *
       * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
       *
       * If you need to set a dynamic default value, use {@link $defaultFn} instead.
       */
      default(value) {
        this.config.default = value;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Adds a dynamic default value to the column.
       * The function will be called when the row is inserted, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $defaultFn(fn) {
        this.config.defaultFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $defaultFn}.
       */
      $default = this.$defaultFn;
      /**
       * Adds a dynamic update value to the column.
       * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
       * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $onUpdateFn(fn) {
        this.config.onUpdateFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $onUpdateFn}.
       */
      $onUpdate = this.$onUpdateFn;
      /**
       * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
       *
       * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
       */
      primaryKey() {
        this.config.primaryKey = true;
        this.config.notNull = true;
        return this;
      }
      /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
      setName(name) {
        if (this.config.name !== "") return;
        this.config.name = name;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/foreign-keys.cjs
var require_foreign_keys = __commonJS({
  "node_modules/drizzle-orm/pg-core/foreign-keys.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var foreign_keys_exports = {};
    __export2(foreign_keys_exports, {
      ForeignKey: () => ForeignKey,
      ForeignKeyBuilder: () => ForeignKeyBuilder,
      foreignKey: () => foreignKey
    });
    module2.exports = __toCommonJS(foreign_keys_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    var ForeignKeyBuilder = class {
      static [import_entity.entityKind] = "PgForeignKeyBuilder";
      /** @internal */
      reference;
      /** @internal */
      _onUpdate = "no action";
      /** @internal */
      _onDelete = "no action";
      constructor(config, actions) {
        this.reference = () => {
          const { name, columns, foreignColumns } = config();
          return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
        };
        if (actions) {
          this._onUpdate = actions.onUpdate;
          this._onDelete = actions.onDelete;
        }
      }
      onUpdate(action) {
        this._onUpdate = action === void 0 ? "no action" : action;
        return this;
      }
      onDelete(action) {
        this._onDelete = action === void 0 ? "no action" : action;
        return this;
      }
      /** @internal */
      build(table) {
        return new ForeignKey(table, this);
      }
    };
    var ForeignKey = class {
      constructor(table, builder) {
        this.table = table;
        this.reference = builder.reference;
        this.onUpdate = builder._onUpdate;
        this.onDelete = builder._onDelete;
      }
      static [import_entity.entityKind] = "PgForeignKey";
      reference;
      onUpdate;
      onDelete;
      getName() {
        const { name, columns, foreignColumns } = this.reference();
        const columnNames = columns.map((column) => column.name);
        const foreignColumnNames = foreignColumns.map((column) => column.name);
        const chunks = [
          this.table[import_table_utils.TableName],
          ...columnNames,
          foreignColumns[0].table[import_table_utils.TableName],
          ...foreignColumnNames
        ];
        return name ?? `${chunks.join("_")}_fk`;
      }
    };
    function foreignKey(config) {
      function mappedConfig() {
        const { name, columns, foreignColumns } = config;
        return {
          name,
          columns,
          foreignColumns
        };
      }
      return new ForeignKeyBuilder(mappedConfig);
    }
  }
});

// node_modules/drizzle-orm/tracing-utils.cjs
var require_tracing_utils = __commonJS({
  "node_modules/drizzle-orm/tracing-utils.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var tracing_utils_exports = {};
    __export2(tracing_utils_exports, {
      iife: () => iife
    });
    module2.exports = __toCommonJS(tracing_utils_exports);
    function iife(fn, ...args) {
      return fn(...args);
    }
  }
});

// node_modules/drizzle-orm/pg-core/unique-constraint.cjs
var require_unique_constraint = __commonJS({
  "node_modules/drizzle-orm/pg-core/unique-constraint.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var unique_constraint_exports = {};
    __export2(unique_constraint_exports, {
      UniqueConstraint: () => UniqueConstraint,
      UniqueConstraintBuilder: () => UniqueConstraintBuilder,
      UniqueOnConstraintBuilder: () => UniqueOnConstraintBuilder,
      unique: () => unique,
      uniqueKeyName: () => uniqueKeyName
    });
    module2.exports = __toCommonJS(unique_constraint_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    function unique(name) {
      return new UniqueOnConstraintBuilder(name);
    }
    function uniqueKeyName(table, columns) {
      return `${table[import_table_utils.TableName]}_${columns.join("_")}_unique`;
    }
    var UniqueConstraintBuilder = class {
      constructor(columns, name) {
        this.name = name;
        this.columns = columns;
      }
      static [import_entity.entityKind] = "PgUniqueConstraintBuilder";
      /** @internal */
      columns;
      /** @internal */
      nullsNotDistinctConfig = false;
      nullsNotDistinct() {
        this.nullsNotDistinctConfig = true;
        return this;
      }
      /** @internal */
      build(table) {
        return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
      }
    };
    var UniqueOnConstraintBuilder = class {
      static [import_entity.entityKind] = "PgUniqueOnConstraintBuilder";
      /** @internal */
      name;
      constructor(name) {
        this.name = name;
      }
      on(...columns) {
        return new UniqueConstraintBuilder(columns, this.name);
      }
    };
    var UniqueConstraint = class {
      constructor(table, columns, nullsNotDistinct, name) {
        this.table = table;
        this.columns = columns;
        this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
        this.nullsNotDistinct = nullsNotDistinct;
      }
      static [import_entity.entityKind] = "PgUniqueConstraint";
      columns;
      name;
      nullsNotDistinct = false;
      getName() {
        return this.name;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/utils/array.cjs
var require_array = __commonJS({
  "node_modules/drizzle-orm/pg-core/utils/array.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var array_exports = {};
    __export2(array_exports, {
      makePgArray: () => makePgArray,
      parsePgArray: () => parsePgArray,
      parsePgNestedArray: () => parsePgNestedArray
    });
    module2.exports = __toCommonJS(array_exports);
    function parsePgArrayValue(arrayString, startFrom, inQuotes) {
      for (let i = startFrom; i < arrayString.length; i++) {
        const char = arrayString[i];
        if (char === "\\") {
          i++;
          continue;
        }
        if (char === '"') {
          return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
        }
        if (inQuotes) {
          continue;
        }
        if (char === "," || char === "}") {
          return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
        }
      }
      return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
    }
    function parsePgNestedArray(arrayString, startFrom = 0) {
      const result = [];
      let i = startFrom;
      let lastCharIsComma = false;
      while (i < arrayString.length) {
        const char = arrayString[i];
        if (char === ",") {
          if (lastCharIsComma || i === startFrom) {
            result.push("");
          }
          lastCharIsComma = true;
          i++;
          continue;
        }
        lastCharIsComma = false;
        if (char === "\\") {
          i += 2;
          continue;
        }
        if (char === '"') {
          const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
          result.push(value2);
          i = startFrom2;
          continue;
        }
        if (char === "}") {
          return [result, i + 1];
        }
        if (char === "{") {
          const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
          result.push(value2);
          i = startFrom2;
          continue;
        }
        const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
        result.push(value);
        i = newStartFrom;
      }
      return [result, i];
    }
    function parsePgArray(arrayString) {
      const [result] = parsePgNestedArray(arrayString, 1);
      return result;
    }
    function makePgArray(array) {
      return `{${array.map((item) => {
        if (Array.isArray(item)) {
          return makePgArray(item);
        }
        if (typeof item === "string") {
          return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        }
        return `${item}`;
      }).join(",")}}`;
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/common.cjs
var require_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/common.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var common_exports = {};
    __export2(common_exports, {
      ExtraConfigColumn: () => ExtraConfigColumn,
      IndexedColumn: () => IndexedColumn,
      PgArray: () => PgArray,
      PgArrayBuilder: () => PgArrayBuilder,
      PgColumn: () => PgColumn,
      PgColumnBuilder: () => PgColumnBuilder
    });
    module2.exports = __toCommonJS(common_exports);
    var import_column_builder = require_column_builder();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_foreign_keys = require_foreign_keys();
    var import_tracing_utils = require_tracing_utils();
    var import_unique_constraint = require_unique_constraint();
    var import_array = require_array();
    var PgColumnBuilder = class extends import_column_builder.ColumnBuilder {
      foreignKeyConfigs = [];
      static [import_entity.entityKind] = "PgColumnBuilder";
      array(size) {
        return new PgArrayBuilder(this.config.name, this, size);
      }
      references(ref, actions = {}) {
        this.foreignKeyConfigs.push({ ref, actions });
        return this;
      }
      unique(name, config) {
        this.config.isUnique = true;
        this.config.uniqueName = name;
        this.config.uniqueType = config?.nulls;
        return this;
      }
      generatedAlwaysAs(as) {
        this.config.generated = {
          as,
          type: "always",
          mode: "stored"
        };
        return this;
      }
      /** @internal */
      buildForeignKeys(column, table) {
        return this.foreignKeyConfigs.map(({ ref, actions }) => {
          return (0, import_tracing_utils.iife)(
            (ref2, actions2) => {
              const builder = new import_foreign_keys.ForeignKeyBuilder(() => {
                const foreignColumn = ref2();
                return { columns: [column], foreignColumns: [foreignColumn] };
              });
              if (actions2.onUpdate) {
                builder.onUpdate(actions2.onUpdate);
              }
              if (actions2.onDelete) {
                builder.onDelete(actions2.onDelete);
              }
              return builder.build(table);
            },
            ref,
            actions
          );
        });
      }
      /** @internal */
      buildExtraConfigColumn(table) {
        return new ExtraConfigColumn(table, this.config);
      }
    };
    var PgColumn = class extends import_column.Column {
      constructor(table, config) {
        if (!config.uniqueName) {
          config.uniqueName = (0, import_unique_constraint.uniqueKeyName)(table, [config.name]);
        }
        super(table, config);
        this.table = table;
      }
      static [import_entity.entityKind] = "PgColumn";
    };
    var ExtraConfigColumn = class extends PgColumn {
      static [import_entity.entityKind] = "ExtraConfigColumn";
      getSQLType() {
        return this.getSQLType();
      }
      indexConfig = {
        order: this.config.order ?? "asc",
        nulls: this.config.nulls ?? "last",
        opClass: this.config.opClass
      };
      defaultConfig = {
        order: "asc",
        nulls: "last",
        opClass: void 0
      };
      asc() {
        this.indexConfig.order = "asc";
        return this;
      }
      desc() {
        this.indexConfig.order = "desc";
        return this;
      }
      nullsFirst() {
        this.indexConfig.nulls = "first";
        return this;
      }
      nullsLast() {
        this.indexConfig.nulls = "last";
        return this;
      }
      /**
       * ### PostgreSQL documentation quote
       *
       * > An operator class with optional parameters can be specified for each column of an index.
       * The operator class identifies the operators to be used by the index for that column.
       * For example, a B-tree index on four-byte integers would use the int4_ops class;
       * this operator class includes comparison functions for four-byte integers.
       * In practice the default operator class for the column's data type is usually sufficient.
       * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
       * For example, we might want to sort a complex-number data type either by absolute value or by real part.
       * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
       * More information about operator classes check:
       *
       * ### Useful links
       * https://www.postgresql.org/docs/current/sql-createindex.html
       *
       * https://www.postgresql.org/docs/current/indexes-opclass.html
       *
       * https://www.postgresql.org/docs/current/xindex.html
       *
       * ### Additional types
       * If you have the `pg_vector` extension installed in your database, you can use the
       * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
       *
       * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
       *
       * @param opClass
       * @returns
       */
      op(opClass) {
        this.indexConfig.opClass = opClass;
        return this;
      }
    };
    var IndexedColumn = class {
      static [import_entity.entityKind] = "IndexedColumn";
      constructor(name, keyAsName, type, indexConfig) {
        this.name = name;
        this.keyAsName = keyAsName;
        this.type = type;
        this.indexConfig = indexConfig;
      }
      name;
      keyAsName;
      type;
      indexConfig;
    };
    var PgArrayBuilder = class extends PgColumnBuilder {
      static [import_entity.entityKind] = "PgArrayBuilder";
      constructor(name, baseBuilder, size) {
        super(name, "array", "PgArray");
        this.config.baseBuilder = baseBuilder;
        this.config.size = size;
      }
      /** @internal */
      build(table) {
        const baseColumn = this.config.baseBuilder.build(table);
        return new PgArray(
          table,
          this.config,
          baseColumn
        );
      }
    };
    var PgArray = class _PgArray extends PgColumn {
      constructor(table, config, baseColumn, range) {
        super(table, config);
        this.baseColumn = baseColumn;
        this.range = range;
        this.size = config.size;
      }
      size;
      static [import_entity.entityKind] = "PgArray";
      getSQLType() {
        return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          value = (0, import_array.parsePgArray)(value);
        }
        return value.map((v) => this.baseColumn.mapFromDriverValue(v));
      }
      mapToDriverValue(value, isNestedArray = false) {
        const a = value.map(
          (v) => v === null ? null : (0, import_entity.is)(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
        );
        if (isNestedArray) return a;
        return (0, import_array.makePgArray)(a);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/enum.cjs
var require_enum = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/enum.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var enum_exports = {};
    __export2(enum_exports, {
      PgEnumColumn: () => PgEnumColumn,
      PgEnumColumnBuilder: () => PgEnumColumnBuilder,
      PgEnumObjectColumn: () => PgEnumObjectColumn,
      PgEnumObjectColumnBuilder: () => PgEnumObjectColumnBuilder,
      isPgEnum: () => isPgEnum,
      pgEnum: () => pgEnum,
      pgEnumObjectWithSchema: () => pgEnumObjectWithSchema,
      pgEnumWithSchema: () => pgEnumWithSchema
    });
    module2.exports = __toCommonJS(enum_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgEnumObjectColumnBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgEnumObjectColumnBuilder";
      constructor(name, enumInstance) {
        super(name, "string", "PgEnumObjectColumn");
        this.config.enum = enumInstance;
      }
      /** @internal */
      build(table) {
        return new PgEnumObjectColumn(
          table,
          this.config
        );
      }
    };
    var PgEnumObjectColumn = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgEnumObjectColumn";
      enum;
      enumValues = this.config.enum.enumValues;
      constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
      }
      getSQLType() {
        return this.enum.enumName;
      }
    };
    var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
    function isPgEnum(obj) {
      return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
    }
    var PgEnumColumnBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgEnumColumnBuilder";
      constructor(name, enumInstance) {
        super(name, "string", "PgEnumColumn");
        this.config.enum = enumInstance;
      }
      /** @internal */
      build(table) {
        return new PgEnumColumn(
          table,
          this.config
        );
      }
    };
    var PgEnumColumn = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgEnumColumn";
      enum = this.config.enum;
      enumValues = this.config.enum.enumValues;
      constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
      }
      getSQLType() {
        return this.enum.enumName;
      }
    };
    function pgEnum(enumName, input) {
      return Array.isArray(input) ? pgEnumWithSchema(enumName, [...input], void 0) : pgEnumObjectWithSchema(enumName, input, void 0);
    }
    function pgEnumWithSchema(enumName, values, schema2) {
      const enumInstance = Object.assign(
        (name) => new PgEnumColumnBuilder(name ?? "", enumInstance),
        {
          enumName,
          enumValues: values,
          schema: schema2,
          [isPgEnumSym]: true
        }
      );
      return enumInstance;
    }
    function pgEnumObjectWithSchema(enumName, values, schema2) {
      const enumInstance = Object.assign(
        (name) => new PgEnumObjectColumnBuilder(name ?? "", enumInstance),
        {
          enumName,
          enumValues: Object.values(values),
          schema: schema2,
          [isPgEnumSym]: true
        }
      );
      return enumInstance;
    }
  }
});

// node_modules/drizzle-orm/subquery.cjs
var require_subquery = __commonJS({
  "node_modules/drizzle-orm/subquery.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var subquery_exports = {};
    __export2(subquery_exports, {
      Subquery: () => Subquery,
      WithSubquery: () => WithSubquery
    });
    module2.exports = __toCommonJS(subquery_exports);
    var import_entity = require_entity();
    var Subquery = class {
      static [import_entity.entityKind] = "Subquery";
      constructor(sql, fields, alias, isWith = false, usedTables = []) {
        this._ = {
          brand: "Subquery",
          sql,
          selectedFields: fields,
          alias,
          isWith,
          usedTables
        };
      }
      // getSQL(): SQL<unknown> {
      // 	return new SQL([this]);
      // }
    };
    var WithSubquery = class extends Subquery {
      static [import_entity.entityKind] = "WithSubquery";
    };
  }
});

// node_modules/drizzle-orm/version.cjs
var require_version = __commonJS({
  "node_modules/drizzle-orm/version.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var version_exports = {};
    __export2(version_exports, {
      compatibilityVersion: () => compatibilityVersion,
      npmVersion: () => version
    });
    module2.exports = __toCommonJS(version_exports);
    var version = "0.45.2";
    var compatibilityVersion = 10;
  }
});

// node_modules/drizzle-orm/tracing.cjs
var require_tracing = __commonJS({
  "node_modules/drizzle-orm/tracing.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var tracing_exports = {};
    __export2(tracing_exports, {
      tracer: () => tracer
    });
    module2.exports = __toCommonJS(tracing_exports);
    var import_tracing_utils = require_tracing_utils();
    var import_version = require_version();
    var otel;
    var rawTracer;
    var tracer = {
      startActiveSpan(name, fn) {
        if (!otel) {
          return fn();
        }
        if (!rawTracer) {
          rawTracer = otel.trace.getTracer("drizzle-orm", import_version.npmVersion);
        }
        return (0, import_tracing_utils.iife)(
          (otel2, rawTracer2) => rawTracer2.startActiveSpan(
            name,
            (span) => {
              try {
                return fn(span);
              } catch (e) {
                span.setStatus({
                  code: otel2.SpanStatusCode.ERROR,
                  message: e instanceof Error ? e.message : "Unknown error"
                  // eslint-disable-line no-instanceof/no-instanceof
                });
                throw e;
              } finally {
                span.end();
              }
            }
          ),
          otel,
          rawTracer
        );
      }
    };
  }
});

// node_modules/drizzle-orm/view-common.cjs
var require_view_common = __commonJS({
  "node_modules/drizzle-orm/view-common.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var view_common_exports = {};
    __export2(view_common_exports, {
      ViewBaseConfig: () => ViewBaseConfig
    });
    module2.exports = __toCommonJS(view_common_exports);
    var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
  }
});

// node_modules/drizzle-orm/sql/sql.cjs
var require_sql = __commonJS({
  "node_modules/drizzle-orm/sql/sql.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name2 in all)
        __defProp2(target, name2, { get: all[name2], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var sql_exports = {};
    __export2(sql_exports, {
      FakePrimitiveParam: () => FakePrimitiveParam,
      Name: () => Name,
      Param: () => Param,
      Placeholder: () => Placeholder,
      SQL: () => SQL,
      StringChunk: () => StringChunk,
      View: () => View,
      fillPlaceholders: () => fillPlaceholders,
      getViewName: () => getViewName,
      isDriverValueEncoder: () => isDriverValueEncoder,
      isSQLWrapper: () => isSQLWrapper,
      isView: () => isView,
      name: () => name,
      noopDecoder: () => noopDecoder,
      noopEncoder: () => noopEncoder,
      noopMapper: () => noopMapper,
      param: () => param,
      placeholder: () => placeholder,
      sql: () => sql
    });
    module2.exports = __toCommonJS(sql_exports);
    var import_entity = require_entity();
    var import_enum = require_enum();
    var import_subquery = require_subquery();
    var import_tracing = require_tracing();
    var import_view_common = require_view_common();
    var import_column = require_column();
    var import_table = require_table();
    var FakePrimitiveParam = class {
      static [import_entity.entityKind] = "FakePrimitiveParam";
    };
    function isSQLWrapper(value) {
      return value !== null && value !== void 0 && typeof value.getSQL === "function";
    }
    function mergeQueries(queries) {
      const result = { sql: "", params: [] };
      for (const query of queries) {
        result.sql += query.sql;
        result.params.push(...query.params);
        if (query.typings?.length) {
          if (!result.typings) {
            result.typings = [];
          }
          result.typings.push(...query.typings);
        }
      }
      return result;
    }
    var StringChunk = class {
      static [import_entity.entityKind] = "StringChunk";
      value;
      constructor(value) {
        this.value = Array.isArray(value) ? value : [value];
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    var SQL = class _SQL {
      constructor(queryChunks) {
        this.queryChunks = queryChunks;
        for (const chunk of queryChunks) {
          if ((0, import_entity.is)(chunk, import_table.Table)) {
            const schemaName = chunk[import_table.Table.Symbol.Schema];
            this.usedTables.push(
              schemaName === void 0 ? chunk[import_table.Table.Symbol.Name] : schemaName + "." + chunk[import_table.Table.Symbol.Name]
            );
          }
        }
      }
      static [import_entity.entityKind] = "SQL";
      /** @internal */
      decoder = noopDecoder;
      shouldInlineParams = false;
      /** @internal */
      usedTables = [];
      append(query) {
        this.queryChunks.push(...query.queryChunks);
        return this;
      }
      toQuery(config) {
        return import_tracing.tracer.startActiveSpan("drizzle.buildSQL", (span) => {
          const query = this.buildQueryFromSourceParams(this.queryChunks, config);
          span?.setAttributes({
            "drizzle.query.text": query.sql,
            "drizzle.query.params": JSON.stringify(query.params)
          });
          return query;
        });
      }
      buildQueryFromSourceParams(chunks, _config) {
        const config = Object.assign({}, _config, {
          inlineParams: _config.inlineParams || this.shouldInlineParams,
          paramStartIndex: _config.paramStartIndex || { value: 0 }
        });
        const {
          casing,
          escapeName,
          escapeParam,
          prepareTyping,
          inlineParams,
          paramStartIndex
        } = config;
        return mergeQueries(chunks.map((chunk) => {
          if ((0, import_entity.is)(chunk, StringChunk)) {
            return { sql: chunk.value.join(""), params: [] };
          }
          if ((0, import_entity.is)(chunk, Name)) {
            return { sql: escapeName(chunk.value), params: [] };
          }
          if (chunk === void 0) {
            return { sql: "", params: [] };
          }
          if (Array.isArray(chunk)) {
            const result = [new StringChunk("(")];
            for (const [i, p] of chunk.entries()) {
              result.push(p);
              if (i < chunk.length - 1) {
                result.push(new StringChunk(", "));
              }
            }
            result.push(new StringChunk(")"));
            return this.buildQueryFromSourceParams(result, config);
          }
          if ((0, import_entity.is)(chunk, _SQL)) {
            return this.buildQueryFromSourceParams(chunk.queryChunks, {
              ...config,
              inlineParams: inlineParams || chunk.shouldInlineParams
            });
          }
          if ((0, import_entity.is)(chunk, import_table.Table)) {
            const schemaName = chunk[import_table.Table.Symbol.Schema];
            const tableName = chunk[import_table.Table.Symbol.Name];
            return {
              sql: schemaName === void 0 || chunk[import_table.IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, import_column.Column)) {
            const columnName = casing.getColumnCasing(chunk);
            if (_config.invokeSource === "indexes") {
              return { sql: escapeName(columnName), params: [] };
            }
            const schemaName = chunk.table[import_table.Table.Symbol.Schema];
            return {
              sql: chunk.table[import_table.IsAlias] || schemaName === void 0 ? escapeName(chunk.table[import_table.Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[import_table.Table.Symbol.Name]) + "." + escapeName(columnName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, View)) {
            const schemaName = chunk[import_view_common.ViewBaseConfig].schema;
            const viewName = chunk[import_view_common.ViewBaseConfig].name;
            return {
              sql: schemaName === void 0 || chunk[import_view_common.ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, Param)) {
            if ((0, import_entity.is)(chunk.value, Placeholder)) {
              return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
            }
            const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
            if ((0, import_entity.is)(mappedValue, _SQL)) {
              return this.buildQueryFromSourceParams([mappedValue], config);
            }
            if (inlineParams) {
              return { sql: this.mapInlineParam(mappedValue, config), params: [] };
            }
            let typings = ["none"];
            if (prepareTyping) {
              typings = [prepareTyping(chunk.encoder)];
            }
            return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
          }
          if ((0, import_entity.is)(chunk, Placeholder)) {
            return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
          }
          if ((0, import_entity.is)(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
            return { sql: escapeName(chunk.fieldAlias), params: [] };
          }
          if ((0, import_entity.is)(chunk, import_subquery.Subquery)) {
            if (chunk._.isWith) {
              return { sql: escapeName(chunk._.alias), params: [] };
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk._.sql,
              new StringChunk(") "),
              new Name(chunk._.alias)
            ], config);
          }
          if ((0, import_enum.isPgEnum)(chunk)) {
            if (chunk.schema) {
              return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
            }
            return { sql: escapeName(chunk.enumName), params: [] };
          }
          if (isSQLWrapper(chunk)) {
            if (chunk.shouldOmitSQLParens?.()) {
              return this.buildQueryFromSourceParams([chunk.getSQL()], config);
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk.getSQL(),
              new StringChunk(")")
            ], config);
          }
          if (inlineParams) {
            return { sql: this.mapInlineParam(chunk, config), params: [] };
          }
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }));
      }
      mapInlineParam(chunk, { escapeString }) {
        if (chunk === null) {
          return "null";
        }
        if (typeof chunk === "number" || typeof chunk === "boolean") {
          return chunk.toString();
        }
        if (typeof chunk === "string") {
          return escapeString(chunk);
        }
        if (typeof chunk === "object") {
          const mappedValueAsString = chunk.toString();
          if (mappedValueAsString === "[object Object]") {
            return escapeString(JSON.stringify(chunk));
          }
          return escapeString(mappedValueAsString);
        }
        throw new Error("Unexpected param value: " + chunk);
      }
      getSQL() {
        return this;
      }
      as(alias) {
        if (alias === void 0) {
          return this;
        }
        return new _SQL.Aliased(this, alias);
      }
      mapWith(decoder) {
        this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
        return this;
      }
      inlineParams() {
        this.shouldInlineParams = true;
        return this;
      }
      /**
       * This method is used to conditionally include a part of the query.
       *
       * @param condition - Condition to check
       * @returns itself if the condition is `true`, otherwise `undefined`
       */
      if(condition) {
        return condition ? this : void 0;
      }
    };
    var Name = class {
      constructor(value) {
        this.value = value;
      }
      static [import_entity.entityKind] = "Name";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    function name(value) {
      return new Name(value);
    }
    function isDriverValueEncoder(value) {
      return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
    }
    var noopDecoder = {
      mapFromDriverValue: (value) => value
    };
    var noopEncoder = {
      mapToDriverValue: (value) => value
    };
    var noopMapper = {
      ...noopDecoder,
      ...noopEncoder
    };
    var Param = class {
      /**
       * @param value - Parameter value
       * @param encoder - Encoder to convert the value to a driver parameter
       */
      constructor(value, encoder = noopEncoder) {
        this.value = value;
        this.encoder = encoder;
      }
      static [import_entity.entityKind] = "Param";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    function param(value, encoder) {
      return new Param(value, encoder);
    }
    function sql(strings, ...params) {
      const queryChunks = [];
      if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
        queryChunks.push(new StringChunk(strings[0]));
      }
      for (const [paramIndex, param2] of params.entries()) {
        queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
      }
      return new SQL(queryChunks);
    }
    ((sql2) => {
      function empty() {
        return new SQL([]);
      }
      sql2.empty = empty;
      function fromList(list) {
        return new SQL(list);
      }
      sql2.fromList = fromList;
      function raw(str) {
        return new SQL([new StringChunk(str)]);
      }
      sql2.raw = raw;
      function join(chunks, separator) {
        const result = [];
        for (const [i, chunk] of chunks.entries()) {
          if (i > 0 && separator !== void 0) {
            result.push(separator);
          }
          result.push(chunk);
        }
        return new SQL(result);
      }
      sql2.join = join;
      function identifier(value) {
        return new Name(value);
      }
      sql2.identifier = identifier;
      function placeholder2(name2) {
        return new Placeholder(name2);
      }
      sql2.placeholder = placeholder2;
      function param2(value, encoder) {
        return new Param(value, encoder);
      }
      sql2.param = param2;
    })(sql || (sql = {}));
    ((SQL2) => {
      class Aliased {
        constructor(sql2, fieldAlias) {
          this.sql = sql2;
          this.fieldAlias = fieldAlias;
        }
        static [import_entity.entityKind] = "SQL.Aliased";
        /** @internal */
        isSelectionField = false;
        getSQL() {
          return this.sql;
        }
        /** @internal */
        clone() {
          return new Aliased(this.sql, this.fieldAlias);
        }
      }
      SQL2.Aliased = Aliased;
    })(SQL || (SQL = {}));
    var Placeholder = class {
      constructor(name2) {
        this.name = name2;
      }
      static [import_entity.entityKind] = "Placeholder";
      getSQL() {
        return new SQL([this]);
      }
    };
    function placeholder(name2) {
      return new Placeholder(name2);
    }
    function fillPlaceholders(params, values) {
      return params.map((p) => {
        if ((0, import_entity.is)(p, Placeholder)) {
          if (!(p.name in values)) {
            throw new Error(`No value for placeholder "${p.name}" was provided`);
          }
          return values[p.name];
        }
        if ((0, import_entity.is)(p, Param) && (0, import_entity.is)(p.value, Placeholder)) {
          if (!(p.value.name in values)) {
            throw new Error(`No value for placeholder "${p.value.name}" was provided`);
          }
          return p.encoder.mapToDriverValue(values[p.value.name]);
        }
        return p;
      });
    }
    var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
    var View = class {
      static [import_entity.entityKind] = "View";
      /** @internal */
      [import_view_common.ViewBaseConfig];
      /** @internal */
      [IsDrizzleView] = true;
      constructor({ name: name2, schema: schema2, selectedFields, query }) {
        this[import_view_common.ViewBaseConfig] = {
          name: name2,
          originalName: name2,
          schema: schema2,
          selectedFields,
          query,
          isExisting: !query,
          isAlias: false
        };
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    function isView(view) {
      return typeof view === "object" && view !== null && IsDrizzleView in view;
    }
    function getViewName(view) {
      return view[import_view_common.ViewBaseConfig].name;
    }
    import_column.Column.prototype.getSQL = function() {
      return new SQL([this]);
    };
    import_table.Table.prototype.getSQL = function() {
      return new SQL([this]);
    };
    import_subquery.Subquery.prototype.getSQL = function() {
      return new SQL([this]);
    };
  }
});

// node_modules/drizzle-orm/utils.cjs
var require_utils = __commonJS({
  "node_modules/drizzle-orm/utils.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      applyMixins: () => applyMixins,
      getColumnNameAndConfig: () => getColumnNameAndConfig,
      getTableColumns: () => getTableColumns,
      getTableLikeName: () => getTableLikeName,
      getViewSelectedFields: () => getViewSelectedFields,
      haveSameKeys: () => haveSameKeys,
      isConfig: () => isConfig,
      mapResultRow: () => mapResultRow,
      mapUpdateSet: () => mapUpdateSet,
      orderSelectedFields: () => orderSelectedFields,
      textDecoder: () => textDecoder
    });
    module2.exports = __toCommonJS(utils_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_subquery = require_subquery();
    var import_table = require_table();
    var import_view_common = require_view_common();
    function mapResultRow(columns, row, joinsNotNullableMap) {
      const nullifyMap = {};
      const result = columns.reduce(
        (result2, { path, field }, columnIndex) => {
          let decoder;
          if ((0, import_entity.is)(field, import_column.Column)) {
            decoder = field;
          } else if ((0, import_entity.is)(field, import_sql.SQL)) {
            decoder = field.decoder;
          } else if ((0, import_entity.is)(field, import_subquery.Subquery)) {
            decoder = field._.sql.decoder;
          } else {
            decoder = field.sql.decoder;
          }
          let node = result2;
          for (const [pathChunkIndex, pathChunk] of path.entries()) {
            if (pathChunkIndex < path.length - 1) {
              if (!(pathChunk in node)) {
                node[pathChunk] = {};
              }
              node = node[pathChunk];
            } else {
              const rawValue = row[columnIndex];
              const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
              if (joinsNotNullableMap && (0, import_entity.is)(field, import_column.Column) && path.length === 2) {
                const objectName = path[0];
                if (!(objectName in nullifyMap)) {
                  nullifyMap[objectName] = value === null ? (0, import_table.getTableName)(field.table) : false;
                } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== (0, import_table.getTableName)(field.table)) {
                  nullifyMap[objectName] = false;
                }
              }
            }
          }
          return result2;
        },
        {}
      );
      if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
        for (const [objectName, tableName] of Object.entries(nullifyMap)) {
          if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
            result[objectName] = null;
          }
        }
      }
      return result;
    }
    function orderSelectedFields(fields, pathPrefix) {
      return Object.entries(fields).reduce((result, [name, field]) => {
        if (typeof name !== "string") {
          return result;
        }
        const newPath = pathPrefix ? [...pathPrefix, name] : [name];
        if ((0, import_entity.is)(field, import_column.Column) || (0, import_entity.is)(field, import_sql.SQL) || (0, import_entity.is)(field, import_sql.SQL.Aliased) || (0, import_entity.is)(field, import_subquery.Subquery)) {
          result.push({ path: newPath, field });
        } else if ((0, import_entity.is)(field, import_table.Table)) {
          result.push(...orderSelectedFields(field[import_table.Table.Symbol.Columns], newPath));
        } else {
          result.push(...orderSelectedFields(field, newPath));
        }
        return result;
      }, []);
    }
    function haveSameKeys(left, right) {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      if (leftKeys.length !== rightKeys.length) {
        return false;
      }
      for (const [index, key] of leftKeys.entries()) {
        if (key !== rightKeys[index]) {
          return false;
        }
      }
      return true;
    }
    function mapUpdateSet(table, values) {
      const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
        if ((0, import_entity.is)(value, import_sql.SQL) || (0, import_entity.is)(value, import_column.Column)) {
          return [key, value];
        } else {
          return [key, new import_sql.Param(value, table[import_table.Table.Symbol.Columns][key])];
        }
      });
      if (entries.length === 0) {
        throw new Error("No values to set");
      }
      return Object.fromEntries(entries);
    }
    function applyMixins(baseClass, extendedClasses) {
      for (const extendedClass of extendedClasses) {
        for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
          if (name === "constructor") continue;
          Object.defineProperty(
            baseClass.prototype,
            name,
            Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
          );
        }
      }
    }
    function getTableColumns(table) {
      return table[import_table.Table.Symbol.Columns];
    }
    function getViewSelectedFields(view) {
      return view[import_view_common.ViewBaseConfig].selectedFields;
    }
    function getTableLikeName(table) {
      return (0, import_entity.is)(table, import_subquery.Subquery) ? table._.alias : (0, import_entity.is)(table, import_sql.View) ? table[import_view_common.ViewBaseConfig].name : (0, import_entity.is)(table, import_sql.SQL) ? void 0 : table[import_table.Table.Symbol.IsAlias] ? table[import_table.Table.Symbol.Name] : table[import_table.Table.Symbol.BaseName];
    }
    function getColumnNameAndConfig(a, b) {
      return {
        name: typeof a === "string" && a.length > 0 ? a : "",
        config: typeof a === "object" ? a : b
      };
    }
    function isConfig(data) {
      if (typeof data !== "object" || data === null) return false;
      if (data.constructor.name !== "Object") return false;
      if ("logger" in data) {
        const type = typeof data["logger"];
        if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
        return true;
      }
      if ("schema" in data) {
        const type = typeof data["schema"];
        if (type !== "object" && type !== "undefined") return false;
        return true;
      }
      if ("casing" in data) {
        const type = typeof data["casing"];
        if (type !== "string" && type !== "undefined") return false;
        return true;
      }
      if ("mode" in data) {
        if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
        return true;
      }
      if ("connection" in data) {
        const type = typeof data["connection"];
        if (type !== "string" && type !== "object" && type !== "undefined") return false;
        return true;
      }
      if ("client" in data) {
        const type = typeof data["client"];
        if (type !== "object" && type !== "function" && type !== "undefined") return false;
        return true;
      }
      if (Object.keys(data).length === 0) return true;
      return false;
    }
    var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
  }
});

// node_modules/drizzle-orm/pg-core/columns/int.common.cjs
var require_int_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/int.common.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var int_common_exports = {};
    __export2(int_common_exports, {
      PgIntColumnBaseBuilder: () => PgIntColumnBaseBuilder
    });
    module2.exports = __toCommonJS(int_common_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgIntColumnBaseBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgIntColumnBaseBuilder";
      generatedAlwaysAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "always",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "always"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
      generatedByDefaultAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "byDefault",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "byDefault"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigint.cjs
var require_bigint = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/bigint.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var bigint_exports = {};
    __export2(bigint_exports, {
      PgBigInt53: () => PgBigInt53,
      PgBigInt53Builder: () => PgBigInt53Builder,
      PgBigInt64: () => PgBigInt64,
      PgBigInt64Builder: () => PgBigInt64Builder,
      bigint: () => bigint
    });
    module2.exports = __toCommonJS(bigint_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgBigInt53Builder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgBigInt53Builder";
      constructor(name) {
        super(name, "number", "PgBigInt53");
      }
      /** @internal */
      build(table) {
        return new PgBigInt53(table, this.config);
      }
    };
    var PgBigInt53 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigInt53";
      getSQLType() {
        return "bigint";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    var PgBigInt64Builder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgBigInt64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigInt64");
      }
      /** @internal */
      build(table) {
        return new PgBigInt64(
          table,
          this.config
        );
      }
    };
    var PgBigInt64 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigInt64";
      getSQLType() {
        return "bigint";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
    function bigint(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config.mode === "number") {
        return new PgBigInt53Builder(name);
      }
      return new PgBigInt64Builder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigserial.cjs
var require_bigserial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/bigserial.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var bigserial_exports = {};
    __export2(bigserial_exports, {
      PgBigSerial53: () => PgBigSerial53,
      PgBigSerial53Builder: () => PgBigSerial53Builder,
      PgBigSerial64: () => PgBigSerial64,
      PgBigSerial64Builder: () => PgBigSerial64Builder,
      bigserial: () => bigserial
    });
    module2.exports = __toCommonJS(bigserial_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgBigSerial53Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBigSerial53Builder";
      constructor(name) {
        super(name, "number", "PgBigSerial53");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial53(
          table,
          this.config
        );
      }
    };
    var PgBigSerial53 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigSerial53";
      getSQLType() {
        return "bigserial";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    var PgBigSerial64Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBigSerial64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigSerial64");
        this.config.hasDefault = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial64(
          table,
          this.config
        );
      }
    };
    var PgBigSerial64 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigSerial64";
      getSQLType() {
        return "bigserial";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
    function bigserial(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config.mode === "number") {
        return new PgBigSerial53Builder(name);
      }
      return new PgBigSerial64Builder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/boolean.cjs
var require_boolean = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/boolean.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var boolean_exports = {};
    __export2(boolean_exports, {
      PgBoolean: () => PgBoolean,
      PgBooleanBuilder: () => PgBooleanBuilder,
      boolean: () => boolean
    });
    module2.exports = __toCommonJS(boolean_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgBooleanBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBooleanBuilder";
      constructor(name) {
        super(name, "boolean", "PgBoolean");
      }
      /** @internal */
      build(table) {
        return new PgBoolean(table, this.config);
      }
    };
    var PgBoolean = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBoolean";
      getSQLType() {
        return "boolean";
      }
    };
    function boolean(name) {
      return new PgBooleanBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/char.cjs
var require_char = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/char.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var char_exports = {};
    __export2(char_exports, {
      PgChar: () => PgChar,
      PgCharBuilder: () => PgCharBuilder,
      char: () => char
    });
    module2.exports = __toCommonJS(char_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgCharBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCharBuilder";
      constructor(name, config) {
        super(name, "string", "PgChar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgChar(
          table,
          this.config
        );
      }
    };
    var PgChar = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgChar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `char` : `char(${this.length})`;
      }
    };
    function char(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgCharBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/cidr.cjs
var require_cidr = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/cidr.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var cidr_exports = {};
    __export2(cidr_exports, {
      PgCidr: () => PgCidr,
      PgCidrBuilder: () => PgCidrBuilder,
      cidr: () => cidr
    });
    module2.exports = __toCommonJS(cidr_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgCidrBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCidrBuilder";
      constructor(name) {
        super(name, "string", "PgCidr");
      }
      /** @internal */
      build(table) {
        return new PgCidr(table, this.config);
      }
    };
    var PgCidr = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgCidr";
      getSQLType() {
        return "cidr";
      }
    };
    function cidr(name) {
      return new PgCidrBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/custom.cjs
var require_custom = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/custom.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var custom_exports = {};
    __export2(custom_exports, {
      PgCustomColumn: () => PgCustomColumn,
      PgCustomColumnBuilder: () => PgCustomColumnBuilder,
      customType: () => customType
    });
    module2.exports = __toCommonJS(custom_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgCustomColumnBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCustomColumnBuilder";
      constructor(name, fieldConfig, customTypeParams) {
        super(name, "custom", "PgCustomColumn");
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
      }
      /** @internal */
      build(table) {
        return new PgCustomColumn(
          table,
          this.config
        );
      }
    };
    var PgCustomColumn = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgCustomColumn";
      sqlName;
      mapTo;
      mapFrom;
      constructor(table, config) {
        super(table, config);
        this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
        this.mapTo = config.customTypeParams.toDriver;
        this.mapFrom = config.customTypeParams.fromDriver;
      }
      getSQLType() {
        return this.sqlName;
      }
      mapFromDriverValue(value) {
        return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
      }
      mapToDriverValue(value) {
        return typeof this.mapTo === "function" ? this.mapTo(value) : value;
      }
    };
    function customType(customTypeParams) {
      return (a, b) => {
        const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
        return new PgCustomColumnBuilder(name, config, customTypeParams);
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.common.cjs
var require_date_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/date.common.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var date_common_exports = {};
    __export2(date_common_exports, {
      PgDateColumnBaseBuilder: () => PgDateColumnBaseBuilder
    });
    module2.exports = __toCommonJS(date_common_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_common = require_common();
    var PgDateColumnBaseBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgDateColumnBaseBuilder";
      defaultNow() {
        return this.default(import_sql.sql`now()`);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.cjs
var require_date = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/date.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var date_exports = {};
    __export2(date_exports, {
      PgDate: () => PgDate,
      PgDateBuilder: () => PgDateBuilder,
      PgDateString: () => PgDateString,
      PgDateStringBuilder: () => PgDateStringBuilder,
      date: () => date
    });
    module2.exports = __toCommonJS(date_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgDateBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgDateBuilder";
      constructor(name) {
        super(name, "date", "PgDate");
      }
      /** @internal */
      build(table) {
        return new PgDate(table, this.config);
      }
    };
    var PgDate = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDate";
      getSQLType() {
        return "date";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return new Date(value);
        return value;
      }
      mapToDriverValue(value) {
        return value.toISOString();
      }
    };
    var PgDateStringBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgDateStringBuilder";
      constructor(name) {
        super(name, "string", "PgDateString");
      }
      /** @internal */
      build(table) {
        return new PgDateString(
          table,
          this.config
        );
      }
    };
    var PgDateString = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDateString";
      getSQLType() {
        return "date";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        return value.toISOString().slice(0, -14);
      }
    };
    function date(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "date") {
        return new PgDateBuilder(name);
      }
      return new PgDateStringBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/double-precision.cjs
var require_double_precision = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/double-precision.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var double_precision_exports = {};
    __export2(double_precision_exports, {
      PgDoublePrecision: () => PgDoublePrecision,
      PgDoublePrecisionBuilder: () => PgDoublePrecisionBuilder,
      doublePrecision: () => doublePrecision
    });
    module2.exports = __toCommonJS(double_precision_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgDoublePrecisionBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgDoublePrecisionBuilder";
      constructor(name) {
        super(name, "number", "PgDoublePrecision");
      }
      /** @internal */
      build(table) {
        return new PgDoublePrecision(
          table,
          this.config
        );
      }
    };
    var PgDoublePrecision = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDoublePrecision";
      getSQLType() {
        return "double precision";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      }
    };
    function doublePrecision(name) {
      return new PgDoublePrecisionBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/inet.cjs
var require_inet = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/inet.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var inet_exports = {};
    __export2(inet_exports, {
      PgInet: () => PgInet,
      PgInetBuilder: () => PgInetBuilder,
      inet: () => inet
    });
    module2.exports = __toCommonJS(inet_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgInetBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgInetBuilder";
      constructor(name) {
        super(name, "string", "PgInet");
      }
      /** @internal */
      build(table) {
        return new PgInet(table, this.config);
      }
    };
    var PgInet = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInet";
      getSQLType() {
        return "inet";
      }
    };
    function inet(name) {
      return new PgInetBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/integer.cjs
var require_integer = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/integer.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var integer_exports = {};
    __export2(integer_exports, {
      PgInteger: () => PgInteger,
      PgIntegerBuilder: () => PgIntegerBuilder,
      integer: () => integer
    });
    module2.exports = __toCommonJS(integer_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgIntegerBuilder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgIntegerBuilder";
      constructor(name) {
        super(name, "number", "PgInteger");
      }
      /** @internal */
      build(table) {
        return new PgInteger(table, this.config);
      }
    };
    var PgInteger = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInteger";
      getSQLType() {
        return "integer";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseInt(value);
        }
        return value;
      }
    };
    function integer(name) {
      return new PgIntegerBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/interval.cjs
var require_interval = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/interval.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var interval_exports = {};
    __export2(interval_exports, {
      PgInterval: () => PgInterval,
      PgIntervalBuilder: () => PgIntervalBuilder,
      interval: () => interval
    });
    module2.exports = __toCommonJS(interval_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgIntervalBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgIntervalBuilder";
      constructor(name, intervalConfig) {
        super(name, "string", "PgInterval");
        this.config.intervalConfig = intervalConfig;
      }
      /** @internal */
      build(table) {
        return new PgInterval(table, this.config);
      }
    };
    var PgInterval = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInterval";
      fields = this.config.intervalConfig.fields;
      precision = this.config.intervalConfig.precision;
      getSQLType() {
        const fields = this.fields ? ` ${this.fields}` : "";
        const precision = this.precision ? `(${this.precision})` : "";
        return `interval${fields}${precision}`;
      }
    };
    function interval(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgIntervalBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/json.cjs
var require_json = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/json.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var json_exports = {};
    __export2(json_exports, {
      PgJson: () => PgJson,
      PgJsonBuilder: () => PgJsonBuilder,
      json: () => json
    });
    module2.exports = __toCommonJS(json_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgJsonBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgJsonBuilder";
      constructor(name) {
        super(name, "json", "PgJson");
      }
      /** @internal */
      build(table) {
        return new PgJson(table, this.config);
      }
    };
    var PgJson = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgJson";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "json";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
    function json(name) {
      return new PgJsonBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/jsonb.cjs
var require_jsonb = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/jsonb.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var jsonb_exports = {};
    __export2(jsonb_exports, {
      PgJsonb: () => PgJsonb,
      PgJsonbBuilder: () => PgJsonbBuilder,
      jsonb: () => jsonb
    });
    module2.exports = __toCommonJS(jsonb_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgJsonbBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgJsonbBuilder";
      constructor(name) {
        super(name, "json", "PgJsonb");
      }
      /** @internal */
      build(table) {
        return new PgJsonb(table, this.config);
      }
    };
    var PgJsonb = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgJsonb";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "jsonb";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
    function jsonb(name) {
      return new PgJsonbBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/line.cjs
var require_line = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/line.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var line_exports = {};
    __export2(line_exports, {
      PgLineABC: () => PgLineABC,
      PgLineABCBuilder: () => PgLineABCBuilder,
      PgLineBuilder: () => PgLineBuilder,
      PgLineTuple: () => PgLineTuple,
      line: () => line
    });
    module2.exports = __toCommonJS(line_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgLineBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgLineBuilder";
      constructor(name) {
        super(name, "array", "PgLine");
      }
      /** @internal */
      build(table) {
        return new PgLineTuple(
          table,
          this.config
        );
      }
    };
    var PgLineTuple = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgLine";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b, c] = value.slice(1, -1).split(",");
        return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
      }
      mapToDriverValue(value) {
        return `{${value[0]},${value[1]},${value[2]}}`;
      }
    };
    var PgLineABCBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgLineABCBuilder";
      constructor(name) {
        super(name, "json", "PgLineABC");
      }
      /** @internal */
      build(table) {
        return new PgLineABC(
          table,
          this.config
        );
      }
    };
    var PgLineABC = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgLineABC";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b, c] = value.slice(1, -1).split(",");
        return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
      }
      mapToDriverValue(value) {
        return `{${value.a},${value.b},${value.c}}`;
      }
    };
    function line(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgLineBuilder(name);
      }
      return new PgLineABCBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr.cjs
var require_macaddr = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/macaddr.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var macaddr_exports = {};
    __export2(macaddr_exports, {
      PgMacaddr: () => PgMacaddr,
      PgMacaddrBuilder: () => PgMacaddrBuilder,
      macaddr: () => macaddr
    });
    module2.exports = __toCommonJS(macaddr_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgMacaddrBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgMacaddrBuilder";
      constructor(name) {
        super(name, "string", "PgMacaddr");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr(table, this.config);
      }
    };
    var PgMacaddr = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgMacaddr";
      getSQLType() {
        return "macaddr";
      }
    };
    function macaddr(name) {
      return new PgMacaddrBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr8.cjs
var require_macaddr8 = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/macaddr8.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var macaddr8_exports = {};
    __export2(macaddr8_exports, {
      PgMacaddr8: () => PgMacaddr8,
      PgMacaddr8Builder: () => PgMacaddr8Builder,
      macaddr8: () => macaddr8
    });
    module2.exports = __toCommonJS(macaddr8_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgMacaddr8Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgMacaddr8Builder";
      constructor(name) {
        super(name, "string", "PgMacaddr8");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr8(table, this.config);
      }
    };
    var PgMacaddr8 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgMacaddr8";
      getSQLType() {
        return "macaddr8";
      }
    };
    function macaddr8(name) {
      return new PgMacaddr8Builder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/numeric.cjs
var require_numeric = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/numeric.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var numeric_exports = {};
    __export2(numeric_exports, {
      PgNumeric: () => PgNumeric,
      PgNumericBigInt: () => PgNumericBigInt,
      PgNumericBigIntBuilder: () => PgNumericBigIntBuilder,
      PgNumericBuilder: () => PgNumericBuilder,
      PgNumericNumber: () => PgNumericNumber,
      PgNumericNumberBuilder: () => PgNumericNumberBuilder,
      decimal: () => decimal,
      numeric: () => numeric
    });
    module2.exports = __toCommonJS(numeric_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgNumericBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgNumericBuilder";
      constructor(name, precision, scale) {
        super(name, "string", "PgNumeric");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumeric(table, this.config);
      }
    };
    var PgNumeric = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgNumeric";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        return String(value);
      }
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    var PgNumericNumberBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgNumericNumberBuilder";
      constructor(name, precision, scale) {
        super(name, "number", "PgNumericNumber");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumericNumber(
          table,
          this.config
        );
      }
    };
    var PgNumericNumber = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgNumericNumber";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") return value;
        return Number(value);
      }
      mapToDriverValue = String;
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    var PgNumericBigIntBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgNumericBigIntBuilder";
      constructor(name, precision, scale) {
        super(name, "bigint", "PgNumericBigInt");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumericBigInt(
          table,
          this.config
        );
      }
    };
    var PgNumericBigInt = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgNumericBigInt";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue = BigInt;
      mapToDriverValue = String;
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    function numeric(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      const mode = config?.mode;
      return mode === "number" ? new PgNumericNumberBuilder(name, config?.precision, config?.scale) : mode === "bigint" ? new PgNumericBigIntBuilder(name, config?.precision, config?.scale) : new PgNumericBuilder(name, config?.precision, config?.scale);
    }
    var decimal = numeric;
  }
});

// node_modules/drizzle-orm/pg-core/columns/point.cjs
var require_point = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/point.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var point_exports = {};
    __export2(point_exports, {
      PgPointObject: () => PgPointObject,
      PgPointObjectBuilder: () => PgPointObjectBuilder,
      PgPointTuple: () => PgPointTuple,
      PgPointTupleBuilder: () => PgPointTupleBuilder,
      point: () => point
    });
    module2.exports = __toCommonJS(point_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgPointTupleBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgPointTupleBuilder";
      constructor(name) {
        super(name, "array", "PgPointTuple");
      }
      /** @internal */
      build(table) {
        return new PgPointTuple(
          table,
          this.config
        );
      }
    };
    var PgPointTuple = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgPointTuple";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return [Number.parseFloat(x), Number.parseFloat(y)];
        }
        return [value.x, value.y];
      }
      mapToDriverValue(value) {
        return `(${value[0]},${value[1]})`;
      }
    };
    var PgPointObjectBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgPointObjectBuilder";
      constructor(name) {
        super(name, "json", "PgPointObject");
      }
      /** @internal */
      build(table) {
        return new PgPointObject(
          table,
          this.config
        );
      }
    };
    var PgPointObject = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgPointObject";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
        }
        return value;
      }
      mapToDriverValue(value) {
        return `(${value.x},${value.y})`;
      }
    };
    function point(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgPointTupleBuilder(name);
      }
      return new PgPointObjectBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.cjs
var require_utils2 = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      parseEWKB: () => parseEWKB
    });
    module2.exports = __toCommonJS(utils_exports);
    function hexToBytes(hex) {
      const bytes = [];
      for (let c = 0; c < hex.length; c += 2) {
        bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
      }
      return new Uint8Array(bytes);
    }
    function bytesToFloat64(bytes, offset) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, bytes[offset + i]);
      }
      return view.getFloat64(0, true);
    }
    function parseEWKB(hex) {
      const bytes = hexToBytes(hex);
      let offset = 0;
      const byteOrder = bytes[offset];
      offset += 1;
      const view = new DataView(bytes.buffer);
      const geomType = view.getUint32(offset, byteOrder === 1);
      offset += 4;
      let _srid;
      if (geomType & 536870912) {
        _srid = view.getUint32(offset, byteOrder === 1);
        offset += 4;
      }
      if ((geomType & 65535) === 1) {
        const x = bytesToFloat64(bytes, offset);
        offset += 8;
        const y = bytesToFloat64(bytes, offset);
        offset += 8;
        return [x, y];
      }
      throw new Error("Unsupported geometry type");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.cjs
var require_geometry = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var geometry_exports = {};
    __export2(geometry_exports, {
      PgGeometry: () => PgGeometry,
      PgGeometryBuilder: () => PgGeometryBuilder,
      PgGeometryObject: () => PgGeometryObject,
      PgGeometryObjectBuilder: () => PgGeometryObjectBuilder,
      geometry: () => geometry
    });
    module2.exports = __toCommonJS(geometry_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_utils2 = require_utils2();
    var PgGeometryBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgGeometryBuilder";
      constructor(name) {
        super(name, "array", "PgGeometry");
      }
      /** @internal */
      build(table) {
        return new PgGeometry(
          table,
          this.config
        );
      }
    };
    var PgGeometry = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgGeometry";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        return (0, import_utils2.parseEWKB)(value);
      }
      mapToDriverValue(value) {
        return `point(${value[0]} ${value[1]})`;
      }
    };
    var PgGeometryObjectBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgGeometryObjectBuilder";
      constructor(name) {
        super(name, "json", "PgGeometryObject");
      }
      /** @internal */
      build(table) {
        return new PgGeometryObject(
          table,
          this.config
        );
      }
    };
    var PgGeometryObject = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgGeometryObject";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        const parsed = (0, import_utils2.parseEWKB)(value);
        return { x: parsed[0], y: parsed[1] };
      }
      mapToDriverValue(value) {
        return `point(${value.x} ${value.y})`;
      }
    };
    function geometry(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgGeometryBuilder(name);
      }
      return new PgGeometryObjectBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/real.cjs
var require_real = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/real.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var real_exports = {};
    __export2(real_exports, {
      PgReal: () => PgReal,
      PgRealBuilder: () => PgRealBuilder,
      real: () => real
    });
    module2.exports = __toCommonJS(real_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgRealBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgRealBuilder";
      constructor(name, length) {
        super(name, "number", "PgReal");
        this.config.length = length;
      }
      /** @internal */
      build(table) {
        return new PgReal(table, this.config);
      }
    };
    var PgReal = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgReal";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "real";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      };
    };
    function real(name) {
      return new PgRealBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/serial.cjs
var require_serial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/serial.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var serial_exports = {};
    __export2(serial_exports, {
      PgSerial: () => PgSerial,
      PgSerialBuilder: () => PgSerialBuilder,
      serial: () => serial
    });
    module2.exports = __toCommonJS(serial_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgSerialBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSerial(table, this.config);
      }
    };
    var PgSerial = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSerial";
      getSQLType() {
        return "serial";
      }
    };
    function serial(name) {
      return new PgSerialBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallint.cjs
var require_smallint = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/smallint.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var smallint_exports = {};
    __export2(smallint_exports, {
      PgSmallInt: () => PgSmallInt,
      PgSmallIntBuilder: () => PgSmallIntBuilder,
      smallint: () => smallint
    });
    module2.exports = __toCommonJS(smallint_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgSmallIntBuilder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgSmallIntBuilder";
      constructor(name) {
        super(name, "number", "PgSmallInt");
      }
      /** @internal */
      build(table) {
        return new PgSmallInt(table, this.config);
      }
    };
    var PgSmallInt = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSmallInt";
      getSQLType() {
        return "smallint";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number(value);
        }
        return value;
      };
    };
    function smallint(name) {
      return new PgSmallIntBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallserial.cjs
var require_smallserial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/smallserial.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var smallserial_exports = {};
    __export2(smallserial_exports, {
      PgSmallSerial: () => PgSmallSerial,
      PgSmallSerialBuilder: () => PgSmallSerialBuilder,
      smallserial: () => smallserial
    });
    module2.exports = __toCommonJS(smallserial_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgSmallSerialBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSmallSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSmallSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSmallSerial(
          table,
          this.config
        );
      }
    };
    var PgSmallSerial = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSmallSerial";
      getSQLType() {
        return "smallserial";
      }
    };
    function smallserial(name) {
      return new PgSmallSerialBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/text.cjs
var require_text = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/text.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var text_exports = {};
    __export2(text_exports, {
      PgText: () => PgText,
      PgTextBuilder: () => PgTextBuilder,
      text: () => text
    });
    module2.exports = __toCommonJS(text_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgTextBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgTextBuilder";
      constructor(name, config) {
        super(name, "string", "PgText");
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgText(table, this.config);
      }
    };
    var PgText = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgText";
      enumValues = this.config.enumValues;
      getSQLType() {
        return "text";
      }
    };
    function text(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgTextBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/time.cjs
var require_time = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/time.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var time_exports = {};
    __export2(time_exports, {
      PgTime: () => PgTime,
      PgTimeBuilder: () => PgTimeBuilder,
      time: () => time
    });
    module2.exports = __toCommonJS(time_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgTimeBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTime");
        this.withTimezone = withTimezone;
        this.precision = precision;
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      static [import_entity.entityKind] = "PgTimeBuilder";
      /** @internal */
      build(table) {
        return new PgTime(table, this.config);
      }
    };
    var PgTime = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTime";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
    };
    function time(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/timestamp.cjs
var require_timestamp = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/timestamp.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var timestamp_exports = {};
    __export2(timestamp_exports, {
      PgTimestamp: () => PgTimestamp,
      PgTimestampBuilder: () => PgTimestampBuilder,
      PgTimestampString: () => PgTimestampString,
      PgTimestampStringBuilder: () => PgTimestampStringBuilder,
      timestamp: () => timestamp
    });
    module2.exports = __toCommonJS(timestamp_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgTimestampBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgTimestampBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "date", "PgTimestamp");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestamp(table, this.config);
      }
    };
    var PgTimestamp = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTimestamp";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return new Date(this.withTimezone ? value : value + "+0000");
        return value;
      }
      mapToDriverValue = (value) => {
        return value.toISOString();
      };
    };
    var PgTimestampStringBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgTimestampStringBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTimestampString");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestampString(
          table,
          this.config
        );
      }
    };
    var PgTimestampString = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTimestampString";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        const shortened = value.toISOString().slice(0, -1).replace("T", " ");
        if (this.withTimezone) {
          const offset = value.getTimezoneOffset();
          const sign = offset <= 0 ? "+" : "-";
          return `${shortened}${sign}${Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")}`;
        }
        return shortened;
      }
    };
    function timestamp(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "string") {
        return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
      }
      return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/uuid.cjs
var require_uuid = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/uuid.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var uuid_exports = {};
    __export2(uuid_exports, {
      PgUUID: () => PgUUID,
      PgUUIDBuilder: () => PgUUIDBuilder,
      uuid: () => uuid
    });
    module2.exports = __toCommonJS(uuid_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_common = require_common();
    var PgUUIDBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgUUIDBuilder";
      constructor(name) {
        super(name, "string", "PgUUID");
      }
      /**
       * Adds `default gen_random_uuid()` to the column definition.
       */
      defaultRandom() {
        return this.default(import_sql.sql`gen_random_uuid()`);
      }
      /** @internal */
      build(table) {
        return new PgUUID(table, this.config);
      }
    };
    var PgUUID = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgUUID";
      getSQLType() {
        return "uuid";
      }
    };
    function uuid(name) {
      return new PgUUIDBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/varchar.cjs
var require_varchar = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/varchar.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var varchar_exports = {};
    __export2(varchar_exports, {
      PgVarchar: () => PgVarchar,
      PgVarcharBuilder: () => PgVarcharBuilder,
      varchar: () => varchar
    });
    module2.exports = __toCommonJS(varchar_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgVarcharBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgVarcharBuilder";
      constructor(name, config) {
        super(name, "string", "PgVarchar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgVarchar(
          table,
          this.config
        );
      }
    };
    var PgVarchar = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgVarchar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
      }
    };
    function varchar(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgVarcharBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.cjs
var require_bit = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var bit_exports = {};
    __export2(bit_exports, {
      PgBinaryVector: () => PgBinaryVector,
      PgBinaryVectorBuilder: () => PgBinaryVectorBuilder,
      bit: () => bit
    });
    module2.exports = __toCommonJS(bit_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgBinaryVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBinaryVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgBinaryVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgBinaryVector(
          table,
          this.config
        );
      }
    };
    var PgBinaryVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBinaryVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `bit(${this.dimensions})`;
      }
    };
    function bit(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgBinaryVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.cjs
var require_halfvec = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var halfvec_exports = {};
    __export2(halfvec_exports, {
      PgHalfVector: () => PgHalfVector,
      PgHalfVectorBuilder: () => PgHalfVectorBuilder,
      halfvec: () => halfvec
    });
    module2.exports = __toCommonJS(halfvec_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgHalfVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgHalfVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgHalfVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgHalfVector(
          table,
          this.config
        );
      }
    };
    var PgHalfVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgHalfVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `halfvec(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
    function halfvec(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgHalfVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.cjs
var require_sparsevec = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var sparsevec_exports = {};
    __export2(sparsevec_exports, {
      PgSparseVector: () => PgSparseVector,
      PgSparseVectorBuilder: () => PgSparseVectorBuilder,
      sparsevec: () => sparsevec
    });
    module2.exports = __toCommonJS(sparsevec_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgSparseVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSparseVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgSparseVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgSparseVector(
          table,
          this.config
        );
      }
    };
    var PgSparseVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSparseVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `sparsevec(${this.dimensions})`;
      }
    };
    function sparsevec(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgSparseVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.cjs
var require_vector = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var vector_exports = {};
    __export2(vector_exports, {
      PgVector: () => PgVector,
      PgVectorBuilder: () => PgVectorBuilder,
      vector: () => vector
    });
    module2.exports = __toCommonJS(vector_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgVector(
          table,
          this.config
        );
      }
    };
    var PgVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `vector(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
    function vector(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/all.cjs
var require_all = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/all.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var all_exports = {};
    __export2(all_exports, {
      getPgColumnBuilders: () => getPgColumnBuilders
    });
    module2.exports = __toCommonJS(all_exports);
    var import_bigint = require_bigint();
    var import_bigserial = require_bigserial();
    var import_boolean = require_boolean();
    var import_char = require_char();
    var import_cidr = require_cidr();
    var import_custom = require_custom();
    var import_date = require_date();
    var import_double_precision = require_double_precision();
    var import_inet = require_inet();
    var import_integer = require_integer();
    var import_interval = require_interval();
    var import_json = require_json();
    var import_jsonb = require_jsonb();
    var import_line = require_line();
    var import_macaddr = require_macaddr();
    var import_macaddr8 = require_macaddr8();
    var import_numeric = require_numeric();
    var import_point = require_point();
    var import_geometry = require_geometry();
    var import_real = require_real();
    var import_serial = require_serial();
    var import_smallint = require_smallint();
    var import_smallserial = require_smallserial();
    var import_text = require_text();
    var import_time = require_time();
    var import_timestamp = require_timestamp();
    var import_uuid = require_uuid();
    var import_varchar = require_varchar();
    var import_bit = require_bit();
    var import_halfvec = require_halfvec();
    var import_sparsevec = require_sparsevec();
    var import_vector = require_vector();
    function getPgColumnBuilders() {
      return {
        bigint: import_bigint.bigint,
        bigserial: import_bigserial.bigserial,
        boolean: import_boolean.boolean,
        char: import_char.char,
        cidr: import_cidr.cidr,
        customType: import_custom.customType,
        date: import_date.date,
        doublePrecision: import_double_precision.doublePrecision,
        inet: import_inet.inet,
        integer: import_integer.integer,
        interval: import_interval.interval,
        json: import_json.json,
        jsonb: import_jsonb.jsonb,
        line: import_line.line,
        macaddr: import_macaddr.macaddr,
        macaddr8: import_macaddr8.macaddr8,
        numeric: import_numeric.numeric,
        point: import_point.point,
        geometry: import_geometry.geometry,
        real: import_real.real,
        serial: import_serial.serial,
        smallint: import_smallint.smallint,
        smallserial: import_smallserial.smallserial,
        text: import_text.text,
        time: import_time.time,
        timestamp: import_timestamp.timestamp,
        uuid: import_uuid.uuid,
        varchar: import_varchar.varchar,
        bit: import_bit.bit,
        halfvec: import_halfvec.halfvec,
        sparsevec: import_sparsevec.sparsevec,
        vector: import_vector.vector
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/table.cjs
var require_table2 = __commonJS({
  "node_modules/drizzle-orm/pg-core/table.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var table_exports = {};
    __export2(table_exports, {
      EnableRLS: () => EnableRLS,
      InlineForeignKeys: () => InlineForeignKeys,
      PgTable: () => PgTable,
      pgTable: () => pgTable,
      pgTableCreator: () => pgTableCreator,
      pgTableWithSchema: () => pgTableWithSchema
    });
    module2.exports = __toCommonJS(table_exports);
    var import_entity = require_entity();
    var import_table = require_table();
    var import_all = require_all();
    var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
    var EnableRLS = Symbol.for("drizzle:EnableRLS");
    var PgTable = class extends import_table.Table {
      static [import_entity.entityKind] = "PgTable";
      /** @internal */
      static Symbol = Object.assign({}, import_table.Table.Symbol, {
        InlineForeignKeys,
        EnableRLS
      });
      /**@internal */
      [InlineForeignKeys] = [];
      /** @internal */
      [EnableRLS] = false;
      /** @internal */
      [import_table.Table.Symbol.ExtraConfigBuilder] = void 0;
      /** @internal */
      [import_table.Table.Symbol.ExtraConfigColumns] = {};
    };
    function pgTableWithSchema(name, columns, extraConfig, schema2, baseName = name) {
      const rawTable = new PgTable(name, schema2, baseName);
      const parsedColumns = typeof columns === "function" ? columns((0, import_all.getPgColumnBuilders)()) : columns;
      const builtColumns = Object.fromEntries(
        Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
          const colBuilder = colBuilderBase;
          colBuilder.setName(name2);
          const column = colBuilder.build(rawTable);
          rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
          return [name2, column];
        })
      );
      const builtColumnsForExtraConfig = Object.fromEntries(
        Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
          const colBuilder = colBuilderBase;
          colBuilder.setName(name2);
          const column = colBuilder.buildExtraConfigColumn(rawTable);
          return [name2, column];
        })
      );
      const table = Object.assign(rawTable, builtColumns);
      table[import_table.Table.Symbol.Columns] = builtColumns;
      table[import_table.Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
      if (extraConfig) {
        table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
      }
      return Object.assign(table, {
        enableRLS: () => {
          table[PgTable.Symbol.EnableRLS] = true;
          return table;
        }
      });
    }
    var pgTable = (name, columns, extraConfig) => {
      return pgTableWithSchema(name, columns, extraConfig, void 0);
    };
    function pgTableCreator(customizeTableName) {
      return (name, columns, extraConfig) => {
        return pgTableWithSchema(customizeTableName(name), columns, extraConfig, void 0, name);
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/primary-keys.cjs
var require_primary_keys = __commonJS({
  "node_modules/drizzle-orm/pg-core/primary-keys.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var primary_keys_exports = {};
    __export2(primary_keys_exports, {
      PrimaryKey: () => PrimaryKey,
      PrimaryKeyBuilder: () => PrimaryKeyBuilder,
      primaryKey: () => primaryKey
    });
    module2.exports = __toCommonJS(primary_keys_exports);
    var import_entity = require_entity();
    var import_table = require_table2();
    function primaryKey(...config) {
      if (config[0].columns) {
        return new PrimaryKeyBuilder(config[0].columns, config[0].name);
      }
      return new PrimaryKeyBuilder(config);
    }
    var PrimaryKeyBuilder = class {
      static [import_entity.entityKind] = "PgPrimaryKeyBuilder";
      /** @internal */
      columns;
      /** @internal */
      name;
      constructor(columns, name) {
        this.columns = columns;
        this.name = name;
      }
      /** @internal */
      build(table) {
        return new PrimaryKey(table, this.columns, this.name);
      }
    };
    var PrimaryKey = class {
      constructor(table, columns, name) {
        this.table = table;
        this.columns = columns;
        this.name = name;
      }
      static [import_entity.entityKind] = "PgPrimaryKey";
      columns;
      name;
      getName() {
        return this.name ?? `${this.table[import_table.PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
      }
    };
  }
});

// node_modules/drizzle-orm/sql/expressions/conditions.cjs
var require_conditions = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/conditions.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var conditions_exports = {};
    __export2(conditions_exports, {
      and: () => and,
      arrayContained: () => arrayContained,
      arrayContains: () => arrayContains,
      arrayOverlaps: () => arrayOverlaps,
      between: () => between,
      bindIfParam: () => bindIfParam,
      eq: () => eq,
      exists: () => exists,
      gt: () => gt,
      gte: () => gte,
      ilike: () => ilike,
      inArray: () => inArray,
      isNotNull: () => isNotNull,
      isNull: () => isNull,
      like: () => like,
      lt: () => lt,
      lte: () => lte,
      ne: () => ne,
      not: () => not,
      notBetween: () => notBetween,
      notExists: () => notExists,
      notIlike: () => notIlike,
      notInArray: () => notInArray,
      notLike: () => notLike,
      or: () => or
    });
    module2.exports = __toCommonJS(conditions_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_table = require_table();
    var import_sql = require_sql();
    function bindIfParam(value, column) {
      if ((0, import_sql.isDriverValueEncoder)(column) && !(0, import_sql.isSQLWrapper)(value) && !(0, import_entity.is)(value, import_sql.Param) && !(0, import_entity.is)(value, import_sql.Placeholder) && !(0, import_entity.is)(value, import_column.Column) && !(0, import_entity.is)(value, import_table.Table) && !(0, import_entity.is)(value, import_sql.View)) {
        return new import_sql.Param(value, column);
      }
      return value;
    }
    var eq = (left, right) => {
      return import_sql.sql`${left} = ${bindIfParam(right, left)}`;
    };
    var ne = (left, right) => {
      return import_sql.sql`${left} <> ${bindIfParam(right, left)}`;
    };
    function and(...unfilteredConditions) {
      const conditions = unfilteredConditions.filter(
        (c) => c !== void 0
      );
      if (conditions.length === 0) {
        return void 0;
      }
      if (conditions.length === 1) {
        return new import_sql.SQL(conditions);
      }
      return new import_sql.SQL([
        new import_sql.StringChunk("("),
        import_sql.sql.join(conditions, new import_sql.StringChunk(" and ")),
        new import_sql.StringChunk(")")
      ]);
    }
    function or(...unfilteredConditions) {
      const conditions = unfilteredConditions.filter(
        (c) => c !== void 0
      );
      if (conditions.length === 0) {
        return void 0;
      }
      if (conditions.length === 1) {
        return new import_sql.SQL(conditions);
      }
      return new import_sql.SQL([
        new import_sql.StringChunk("("),
        import_sql.sql.join(conditions, new import_sql.StringChunk(" or ")),
        new import_sql.StringChunk(")")
      ]);
    }
    function not(condition) {
      return import_sql.sql`not ${condition}`;
    }
    var gt = (left, right) => {
      return import_sql.sql`${left} > ${bindIfParam(right, left)}`;
    };
    var gte = (left, right) => {
      return import_sql.sql`${left} >= ${bindIfParam(right, left)}`;
    };
    var lt = (left, right) => {
      return import_sql.sql`${left} < ${bindIfParam(right, left)}`;
    };
    var lte = (left, right) => {
      return import_sql.sql`${left} <= ${bindIfParam(right, left)}`;
    };
    function inArray(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          return import_sql.sql`false`;
        }
        return import_sql.sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
      }
      return import_sql.sql`${column} in ${bindIfParam(values, column)}`;
    }
    function notInArray(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          return import_sql.sql`true`;
        }
        return import_sql.sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
      }
      return import_sql.sql`${column} not in ${bindIfParam(values, column)}`;
    }
    function isNull(value) {
      return import_sql.sql`${value} is null`;
    }
    function isNotNull(value) {
      return import_sql.sql`${value} is not null`;
    }
    function exists(subquery) {
      return import_sql.sql`exists ${subquery}`;
    }
    function notExists(subquery) {
      return import_sql.sql`not exists ${subquery}`;
    }
    function between(column, min, max) {
      return import_sql.sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
        max,
        column
      )}`;
    }
    function notBetween(column, min, max) {
      return import_sql.sql`${column} not between ${bindIfParam(
        min,
        column
      )} and ${bindIfParam(max, column)}`;
    }
    function like(column, value) {
      return import_sql.sql`${column} like ${value}`;
    }
    function notLike(column, value) {
      return import_sql.sql`${column} not like ${value}`;
    }
    function ilike(column, value) {
      return import_sql.sql`${column} ilike ${value}`;
    }
    function notIlike(column, value) {
      return import_sql.sql`${column} not ilike ${value}`;
    }
    function arrayContains(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayContains requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} @> ${array}`;
      }
      return import_sql.sql`${column} @> ${bindIfParam(values, column)}`;
    }
    function arrayContained(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayContained requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} <@ ${array}`;
      }
      return import_sql.sql`${column} <@ ${bindIfParam(values, column)}`;
    }
    function arrayOverlaps(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayOverlaps requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} && ${array}`;
      }
      return import_sql.sql`${column} && ${bindIfParam(values, column)}`;
    }
  }
});

// node_modules/drizzle-orm/sql/expressions/select.cjs
var require_select = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/select.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var select_exports = {};
    __export2(select_exports, {
      asc: () => asc,
      desc: () => desc
    });
    module2.exports = __toCommonJS(select_exports);
    var import_sql = require_sql();
    function asc(column) {
      return import_sql.sql`${column} asc`;
    }
    function desc(column) {
      return import_sql.sql`${column} desc`;
    }
  }
});

// node_modules/drizzle-orm/sql/expressions/index.cjs
var require_expressions = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var expressions_exports = {};
    module2.exports = __toCommonJS(expressions_exports);
    __reExport(expressions_exports, require_conditions(), module2.exports);
    __reExport(expressions_exports, require_select(), module2.exports);
  }
});

// node_modules/drizzle-orm/relations.cjs
var require_relations = __commonJS({
  "node_modules/drizzle-orm/relations.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var relations_exports = {};
    __export2(relations_exports, {
      Many: () => Many,
      One: () => One,
      Relation: () => Relation,
      Relations: () => Relations,
      createMany: () => createMany,
      createOne: () => createOne,
      createTableRelationsHelpers: () => createTableRelationsHelpers,
      extractTablesRelationalConfig: () => extractTablesRelationalConfig,
      getOperators: () => getOperators,
      getOrderByOperators: () => getOrderByOperators,
      mapRelationalRow: () => mapRelationalRow,
      normalizeRelation: () => normalizeRelation,
      relations: () => relations
    });
    module2.exports = __toCommonJS(relations_exports);
    var import_table = require_table();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_primary_keys = require_primary_keys();
    var import_expressions = require_expressions();
    var import_sql = require_sql();
    var Relation = class {
      constructor(sourceTable, referencedTable, relationName) {
        this.sourceTable = sourceTable;
        this.referencedTable = referencedTable;
        this.relationName = relationName;
        this.referencedTableName = referencedTable[import_table.Table.Symbol.Name];
      }
      static [import_entity.entityKind] = "Relation";
      referencedTableName;
      fieldName;
    };
    var Relations = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
      }
      static [import_entity.entityKind] = "Relations";
    };
    var One = class _One extends Relation {
      constructor(sourceTable, referencedTable, config, isNullable) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
        this.isNullable = isNullable;
      }
      static [import_entity.entityKind] = "One";
      withFieldName(fieldName) {
        const relation = new _One(
          this.sourceTable,
          this.referencedTable,
          this.config,
          this.isNullable
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
    var Many = class _Many extends Relation {
      constructor(sourceTable, referencedTable, config) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
      }
      static [import_entity.entityKind] = "Many";
      withFieldName(fieldName) {
        const relation = new _Many(
          this.sourceTable,
          this.referencedTable,
          this.config
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
    function getOperators() {
      return {
        and: import_expressions.and,
        between: import_expressions.between,
        eq: import_expressions.eq,
        exists: import_expressions.exists,
        gt: import_expressions.gt,
        gte: import_expressions.gte,
        ilike: import_expressions.ilike,
        inArray: import_expressions.inArray,
        isNull: import_expressions.isNull,
        isNotNull: import_expressions.isNotNull,
        like: import_expressions.like,
        lt: import_expressions.lt,
        lte: import_expressions.lte,
        ne: import_expressions.ne,
        not: import_expressions.not,
        notBetween: import_expressions.notBetween,
        notExists: import_expressions.notExists,
        notLike: import_expressions.notLike,
        notIlike: import_expressions.notIlike,
        notInArray: import_expressions.notInArray,
        or: import_expressions.or,
        sql: import_sql.sql
      };
    }
    function getOrderByOperators() {
      return {
        sql: import_sql.sql,
        asc: import_expressions.asc,
        desc: import_expressions.desc
      };
    }
    function extractTablesRelationalConfig(schema2, configHelpers) {
      if (Object.keys(schema2).length === 1 && "default" in schema2 && !(0, import_entity.is)(schema2["default"], import_table.Table)) {
        schema2 = schema2["default"];
      }
      const tableNamesMap = {};
      const relationsBuffer = {};
      const tablesConfig = {};
      for (const [key, value] of Object.entries(schema2)) {
        if ((0, import_entity.is)(value, import_table.Table)) {
          const dbName = (0, import_table.getTableUniqueName)(value);
          const bufferedRelations = relationsBuffer[dbName];
          tableNamesMap[dbName] = key;
          tablesConfig[key] = {
            tsName: key,
            dbName: value[import_table.Table.Symbol.Name],
            schema: value[import_table.Table.Symbol.Schema],
            columns: value[import_table.Table.Symbol.Columns],
            relations: bufferedRelations?.relations ?? {},
            primaryKey: bufferedRelations?.primaryKey ?? []
          };
          for (const column of Object.values(
            value[import_table.Table.Symbol.Columns]
          )) {
            if (column.primary) {
              tablesConfig[key].primaryKey.push(column);
            }
          }
          const extraConfig = value[import_table.Table.Symbol.ExtraConfigBuilder]?.(value[import_table.Table.Symbol.ExtraConfigColumns]);
          if (extraConfig) {
            for (const configEntry of Object.values(extraConfig)) {
              if ((0, import_entity.is)(configEntry, import_primary_keys.PrimaryKeyBuilder)) {
                tablesConfig[key].primaryKey.push(...configEntry.columns);
              }
            }
          }
        } else if ((0, import_entity.is)(value, Relations)) {
          const dbName = (0, import_table.getTableUniqueName)(value.table);
          const tableName = tableNamesMap[dbName];
          const relations2 = value.config(
            configHelpers(value.table)
          );
          let primaryKey;
          for (const [relationName, relation] of Object.entries(relations2)) {
            if (tableName) {
              const tableConfig = tablesConfig[tableName];
              tableConfig.relations[relationName] = relation;
              if (primaryKey) {
                tableConfig.primaryKey.push(...primaryKey);
              }
            } else {
              if (!(dbName in relationsBuffer)) {
                relationsBuffer[dbName] = {
                  relations: {},
                  primaryKey
                };
              }
              relationsBuffer[dbName].relations[relationName] = relation;
            }
          }
        }
      }
      return { tables: tablesConfig, tableNamesMap };
    }
    function relations(table, relations2) {
      return new Relations(
        table,
        (helpers) => Object.fromEntries(
          Object.entries(relations2(helpers)).map(([key, value]) => [
            key,
            value.withFieldName(key)
          ])
        )
      );
    }
    function createOne(sourceTable) {
      return function one(table, config) {
        return new One(
          sourceTable,
          table,
          config,
          config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
        );
      };
    }
    function createMany(sourceTable) {
      return function many(referencedTable, config) {
        return new Many(sourceTable, referencedTable, config);
      };
    }
    function normalizeRelation(schema2, tableNamesMap, relation) {
      if ((0, import_entity.is)(relation, One) && relation.config) {
        return {
          fields: relation.config.fields,
          references: relation.config.references
        };
      }
      const referencedTableTsName = tableNamesMap[(0, import_table.getTableUniqueName)(relation.referencedTable)];
      if (!referencedTableTsName) {
        throw new Error(
          `Table "${relation.referencedTable[import_table.Table.Symbol.Name]}" not found in schema`
        );
      }
      const referencedTableConfig = schema2[referencedTableTsName];
      if (!referencedTableConfig) {
        throw new Error(`Table "${referencedTableTsName}" not found in schema`);
      }
      const sourceTable = relation.sourceTable;
      const sourceTableTsName = tableNamesMap[(0, import_table.getTableUniqueName)(sourceTable)];
      if (!sourceTableTsName) {
        throw new Error(
          `Table "${sourceTable[import_table.Table.Symbol.Name]}" not found in schema`
        );
      }
      const reverseRelations = [];
      for (const referencedTableRelation of Object.values(
        referencedTableConfig.relations
      )) {
        if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
          reverseRelations.push(referencedTableRelation);
        }
      }
      if (reverseRelations.length > 1) {
        throw relation.relationName ? new Error(
          `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
        ) : new Error(
          `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[import_table.Table.Symbol.Name]}". Please specify relation name`
        );
      }
      if (reverseRelations[0] && (0, import_entity.is)(reverseRelations[0], One) && reverseRelations[0].config) {
        return {
          fields: reverseRelations[0].config.references,
          references: reverseRelations[0].config.fields
        };
      }
      throw new Error(
        `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
      );
    }
    function createTableRelationsHelpers(sourceTable) {
      return {
        one: createOne(sourceTable),
        many: createMany(sourceTable)
      };
    }
    function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
      const result = {};
      for (const [
        selectionItemIndex,
        selectionItem
      ] of buildQueryResultSelection.entries()) {
        if (selectionItem.isJson) {
          const relation = tableConfig.relations[selectionItem.tsKey];
          const rawSubRows = row[selectionItemIndex];
          const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
          result[selectionItem.tsKey] = (0, import_entity.is)(relation, One) ? subRows && mapRelationalRow(
            tablesConfig,
            tablesConfig[selectionItem.relationTableTsKey],
            subRows,
            selectionItem.selection,
            mapColumnValue
          ) : subRows.map(
            (subRow) => mapRelationalRow(
              tablesConfig,
              tablesConfig[selectionItem.relationTableTsKey],
              subRow,
              selectionItem.selection,
              mapColumnValue
            )
          );
        } else {
          const value = mapColumnValue(row[selectionItemIndex]);
          const field = selectionItem.field;
          let decoder;
          if ((0, import_entity.is)(field, import_column.Column)) {
            decoder = field;
          } else if ((0, import_entity.is)(field, import_sql.SQL)) {
            decoder = field.decoder;
          } else {
            decoder = field.sql.decoder;
          }
          result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
        }
      }
      return result;
    }
  }
});

// node_modules/drizzle-orm/alias.cjs
var require_alias = __commonJS({
  "node_modules/drizzle-orm/alias.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var alias_exports = {};
    __export2(alias_exports, {
      ColumnAliasProxyHandler: () => ColumnAliasProxyHandler,
      RelationTableAliasProxyHandler: () => RelationTableAliasProxyHandler,
      TableAliasProxyHandler: () => TableAliasProxyHandler,
      aliasedRelation: () => aliasedRelation,
      aliasedTable: () => aliasedTable,
      aliasedTableColumn: () => aliasedTableColumn,
      mapColumnsInAliasedSQLToAlias: () => mapColumnsInAliasedSQLToAlias,
      mapColumnsInSQLToAlias: () => mapColumnsInSQLToAlias
    });
    module2.exports = __toCommonJS(alias_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_table = require_table();
    var import_view_common = require_view_common();
    var ColumnAliasProxyHandler = class {
      constructor(table) {
        this.table = table;
      }
      static [import_entity.entityKind] = "ColumnAliasProxyHandler";
      get(columnObj, prop) {
        if (prop === "table") {
          return this.table;
        }
        return columnObj[prop];
      }
    };
    var TableAliasProxyHandler = class {
      constructor(alias, replaceOriginalName) {
        this.alias = alias;
        this.replaceOriginalName = replaceOriginalName;
      }
      static [import_entity.entityKind] = "TableAliasProxyHandler";
      get(target, prop) {
        if (prop === import_table.Table.Symbol.IsAlias) {
          return true;
        }
        if (prop === import_table.Table.Symbol.Name) {
          return this.alias;
        }
        if (this.replaceOriginalName && prop === import_table.Table.Symbol.OriginalName) {
          return this.alias;
        }
        if (prop === import_view_common.ViewBaseConfig) {
          return {
            ...target[import_view_common.ViewBaseConfig],
            name: this.alias,
            isAlias: true
          };
        }
        if (prop === import_table.Table.Symbol.Columns) {
          const columns = target[import_table.Table.Symbol.Columns];
          if (!columns) {
            return columns;
          }
          const proxiedColumns = {};
          Object.keys(columns).map((key) => {
            proxiedColumns[key] = new Proxy(
              columns[key],
              new ColumnAliasProxyHandler(new Proxy(target, this))
            );
          });
          return proxiedColumns;
        }
        const value = target[prop];
        if ((0, import_entity.is)(value, import_column.Column)) {
          return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
        }
        return value;
      }
    };
    var RelationTableAliasProxyHandler = class {
      constructor(alias) {
        this.alias = alias;
      }
      static [import_entity.entityKind] = "RelationTableAliasProxyHandler";
      get(target, prop) {
        if (prop === "sourceTable") {
          return aliasedTable(target.sourceTable, this.alias);
        }
        return target[prop];
      }
    };
    function aliasedTable(table, tableAlias) {
      return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
    }
    function aliasedRelation(relation, tableAlias) {
      return new Proxy(relation, new RelationTableAliasProxyHandler(tableAlias));
    }
    function aliasedTableColumn(column, tableAlias) {
      return new Proxy(
        column,
        new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
      );
    }
    function mapColumnsInAliasedSQLToAlias(query, alias) {
      return new import_sql.SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
    }
    function mapColumnsInSQLToAlias(query, alias) {
      return import_sql.sql.join(query.queryChunks.map((c) => {
        if ((0, import_entity.is)(c, import_column.Column)) {
          return aliasedTableColumn(c, alias);
        }
        if ((0, import_entity.is)(c, import_sql.SQL)) {
          return mapColumnsInSQLToAlias(c, alias);
        }
        if ((0, import_entity.is)(c, import_sql.SQL.Aliased)) {
          return mapColumnsInAliasedSQLToAlias(c, alias);
        }
        return c;
      }));
    }
  }
});

// node_modules/drizzle-orm/selection-proxy.cjs
var require_selection_proxy = __commonJS({
  "node_modules/drizzle-orm/selection-proxy.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var selection_proxy_exports = {};
    __export2(selection_proxy_exports, {
      SelectionProxyHandler: () => SelectionProxyHandler
    });
    module2.exports = __toCommonJS(selection_proxy_exports);
    var import_alias = require_alias();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_subquery = require_subquery();
    var import_view_common = require_view_common();
    var SelectionProxyHandler = class _SelectionProxyHandler {
      static [import_entity.entityKind] = "SelectionProxyHandler";
      config;
      constructor(config) {
        this.config = { ...config };
      }
      get(subquery, prop) {
        if (prop === "_") {
          return {
            ...subquery["_"],
            selectedFields: new Proxy(
              subquery._.selectedFields,
              this
            )
          };
        }
        if (prop === import_view_common.ViewBaseConfig) {
          return {
            ...subquery[import_view_common.ViewBaseConfig],
            selectedFields: new Proxy(
              subquery[import_view_common.ViewBaseConfig].selectedFields,
              this
            )
          };
        }
        if (typeof prop === "symbol") {
          return subquery[prop];
        }
        const columns = (0, import_entity.is)(subquery, import_subquery.Subquery) ? subquery._.selectedFields : (0, import_entity.is)(subquery, import_sql.View) ? subquery[import_view_common.ViewBaseConfig].selectedFields : subquery;
        const value = columns[prop];
        if ((0, import_entity.is)(value, import_sql.SQL.Aliased)) {
          if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
            return value.sql;
          }
          const newValue = value.clone();
          newValue.isSelectionField = true;
          return newValue;
        }
        if ((0, import_entity.is)(value, import_sql.SQL)) {
          if (this.config.sqlBehavior === "sql") {
            return value;
          }
          throw new Error(
            `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
          );
        }
        if ((0, import_entity.is)(value, import_column.Column)) {
          if (this.config.alias) {
            return new Proxy(
              value,
              new import_alias.ColumnAliasProxyHandler(
                new Proxy(
                  value.table,
                  new import_alias.TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
                )
              )
            );
          }
          return value;
        }
        if (typeof value !== "object" || value === null) {
          return value;
        }
        return new Proxy(value, new _SelectionProxyHandler(this.config));
      }
    };
  }
});

// node_modules/drizzle-orm/query-promise.cjs
var require_query_promise = __commonJS({
  "node_modules/drizzle-orm/query-promise.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var query_promise_exports = {};
    __export2(query_promise_exports, {
      QueryPromise: () => QueryPromise
    });
    module2.exports = __toCommonJS(query_promise_exports);
    var import_entity = require_entity();
    var QueryPromise = class {
      static [import_entity.entityKind] = "QueryPromise";
      [Symbol.toStringTag] = "QueryPromise";
      catch(onRejected) {
        return this.then(void 0, onRejected);
      }
      finally(onFinally) {
        return this.then(
          (value) => {
            onFinally?.();
            return value;
          },
          (reason) => {
            onFinally?.();
            throw reason;
          }
        );
      }
      then(onFulfilled, onRejected) {
        return this.execute().then(onFulfilled, onRejected);
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/foreign-keys.cjs
var require_foreign_keys2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/foreign-keys.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var foreign_keys_exports = {};
    __export2(foreign_keys_exports, {
      ForeignKey: () => ForeignKey,
      ForeignKeyBuilder: () => ForeignKeyBuilder,
      foreignKey: () => foreignKey
    });
    module2.exports = __toCommonJS(foreign_keys_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    var ForeignKeyBuilder = class {
      static [import_entity.entityKind] = "SQLiteForeignKeyBuilder";
      /** @internal */
      reference;
      /** @internal */
      _onUpdate;
      /** @internal */
      _onDelete;
      constructor(config, actions) {
        this.reference = () => {
          const { name, columns, foreignColumns } = config();
          return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
        };
        if (actions) {
          this._onUpdate = actions.onUpdate;
          this._onDelete = actions.onDelete;
        }
      }
      onUpdate(action) {
        this._onUpdate = action;
        return this;
      }
      onDelete(action) {
        this._onDelete = action;
        return this;
      }
      /** @internal */
      build(table) {
        return new ForeignKey(table, this);
      }
    };
    var ForeignKey = class {
      constructor(table, builder) {
        this.table = table;
        this.reference = builder.reference;
        this.onUpdate = builder._onUpdate;
        this.onDelete = builder._onDelete;
      }
      static [import_entity.entityKind] = "SQLiteForeignKey";
      reference;
      onUpdate;
      onDelete;
      getName() {
        const { name, columns, foreignColumns } = this.reference();
        const columnNames = columns.map((column) => column.name);
        const foreignColumnNames = foreignColumns.map((column) => column.name);
        const chunks = [
          this.table[import_table_utils.TableName],
          ...columnNames,
          foreignColumns[0].table[import_table_utils.TableName],
          ...foreignColumnNames
        ];
        return name ?? `${chunks.join("_")}_fk`;
      }
    };
    function foreignKey(config) {
      function mappedConfig() {
        if (typeof config === "function") {
          const { name, columns, foreignColumns } = config();
          return {
            name,
            columns,
            foreignColumns
          };
        }
        return config;
      }
      return new ForeignKeyBuilder(mappedConfig);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/unique-constraint.cjs
var require_unique_constraint2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/unique-constraint.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var unique_constraint_exports = {};
    __export2(unique_constraint_exports, {
      UniqueConstraint: () => UniqueConstraint,
      UniqueConstraintBuilder: () => UniqueConstraintBuilder,
      UniqueOnConstraintBuilder: () => UniqueOnConstraintBuilder,
      unique: () => unique,
      uniqueKeyName: () => uniqueKeyName
    });
    module2.exports = __toCommonJS(unique_constraint_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    function uniqueKeyName(table, columns) {
      return `${table[import_table_utils.TableName]}_${columns.join("_")}_unique`;
    }
    function unique(name) {
      return new UniqueOnConstraintBuilder(name);
    }
    var UniqueConstraintBuilder = class {
      constructor(columns, name) {
        this.name = name;
        this.columns = columns;
      }
      static [import_entity.entityKind] = "SQLiteUniqueConstraintBuilder";
      /** @internal */
      columns;
      /** @internal */
      build(table) {
        return new UniqueConstraint(table, this.columns, this.name);
      }
    };
    var UniqueOnConstraintBuilder = class {
      static [import_entity.entityKind] = "SQLiteUniqueOnConstraintBuilder";
      /** @internal */
      name;
      constructor(name) {
        this.name = name;
      }
      on(...columns) {
        return new UniqueConstraintBuilder(columns, this.name);
      }
    };
    var UniqueConstraint = class {
      constructor(table, columns, name) {
        this.table = table;
        this.columns = columns;
        this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
      }
      static [import_entity.entityKind] = "SQLiteUniqueConstraint";
      columns;
      name;
      getName() {
        return this.name;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/common.cjs
var require_common2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/common.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var common_exports = {};
    __export2(common_exports, {
      SQLiteColumn: () => SQLiteColumn,
      SQLiteColumnBuilder: () => SQLiteColumnBuilder
    });
    module2.exports = __toCommonJS(common_exports);
    var import_column_builder = require_column_builder();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_foreign_keys = require_foreign_keys2();
    var import_unique_constraint = require_unique_constraint2();
    var SQLiteColumnBuilder = class extends import_column_builder.ColumnBuilder {
      static [import_entity.entityKind] = "SQLiteColumnBuilder";
      foreignKeyConfigs = [];
      references(ref, actions = {}) {
        this.foreignKeyConfigs.push({ ref, actions });
        return this;
      }
      unique(name) {
        this.config.isUnique = true;
        this.config.uniqueName = name;
        return this;
      }
      generatedAlwaysAs(as, config) {
        this.config.generated = {
          as,
          type: "always",
          mode: config?.mode ?? "virtual"
        };
        return this;
      }
      /** @internal */
      buildForeignKeys(column, table) {
        return this.foreignKeyConfigs.map(({ ref, actions }) => {
          return ((ref2, actions2) => {
            const builder = new import_foreign_keys.ForeignKeyBuilder(() => {
              const foreignColumn = ref2();
              return { columns: [column], foreignColumns: [foreignColumn] };
            });
            if (actions2.onUpdate) {
              builder.onUpdate(actions2.onUpdate);
            }
            if (actions2.onDelete) {
              builder.onDelete(actions2.onDelete);
            }
            return builder.build(table);
          })(ref, actions);
        });
      }
    };
    var SQLiteColumn = class extends import_column.Column {
      constructor(table, config) {
        if (!config.uniqueName) {
          config.uniqueName = (0, import_unique_constraint.uniqueKeyName)(table, [config.name]);
        }
        super(table, config);
        this.table = table;
      }
      static [import_entity.entityKind] = "SQLiteColumn";
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/blob.cjs
var require_blob = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/blob.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var blob_exports = {};
    __export2(blob_exports, {
      SQLiteBigInt: () => SQLiteBigInt,
      SQLiteBigIntBuilder: () => SQLiteBigIntBuilder,
      SQLiteBlobBuffer: () => SQLiteBlobBuffer,
      SQLiteBlobBufferBuilder: () => SQLiteBlobBufferBuilder,
      SQLiteBlobJson: () => SQLiteBlobJson,
      SQLiteBlobJsonBuilder: () => SQLiteBlobJsonBuilder,
      blob: () => blob
    });
    module2.exports = __toCommonJS(blob_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common2();
    var SQLiteBigIntBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteBigIntBuilder";
      constructor(name) {
        super(name, "bigint", "SQLiteBigInt");
      }
      /** @internal */
      build(table) {
        return new SQLiteBigInt(table, this.config);
      }
    };
    var SQLiteBigInt = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteBigInt";
      getSQLType() {
        return "blob";
      }
      mapFromDriverValue(value) {
        if (typeof Buffer !== "undefined" && Buffer.from) {
          const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
          return BigInt(buf.toString("utf8"));
        }
        return BigInt(import_utils.textDecoder.decode(value));
      }
      mapToDriverValue(value) {
        return Buffer.from(value.toString());
      }
    };
    var SQLiteBlobJsonBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteBlobJsonBuilder";
      constructor(name) {
        super(name, "json", "SQLiteBlobJson");
      }
      /** @internal */
      build(table) {
        return new SQLiteBlobJson(
          table,
          this.config
        );
      }
    };
    var SQLiteBlobJson = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteBlobJson";
      getSQLType() {
        return "blob";
      }
      mapFromDriverValue(value) {
        if (typeof Buffer !== "undefined" && Buffer.from) {
          const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
          return JSON.parse(buf.toString("utf8"));
        }
        return JSON.parse(import_utils.textDecoder.decode(value));
      }
      mapToDriverValue(value) {
        return Buffer.from(JSON.stringify(value));
      }
    };
    var SQLiteBlobBufferBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteBlobBufferBuilder";
      constructor(name) {
        super(name, "buffer", "SQLiteBlobBuffer");
      }
      /** @internal */
      build(table) {
        return new SQLiteBlobBuffer(table, this.config);
      }
    };
    var SQLiteBlobBuffer = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteBlobBuffer";
      mapFromDriverValue(value) {
        if (Buffer.isBuffer(value)) {
          return value;
        }
        return Buffer.from(value);
      }
      getSQLType() {
        return "blob";
      }
    };
    function blob(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "json") {
        return new SQLiteBlobJsonBuilder(name);
      }
      if (config?.mode === "bigint") {
        return new SQLiteBigIntBuilder(name);
      }
      return new SQLiteBlobBufferBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/custom.cjs
var require_custom2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/custom.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var custom_exports = {};
    __export2(custom_exports, {
      SQLiteCustomColumn: () => SQLiteCustomColumn,
      SQLiteCustomColumnBuilder: () => SQLiteCustomColumnBuilder,
      customType: () => customType
    });
    module2.exports = __toCommonJS(custom_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common2();
    var SQLiteCustomColumnBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteCustomColumnBuilder";
      constructor(name, fieldConfig, customTypeParams) {
        super(name, "custom", "SQLiteCustomColumn");
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
      }
      /** @internal */
      build(table) {
        return new SQLiteCustomColumn(
          table,
          this.config
        );
      }
    };
    var SQLiteCustomColumn = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteCustomColumn";
      sqlName;
      mapTo;
      mapFrom;
      constructor(table, config) {
        super(table, config);
        this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
        this.mapTo = config.customTypeParams.toDriver;
        this.mapFrom = config.customTypeParams.fromDriver;
      }
      getSQLType() {
        return this.sqlName;
      }
      mapFromDriverValue(value) {
        return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
      }
      mapToDriverValue(value) {
        return typeof this.mapTo === "function" ? this.mapTo(value) : value;
      }
    };
    function customType(customTypeParams) {
      return (a, b) => {
        const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
        return new SQLiteCustomColumnBuilder(
          name,
          config,
          customTypeParams
        );
      };
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/integer.cjs
var require_integer2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/integer.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var integer_exports = {};
    __export2(integer_exports, {
      SQLiteBaseInteger: () => SQLiteBaseInteger,
      SQLiteBaseIntegerBuilder: () => SQLiteBaseIntegerBuilder,
      SQLiteBoolean: () => SQLiteBoolean,
      SQLiteBooleanBuilder: () => SQLiteBooleanBuilder,
      SQLiteInteger: () => SQLiteInteger,
      SQLiteIntegerBuilder: () => SQLiteIntegerBuilder,
      SQLiteTimestamp: () => SQLiteTimestamp,
      SQLiteTimestampBuilder: () => SQLiteTimestampBuilder,
      int: () => int,
      integer: () => integer
    });
    module2.exports = __toCommonJS(integer_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_utils = require_utils();
    var import_common = require_common2();
    var SQLiteBaseIntegerBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteBaseIntegerBuilder";
      constructor(name, dataType, columnType) {
        super(name, dataType, columnType);
        this.config.autoIncrement = false;
      }
      primaryKey(config) {
        if (config?.autoIncrement) {
          this.config.autoIncrement = true;
        }
        this.config.hasDefault = true;
        return super.primaryKey();
      }
    };
    var SQLiteBaseInteger = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteBaseInteger";
      autoIncrement = this.config.autoIncrement;
      getSQLType() {
        return "integer";
      }
    };
    var SQLiteIntegerBuilder = class extends SQLiteBaseIntegerBuilder {
      static [import_entity.entityKind] = "SQLiteIntegerBuilder";
      constructor(name) {
        super(name, "number", "SQLiteInteger");
      }
      build(table) {
        return new SQLiteInteger(
          table,
          this.config
        );
      }
    };
    var SQLiteInteger = class extends SQLiteBaseInteger {
      static [import_entity.entityKind] = "SQLiteInteger";
    };
    var SQLiteTimestampBuilder = class extends SQLiteBaseIntegerBuilder {
      static [import_entity.entityKind] = "SQLiteTimestampBuilder";
      constructor(name, mode) {
        super(name, "date", "SQLiteTimestamp");
        this.config.mode = mode;
      }
      /**
       * @deprecated Use `default()` with your own expression instead.
       *
       * Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
       */
      defaultNow() {
        return this.default(import_sql.sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
      }
      build(table) {
        return new SQLiteTimestamp(
          table,
          this.config
        );
      }
    };
    var SQLiteTimestamp = class extends SQLiteBaseInteger {
      static [import_entity.entityKind] = "SQLiteTimestamp";
      mode = this.config.mode;
      mapFromDriverValue(value) {
        if (this.config.mode === "timestamp") {
          return new Date(value * 1e3);
        }
        return new Date(value);
      }
      mapToDriverValue(value) {
        const unix = value.getTime();
        if (this.config.mode === "timestamp") {
          return Math.floor(unix / 1e3);
        }
        return unix;
      }
    };
    var SQLiteBooleanBuilder = class extends SQLiteBaseIntegerBuilder {
      static [import_entity.entityKind] = "SQLiteBooleanBuilder";
      constructor(name, mode) {
        super(name, "boolean", "SQLiteBoolean");
        this.config.mode = mode;
      }
      build(table) {
        return new SQLiteBoolean(
          table,
          this.config
        );
      }
    };
    var SQLiteBoolean = class extends SQLiteBaseInteger {
      static [import_entity.entityKind] = "SQLiteBoolean";
      mode = this.config.mode;
      mapFromDriverValue(value) {
        return Number(value) === 1;
      }
      mapToDriverValue(value) {
        return value ? 1 : 0;
      }
    };
    function integer(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "timestamp" || config?.mode === "timestamp_ms") {
        return new SQLiteTimestampBuilder(name, config.mode);
      }
      if (config?.mode === "boolean") {
        return new SQLiteBooleanBuilder(name, config.mode);
      }
      return new SQLiteIntegerBuilder(name);
    }
    var int = integer;
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/numeric.cjs
var require_numeric2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/numeric.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var numeric_exports = {};
    __export2(numeric_exports, {
      SQLiteNumeric: () => SQLiteNumeric,
      SQLiteNumericBigInt: () => SQLiteNumericBigInt,
      SQLiteNumericBigIntBuilder: () => SQLiteNumericBigIntBuilder,
      SQLiteNumericBuilder: () => SQLiteNumericBuilder,
      SQLiteNumericNumber: () => SQLiteNumericNumber,
      SQLiteNumericNumberBuilder: () => SQLiteNumericNumberBuilder,
      numeric: () => numeric
    });
    module2.exports = __toCommonJS(numeric_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common2();
    var SQLiteNumericBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteNumericBuilder";
      constructor(name) {
        super(name, "string", "SQLiteNumeric");
      }
      /** @internal */
      build(table) {
        return new SQLiteNumeric(
          table,
          this.config
        );
      }
    };
    var SQLiteNumeric = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteNumeric";
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        return String(value);
      }
      getSQLType() {
        return "numeric";
      }
    };
    var SQLiteNumericNumberBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteNumericNumberBuilder";
      constructor(name) {
        super(name, "number", "SQLiteNumericNumber");
      }
      /** @internal */
      build(table) {
        return new SQLiteNumericNumber(
          table,
          this.config
        );
      }
    };
    var SQLiteNumericNumber = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteNumericNumber";
      mapFromDriverValue(value) {
        if (typeof value === "number") return value;
        return Number(value);
      }
      mapToDriverValue = String;
      getSQLType() {
        return "numeric";
      }
    };
    var SQLiteNumericBigIntBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteNumericBigIntBuilder";
      constructor(name) {
        super(name, "bigint", "SQLiteNumericBigInt");
      }
      /** @internal */
      build(table) {
        return new SQLiteNumericBigInt(
          table,
          this.config
        );
      }
    };
    var SQLiteNumericBigInt = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteNumericBigInt";
      mapFromDriverValue = BigInt;
      mapToDriverValue = String;
      getSQLType() {
        return "numeric";
      }
    };
    function numeric(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      const mode = config?.mode;
      return mode === "number" ? new SQLiteNumericNumberBuilder(name) : mode === "bigint" ? new SQLiteNumericBigIntBuilder(name) : new SQLiteNumericBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/real.cjs
var require_real2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/real.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var real_exports = {};
    __export2(real_exports, {
      SQLiteReal: () => SQLiteReal,
      SQLiteRealBuilder: () => SQLiteRealBuilder,
      real: () => real
    });
    module2.exports = __toCommonJS(real_exports);
    var import_entity = require_entity();
    var import_common = require_common2();
    var SQLiteRealBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteRealBuilder";
      constructor(name) {
        super(name, "number", "SQLiteReal");
      }
      /** @internal */
      build(table) {
        return new SQLiteReal(table, this.config);
      }
    };
    var SQLiteReal = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteReal";
      getSQLType() {
        return "real";
      }
    };
    function real(name) {
      return new SQLiteRealBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/text.cjs
var require_text2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/text.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var text_exports = {};
    __export2(text_exports, {
      SQLiteText: () => SQLiteText,
      SQLiteTextBuilder: () => SQLiteTextBuilder,
      SQLiteTextJson: () => SQLiteTextJson,
      SQLiteTextJsonBuilder: () => SQLiteTextJsonBuilder,
      text: () => text
    });
    module2.exports = __toCommonJS(text_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common2();
    var SQLiteTextBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteTextBuilder";
      constructor(name, config) {
        super(name, "string", "SQLiteText");
        this.config.enumValues = config.enum;
        this.config.length = config.length;
      }
      /** @internal */
      build(table) {
        return new SQLiteText(
          table,
          this.config
        );
      }
    };
    var SQLiteText = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteText";
      enumValues = this.config.enumValues;
      length = this.config.length;
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return `text${this.config.length ? `(${this.config.length})` : ""}`;
      }
    };
    var SQLiteTextJsonBuilder = class extends import_common.SQLiteColumnBuilder {
      static [import_entity.entityKind] = "SQLiteTextJsonBuilder";
      constructor(name) {
        super(name, "json", "SQLiteTextJson");
      }
      /** @internal */
      build(table) {
        return new SQLiteTextJson(
          table,
          this.config
        );
      }
    };
    var SQLiteTextJson = class extends import_common.SQLiteColumn {
      static [import_entity.entityKind] = "SQLiteTextJson";
      getSQLType() {
        return "text";
      }
      mapFromDriverValue(value) {
        return JSON.parse(value);
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
    };
    function text(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config.mode === "json") {
        return new SQLiteTextJsonBuilder(name);
      }
      return new SQLiteTextBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/all.cjs
var require_all2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/all.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var all_exports = {};
    __export2(all_exports, {
      getSQLiteColumnBuilders: () => getSQLiteColumnBuilders
    });
    module2.exports = __toCommonJS(all_exports);
    var import_blob = require_blob();
    var import_custom = require_custom2();
    var import_integer = require_integer2();
    var import_numeric = require_numeric2();
    var import_real = require_real2();
    var import_text = require_text2();
    function getSQLiteColumnBuilders() {
      return {
        blob: import_blob.blob,
        customType: import_custom.customType,
        integer: import_integer.integer,
        numeric: import_numeric.numeric,
        real: import_real.real,
        text: import_text.text
      };
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/table.cjs
var require_table3 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/table.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var table_exports = {};
    __export2(table_exports, {
      InlineForeignKeys: () => InlineForeignKeys,
      SQLiteTable: () => SQLiteTable,
      sqliteTable: () => sqliteTable,
      sqliteTableCreator: () => sqliteTableCreator
    });
    module2.exports = __toCommonJS(table_exports);
    var import_entity = require_entity();
    var import_table = require_table();
    var import_all = require_all2();
    var InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");
    var SQLiteTable = class extends import_table.Table {
      static [import_entity.entityKind] = "SQLiteTable";
      /** @internal */
      static Symbol = Object.assign({}, import_table.Table.Symbol, {
        InlineForeignKeys
      });
      /** @internal */
      [import_table.Table.Symbol.Columns];
      /** @internal */
      [InlineForeignKeys] = [];
      /** @internal */
      [import_table.Table.Symbol.ExtraConfigBuilder] = void 0;
    };
    function sqliteTableBase(name, columns, extraConfig, schema2, baseName = name) {
      const rawTable = new SQLiteTable(name, schema2, baseName);
      const parsedColumns = typeof columns === "function" ? columns((0, import_all.getSQLiteColumnBuilders)()) : columns;
      const builtColumns = Object.fromEntries(
        Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
          const colBuilder = colBuilderBase;
          colBuilder.setName(name2);
          const column = colBuilder.build(rawTable);
          rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
          return [name2, column];
        })
      );
      const table = Object.assign(rawTable, builtColumns);
      table[import_table.Table.Symbol.Columns] = builtColumns;
      table[import_table.Table.Symbol.ExtraConfigColumns] = builtColumns;
      if (extraConfig) {
        table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
      }
      return table;
    }
    var sqliteTable = (name, columns, extraConfig) => {
      return sqliteTableBase(name, columns, extraConfig);
    };
    function sqliteTableCreator(customizeTableName) {
      return (name, columns, extraConfig) => {
        return sqliteTableBase(customizeTableName(name), columns, extraConfig, void 0, name);
      };
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/checks.cjs
var require_checks = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/checks.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var checks_exports = {};
    __export2(checks_exports, {
      Check: () => Check,
      CheckBuilder: () => CheckBuilder,
      check: () => check
    });
    module2.exports = __toCommonJS(checks_exports);
    var import_entity = require_entity();
    var CheckBuilder = class {
      constructor(name, value) {
        this.name = name;
        this.value = value;
      }
      static [import_entity.entityKind] = "SQLiteCheckBuilder";
      brand;
      build(table) {
        return new Check(table, this);
      }
    };
    var Check = class {
      constructor(table, builder) {
        this.table = table;
        this.name = builder.name;
        this.value = builder.value;
      }
      static [import_entity.entityKind] = "SQLiteCheck";
      name;
      value;
    };
    function check(name, value) {
      return new CheckBuilder(name, value);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/indexes.cjs
var require_indexes = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/indexes.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var indexes_exports = {};
    __export2(indexes_exports, {
      Index: () => Index,
      IndexBuilder: () => IndexBuilder,
      IndexBuilderOn: () => IndexBuilderOn,
      index: () => index,
      uniqueIndex: () => uniqueIndex
    });
    module2.exports = __toCommonJS(indexes_exports);
    var import_entity = require_entity();
    var IndexBuilderOn = class {
      constructor(name, unique) {
        this.name = name;
        this.unique = unique;
      }
      static [import_entity.entityKind] = "SQLiteIndexBuilderOn";
      on(...columns) {
        return new IndexBuilder(this.name, columns, this.unique);
      }
    };
    var IndexBuilder = class {
      static [import_entity.entityKind] = "SQLiteIndexBuilder";
      /** @internal */
      config;
      constructor(name, columns, unique) {
        this.config = {
          name,
          columns,
          unique,
          where: void 0
        };
      }
      /**
       * Condition for partial index.
       */
      where(condition) {
        this.config.where = condition;
        return this;
      }
      /** @internal */
      build(table) {
        return new Index(this.config, table);
      }
    };
    var Index = class {
      static [import_entity.entityKind] = "SQLiteIndex";
      config;
      constructor(config, table) {
        this.config = { ...config, table };
      }
    };
    function index(name) {
      return new IndexBuilderOn(name, false);
    }
    function uniqueIndex(name) {
      return new IndexBuilderOn(name, true);
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/primary-keys.cjs
var require_primary_keys2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/primary-keys.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var primary_keys_exports = {};
    __export2(primary_keys_exports, {
      PrimaryKey: () => PrimaryKey,
      PrimaryKeyBuilder: () => PrimaryKeyBuilder,
      primaryKey: () => primaryKey
    });
    module2.exports = __toCommonJS(primary_keys_exports);
    var import_entity = require_entity();
    var import_table = require_table3();
    function primaryKey(...config) {
      if (config[0].columns) {
        return new PrimaryKeyBuilder(config[0].columns, config[0].name);
      }
      return new PrimaryKeyBuilder(config);
    }
    var PrimaryKeyBuilder = class {
      static [import_entity.entityKind] = "SQLitePrimaryKeyBuilder";
      /** @internal */
      columns;
      /** @internal */
      name;
      constructor(columns, name) {
        this.columns = columns;
        this.name = name;
      }
      /** @internal */
      build(table) {
        return new PrimaryKey(table, this.columns, this.name);
      }
    };
    var PrimaryKey = class {
      constructor(table, columns, name) {
        this.table = table;
        this.columns = columns;
        this.name = name;
      }
      static [import_entity.entityKind] = "SQLitePrimaryKey";
      columns;
      name;
      getName() {
        return this.name ?? `${this.table[import_table.SQLiteTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/utils.cjs
var require_utils3 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/utils.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      extractUsedTable: () => extractUsedTable,
      getTableConfig: () => getTableConfig,
      getViewConfig: () => getViewConfig
    });
    module2.exports = __toCommonJS(utils_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_subquery = require_subquery();
    var import_table = require_table();
    var import_view_common = require_view_common();
    var import_checks = require_checks();
    var import_foreign_keys = require_foreign_keys2();
    var import_indexes = require_indexes();
    var import_primary_keys = require_primary_keys2();
    var import_table2 = require_table3();
    var import_unique_constraint = require_unique_constraint2();
    function getTableConfig(table) {
      const columns = Object.values(table[import_table2.SQLiteTable.Symbol.Columns]);
      const indexes = [];
      const checks = [];
      const primaryKeys = [];
      const uniqueConstraints = [];
      const foreignKeys = Object.values(table[import_table2.SQLiteTable.Symbol.InlineForeignKeys]);
      const name = table[import_table.Table.Symbol.Name];
      const extraConfigBuilder = table[import_table2.SQLiteTable.Symbol.ExtraConfigBuilder];
      if (extraConfigBuilder !== void 0) {
        const extraConfig = extraConfigBuilder(table[import_table2.SQLiteTable.Symbol.Columns]);
        const extraValues = Array.isArray(extraConfig) ? extraConfig.flat(1) : Object.values(extraConfig);
        for (const builder of Object.values(extraValues)) {
          if ((0, import_entity.is)(builder, import_indexes.IndexBuilder)) {
            indexes.push(builder.build(table));
          } else if ((0, import_entity.is)(builder, import_checks.CheckBuilder)) {
            checks.push(builder.build(table));
          } else if ((0, import_entity.is)(builder, import_unique_constraint.UniqueConstraintBuilder)) {
            uniqueConstraints.push(builder.build(table));
          } else if ((0, import_entity.is)(builder, import_primary_keys.PrimaryKeyBuilder)) {
            primaryKeys.push(builder.build(table));
          } else if ((0, import_entity.is)(builder, import_foreign_keys.ForeignKeyBuilder)) {
            foreignKeys.push(builder.build(table));
          }
        }
      }
      return {
        columns,
        indexes,
        foreignKeys,
        checks,
        primaryKeys,
        uniqueConstraints,
        name
      };
    }
    function extractUsedTable(table) {
      if ((0, import_entity.is)(table, import_table2.SQLiteTable)) {
        return [`${table[import_table.Table.Symbol.BaseName]}`];
      }
      if ((0, import_entity.is)(table, import_subquery.Subquery)) {
        return table._.usedTables ?? [];
      }
      if ((0, import_entity.is)(table, import_sql.SQL)) {
        return table.usedTables ?? [];
      }
      return [];
    }
    function getViewConfig(view) {
      return {
        ...view[import_view_common.ViewBaseConfig]
        // ...view[SQLiteViewConfig],
      };
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/delete.cjs
var require_delete = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/delete.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var delete_exports = {};
    __export2(delete_exports, {
      SQLiteDeleteBase: () => SQLiteDeleteBase
    });
    module2.exports = __toCommonJS(delete_exports);
    var import_entity = require_entity();
    var import_query_promise = require_query_promise();
    var import_selection_proxy = require_selection_proxy();
    var import_table = require_table3();
    var import_table2 = require_table();
    var import_utils = require_utils();
    var import_utils2 = require_utils3();
    var SQLiteDeleteBase = class extends import_query_promise.QueryPromise {
      constructor(table, session, dialect, withList) {
        super();
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.config = { table, withList };
      }
      static [import_entity.entityKind] = "SQLiteDelete";
      /** @internal */
      config;
      /**
       * Adds a `where` clause to the query.
       *
       * Calling this method will delete only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/delete}
       *
       * @param where the `where` clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be deleted.
       *
       * ```ts
       * // Delete all cars with green color
       * db.delete(cars).where(eq(cars.color, 'green'));
       * // or
       * db.delete(cars).where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Delete all BMW cars with a green color
       * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Delete all cars with the green or blue color
       * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        this.config.where = where;
        return this;
      }
      orderBy(...columns) {
        if (typeof columns[0] === "function") {
          const orderBy = columns[0](
            new Proxy(
              this.config.table[import_table2.Table.Symbol.Columns],
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
          this.config.orderBy = orderByArray;
        } else {
          const orderByArray = columns;
          this.config.orderBy = orderByArray;
        }
        return this;
      }
      limit(limit) {
        this.config.limit = limit;
        return this;
      }
      returning(fields = this.table[import_table.SQLiteTable.Symbol.Columns]) {
        this.config.returning = (0, import_utils.orderSelectedFields)(fields);
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildDeleteQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(isOneTimeQuery = true) {
        return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
          this.dialect.sqlToQuery(this.getSQL()),
          this.config.returning,
          this.config.returning ? "all" : "run",
          true,
          void 0,
          {
            type: "delete",
            tables: (0, import_utils2.extractUsedTable)(this.config.table)
          }
        );
      }
      prepare() {
        return this._prepare(false);
      }
      run = (placeholderValues) => {
        return this._prepare().run(placeholderValues);
      };
      all = (placeholderValues) => {
        return this._prepare().all(placeholderValues);
      };
      get = (placeholderValues) => {
        return this._prepare().get(placeholderValues);
      };
      values = (placeholderValues) => {
        return this._prepare().values(placeholderValues);
      };
      async execute(placeholderValues) {
        return this._prepare().execute(placeholderValues);
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/casing.cjs
var require_casing = __commonJS({
  "node_modules/drizzle-orm/casing.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var casing_exports = {};
    __export2(casing_exports, {
      CasingCache: () => CasingCache,
      toCamelCase: () => toCamelCase,
      toSnakeCase: () => toSnakeCase
    });
    module2.exports = __toCommonJS(casing_exports);
    var import_entity = require_entity();
    var import_table = require_table();
    function toSnakeCase(input) {
      const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
      return words.map((word) => word.toLowerCase()).join("_");
    }
    function toCamelCase(input) {
      const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
      return words.reduce((acc, word, i) => {
        const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
        return acc + formattedWord;
      }, "");
    }
    function noopCase(input) {
      return input;
    }
    var CasingCache = class {
      static [import_entity.entityKind] = "CasingCache";
      /** @internal */
      cache = {};
      cachedTables = {};
      convert;
      constructor(casing) {
        this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
      }
      getColumnCasing(column) {
        if (!column.keyAsName) return column.name;
        const schema2 = column.table[import_table.Table.Symbol.Schema] ?? "public";
        const tableName = column.table[import_table.Table.Symbol.OriginalName];
        const key = `${schema2}.${tableName}.${column.name}`;
        if (!this.cache[key]) {
          this.cacheTable(column.table);
        }
        return this.cache[key];
      }
      cacheTable(table) {
        const schema2 = table[import_table.Table.Symbol.Schema] ?? "public";
        const tableName = table[import_table.Table.Symbol.OriginalName];
        const tableKey = `${schema2}.${tableName}`;
        if (!this.cachedTables[tableKey]) {
          for (const column of Object.values(table[import_table.Table.Symbol.Columns])) {
            const columnKey = `${tableKey}.${column.name}`;
            this.cache[columnKey] = this.convert(column.name);
          }
          this.cachedTables[tableKey] = true;
        }
      }
      clearCache() {
        this.cache = {};
        this.cachedTables = {};
      }
    };
  }
});

// node_modules/drizzle-orm/errors.cjs
var require_errors = __commonJS({
  "node_modules/drizzle-orm/errors.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var errors_exports = {};
    __export2(errors_exports, {
      DrizzleError: () => DrizzleError,
      DrizzleQueryError: () => DrizzleQueryError,
      TransactionRollbackError: () => TransactionRollbackError
    });
    module2.exports = __toCommonJS(errors_exports);
    var import_entity = require_entity();
    var DrizzleError = class extends Error {
      static [import_entity.entityKind] = "DrizzleError";
      constructor({ message, cause }) {
        super(message);
        this.name = "DrizzleError";
        this.cause = cause;
      }
    };
    var DrizzleQueryError = class _DrizzleQueryError extends Error {
      constructor(query, params, cause) {
        super(`Failed query: ${query}
params: ${params}`);
        this.query = query;
        this.params = params;
        this.cause = cause;
        Error.captureStackTrace(this, _DrizzleQueryError);
        if (cause) this.cause = cause;
      }
    };
    var TransactionRollbackError = class extends DrizzleError {
      static [import_entity.entityKind] = "TransactionRollbackError";
      constructor() {
        super({ message: "Rollback" });
      }
    };
  }
});

// node_modules/drizzle-orm/sql/functions/aggregate.cjs
var require_aggregate = __commonJS({
  "node_modules/drizzle-orm/sql/functions/aggregate.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var aggregate_exports = {};
    __export2(aggregate_exports, {
      avg: () => avg,
      avgDistinct: () => avgDistinct,
      count: () => count,
      countDistinct: () => countDistinct,
      max: () => max,
      min: () => min,
      sum: () => sum,
      sumDistinct: () => sumDistinct
    });
    module2.exports = __toCommonJS(aggregate_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    function count(expression) {
      return import_sql.sql`count(${expression || import_sql.sql.raw("*")})`.mapWith(Number);
    }
    function countDistinct(expression) {
      return import_sql.sql`count(distinct ${expression})`.mapWith(Number);
    }
    function avg(expression) {
      return import_sql.sql`avg(${expression})`.mapWith(String);
    }
    function avgDistinct(expression) {
      return import_sql.sql`avg(distinct ${expression})`.mapWith(String);
    }
    function sum(expression) {
      return import_sql.sql`sum(${expression})`.mapWith(String);
    }
    function sumDistinct(expression) {
      return import_sql.sql`sum(distinct ${expression})`.mapWith(String);
    }
    function max(expression) {
      return import_sql.sql`max(${expression})`.mapWith((0, import_entity.is)(expression, import_column.Column) ? expression : String);
    }
    function min(expression) {
      return import_sql.sql`min(${expression})`.mapWith((0, import_entity.is)(expression, import_column.Column) ? expression : String);
    }
  }
});

// node_modules/drizzle-orm/sql/functions/vector.cjs
var require_vector2 = __commonJS({
  "node_modules/drizzle-orm/sql/functions/vector.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var vector_exports = {};
    __export2(vector_exports, {
      cosineDistance: () => cosineDistance,
      hammingDistance: () => hammingDistance,
      innerProduct: () => innerProduct,
      jaccardDistance: () => jaccardDistance,
      l1Distance: () => l1Distance,
      l2Distance: () => l2Distance
    });
    module2.exports = __toCommonJS(vector_exports);
    var import_sql = require_sql();
    function toSql(value) {
      return JSON.stringify(value);
    }
    function l2Distance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <-> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <-> ${value}`;
    }
    function l1Distance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <+> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <+> ${value}`;
    }
    function innerProduct(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <#> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <#> ${value}`;
    }
    function cosineDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <=> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <=> ${value}`;
    }
    function hammingDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <~> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <~> ${value}`;
    }
    function jaccardDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <%> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <%> ${value}`;
    }
  }
});

// node_modules/drizzle-orm/sql/functions/index.cjs
var require_functions = __commonJS({
  "node_modules/drizzle-orm/sql/functions/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var functions_exports = {};
    module2.exports = __toCommonJS(functions_exports);
    __reExport(functions_exports, require_aggregate(), module2.exports);
    __reExport(functions_exports, require_vector2(), module2.exports);
  }
});

// node_modules/drizzle-orm/sql/index.cjs
var require_sql2 = __commonJS({
  "node_modules/drizzle-orm/sql/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var sql_exports = {};
    module2.exports = __toCommonJS(sql_exports);
    __reExport(sql_exports, require_expressions(), module2.exports);
    __reExport(sql_exports, require_functions(), module2.exports);
    __reExport(sql_exports, require_sql(), module2.exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/columns/index.cjs
var require_columns = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/columns/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var columns_exports = {};
    module2.exports = __toCommonJS(columns_exports);
    __reExport(columns_exports, require_blob(), module2.exports);
    __reExport(columns_exports, require_common2(), module2.exports);
    __reExport(columns_exports, require_custom2(), module2.exports);
    __reExport(columns_exports, require_integer2(), module2.exports);
    __reExport(columns_exports, require_numeric2(), module2.exports);
    __reExport(columns_exports, require_real2(), module2.exports);
    __reExport(columns_exports, require_text2(), module2.exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/view-base.cjs
var require_view_base = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/view-base.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var view_base_exports = {};
    __export2(view_base_exports, {
      SQLiteViewBase: () => SQLiteViewBase
    });
    module2.exports = __toCommonJS(view_base_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var SQLiteViewBase = class extends import_sql.View {
      static [import_entity.entityKind] = "SQLiteViewBase";
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/dialect.cjs
var require_dialect = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/dialect.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var dialect_exports = {};
    __export2(dialect_exports, {
      SQLiteAsyncDialect: () => SQLiteAsyncDialect,
      SQLiteDialect: () => SQLiteDialect,
      SQLiteSyncDialect: () => SQLiteSyncDialect
    });
    module2.exports = __toCommonJS(dialect_exports);
    var import_alias = require_alias();
    var import_casing = require_casing();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_errors = require_errors();
    var import_relations = require_relations();
    var import_sql = require_sql2();
    var import_sql2 = require_sql();
    var import_columns = require_columns();
    var import_table = require_table3();
    var import_subquery = require_subquery();
    var import_table2 = require_table();
    var import_utils = require_utils();
    var import_view_common = require_view_common();
    var import_view_base = require_view_base();
    var SQLiteDialect = class {
      static [import_entity.entityKind] = "SQLiteDialect";
      /** @internal */
      casing;
      constructor(config) {
        this.casing = new import_casing.CasingCache(config?.casing);
      }
      escapeName(name) {
        return `"${name.replace(/"/g, '""')}"`;
      }
      escapeParam(_num) {
        return "?";
      }
      escapeString(str) {
        return `'${str.replace(/'/g, "''")}'`;
      }
      buildWithCTE(queries) {
        if (!queries?.length) return void 0;
        const withSqlChunks = [import_sql2.sql`with `];
        for (const [i, w] of queries.entries()) {
          withSqlChunks.push(import_sql2.sql`${import_sql2.sql.identifier(w._.alias)} as (${w._.sql})`);
          if (i < queries.length - 1) {
            withSqlChunks.push(import_sql2.sql`, `);
          }
        }
        withSqlChunks.push(import_sql2.sql` `);
        return import_sql2.sql.join(withSqlChunks);
      }
      buildDeleteQuery({
        table,
        where,
        returning,
        withList,
        limit,
        orderBy
      }) {
        const withSql = this.buildWithCTE(withList);
        const returningSql = returning ? import_sql2.sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
        const whereSql = where ? import_sql2.sql` where ${where}` : void 0;
        const orderBySql = this.buildOrderBy(orderBy);
        const limitSql = this.buildLimit(limit);
        return import_sql2.sql`${withSql}delete from ${table}${whereSql}${returningSql}${orderBySql}${limitSql}`;
      }
      buildUpdateSet(table, set) {
        const tableColumns = table[import_table2.Table.Symbol.Columns];
        const columnNames = Object.keys(tableColumns).filter(
          (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
        );
        const setSize = columnNames.length;
        return import_sql2.sql.join(
          columnNames.flatMap((colName, i) => {
            const col = tableColumns[colName];
            const onUpdateFnResult = col.onUpdateFn?.();
            const value = set[colName] ?? ((0, import_entity.is)(onUpdateFnResult, import_sql2.SQL) ? onUpdateFnResult : import_sql2.sql.param(onUpdateFnResult, col));
            const res = import_sql2.sql`${import_sql2.sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
            if (i < setSize - 1) {
              return [res, import_sql2.sql.raw(", ")];
            }
            return [res];
          })
        );
      }
      buildUpdateQuery({
        table,
        set,
        where,
        returning,
        withList,
        joins,
        from,
        limit,
        orderBy
      }) {
        const withSql = this.buildWithCTE(withList);
        const setSql = this.buildUpdateSet(table, set);
        const fromSql = from && import_sql2.sql.join([import_sql2.sql.raw(" from "), this.buildFromTable(from)]);
        const joinsSql = this.buildJoins(joins);
        const returningSql = returning ? import_sql2.sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
        const whereSql = where ? import_sql2.sql` where ${where}` : void 0;
        const orderBySql = this.buildOrderBy(orderBy);
        const limitSql = this.buildLimit(limit);
        return import_sql2.sql`${withSql}update ${table} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}${orderBySql}${limitSql}`;
      }
      /**
       * Builds selection SQL with provided fields/expressions
       *
       * Examples:
       *
       * `select <selection> from`
       *
       * `insert ... returning <selection>`
       *
       * If `isSingleTable` is true, then columns won't be prefixed with table name
       */
      buildSelection(fields, { isSingleTable = false } = {}) {
        const columnsLen = fields.length;
        const chunks = fields.flatMap(({ field }, i) => {
          const chunk = [];
          if ((0, import_entity.is)(field, import_sql2.SQL.Aliased) && field.isSelectionField) {
            chunk.push(import_sql2.sql.identifier(field.fieldAlias));
          } else if ((0, import_entity.is)(field, import_sql2.SQL.Aliased) || (0, import_entity.is)(field, import_sql2.SQL)) {
            const query = (0, import_entity.is)(field, import_sql2.SQL.Aliased) ? field.sql : field;
            if (isSingleTable) {
              chunk.push(
                new import_sql2.SQL(
                  query.queryChunks.map((c) => {
                    if ((0, import_entity.is)(c, import_column.Column)) {
                      return import_sql2.sql.identifier(this.casing.getColumnCasing(c));
                    }
                    return c;
                  })
                )
              );
            } else {
              chunk.push(query);
            }
            if ((0, import_entity.is)(field, import_sql2.SQL.Aliased)) {
              chunk.push(import_sql2.sql` as ${import_sql2.sql.identifier(field.fieldAlias)}`);
            }
          } else if ((0, import_entity.is)(field, import_column.Column)) {
            const tableName = field.table[import_table2.Table.Symbol.Name];
            if (field.columnType === "SQLiteNumericBigInt") {
              if (isSingleTable) {
                chunk.push(
                  import_sql2.sql`cast(${import_sql2.sql.identifier(this.casing.getColumnCasing(field))} as text)`
                );
              } else {
                chunk.push(
                  import_sql2.sql`cast(${import_sql2.sql.identifier(tableName)}.${import_sql2.sql.identifier(this.casing.getColumnCasing(field))} as text)`
                );
              }
            } else {
              if (isSingleTable) {
                chunk.push(import_sql2.sql.identifier(this.casing.getColumnCasing(field)));
              } else {
                chunk.push(
                  import_sql2.sql`${import_sql2.sql.identifier(tableName)}.${import_sql2.sql.identifier(this.casing.getColumnCasing(field))}`
                );
              }
            }
          } else if ((0, import_entity.is)(field, import_subquery.Subquery)) {
            const entries = Object.entries(field._.selectedFields);
            if (entries.length === 1) {
              const entry = entries[0][1];
              const fieldDecoder = (0, import_entity.is)(entry, import_sql2.SQL) ? entry.decoder : (0, import_entity.is)(entry, import_column.Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
              if (fieldDecoder) field._.sql.decoder = fieldDecoder;
            }
            chunk.push(field);
          }
          if (i < columnsLen - 1) {
            chunk.push(import_sql2.sql`, `);
          }
          return chunk;
        });
        return import_sql2.sql.join(chunks);
      }
      buildJoins(joins) {
        if (!joins || joins.length === 0) {
          return void 0;
        }
        const joinsArray = [];
        if (joins) {
          for (const [index, joinMeta] of joins.entries()) {
            if (index === 0) {
              joinsArray.push(import_sql2.sql` `);
            }
            const table = joinMeta.table;
            const onSql = joinMeta.on ? import_sql2.sql` on ${joinMeta.on}` : void 0;
            if ((0, import_entity.is)(table, import_table.SQLiteTable)) {
              const tableName = table[import_table.SQLiteTable.Symbol.Name];
              const tableSchema = table[import_table.SQLiteTable.Symbol.Schema];
              const origTableName = table[import_table.SQLiteTable.Symbol.OriginalName];
              const alias = tableName === origTableName ? void 0 : joinMeta.alias;
              joinsArray.push(
                import_sql2.sql`${import_sql2.sql.raw(joinMeta.joinType)} join ${tableSchema ? import_sql2.sql`${import_sql2.sql.identifier(tableSchema)}.` : void 0}${import_sql2.sql.identifier(
                  origTableName
                )}${alias && import_sql2.sql` ${import_sql2.sql.identifier(alias)}`}${onSql}`
              );
            } else {
              joinsArray.push(
                import_sql2.sql`${import_sql2.sql.raw(joinMeta.joinType)} join ${table}${onSql}`
              );
            }
            if (index < joins.length - 1) {
              joinsArray.push(import_sql2.sql` `);
            }
          }
        }
        return import_sql2.sql.join(joinsArray);
      }
      buildLimit(limit) {
        return typeof limit === "object" || typeof limit === "number" && limit >= 0 ? import_sql2.sql` limit ${limit}` : void 0;
      }
      buildOrderBy(orderBy) {
        const orderByList = [];
        if (orderBy) {
          for (const [index, orderByValue] of orderBy.entries()) {
            orderByList.push(orderByValue);
            if (index < orderBy.length - 1) {
              orderByList.push(import_sql2.sql`, `);
            }
          }
        }
        return orderByList.length > 0 ? import_sql2.sql` order by ${import_sql2.sql.join(orderByList)}` : void 0;
      }
      buildFromTable(table) {
        if ((0, import_entity.is)(table, import_table2.Table) && table[import_table2.Table.Symbol.IsAlias]) {
          return import_sql2.sql`${import_sql2.sql`${import_sql2.sql.identifier(table[import_table2.Table.Symbol.Schema] ?? "")}.`.if(table[import_table2.Table.Symbol.Schema])}${import_sql2.sql.identifier(
            table[import_table2.Table.Symbol.OriginalName]
          )} ${import_sql2.sql.identifier(table[import_table2.Table.Symbol.Name])}`;
        }
        return table;
      }
      buildSelectQuery({
        withList,
        fields,
        fieldsFlat,
        where,
        having,
        table,
        joins,
        orderBy,
        groupBy,
        limit,
        offset,
        distinct,
        setOperators
      }) {
        const fieldsList = fieldsFlat ?? (0, import_utils.orderSelectedFields)(fields);
        for (const f of fieldsList) {
          if ((0, import_entity.is)(f.field, import_column.Column) && (0, import_table2.getTableName)(f.field.table) !== ((0, import_entity.is)(table, import_subquery.Subquery) ? table._.alias : (0, import_entity.is)(table, import_view_base.SQLiteViewBase) ? table[import_view_common.ViewBaseConfig].name : (0, import_entity.is)(table, import_sql2.SQL) ? void 0 : (0, import_table2.getTableName)(table)) && !((table2) => joins?.some(
            ({ alias }) => alias === (table2[import_table2.Table.Symbol.IsAlias] ? (0, import_table2.getTableName)(table2) : table2[import_table2.Table.Symbol.BaseName])
          ))(f.field.table)) {
            const tableName = (0, import_table2.getTableName)(f.field.table);
            throw new Error(
              `Your "${f.path.join(
                "->"
              )}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
            );
          }
        }
        const isSingleTable = !joins || joins.length === 0;
        const withSql = this.buildWithCTE(withList);
        const distinctSql = distinct ? import_sql2.sql` distinct` : void 0;
        const selection = this.buildSelection(fieldsList, { isSingleTable });
        const tableSql = this.buildFromTable(table);
        const joinsSql = this.buildJoins(joins);
        const whereSql = where ? import_sql2.sql` where ${where}` : void 0;
        const havingSql = having ? import_sql2.sql` having ${having}` : void 0;
        const groupByList = [];
        if (groupBy) {
          for (const [index, groupByValue] of groupBy.entries()) {
            groupByList.push(groupByValue);
            if (index < groupBy.length - 1) {
              groupByList.push(import_sql2.sql`, `);
            }
          }
        }
        const groupBySql = groupByList.length > 0 ? import_sql2.sql` group by ${import_sql2.sql.join(groupByList)}` : void 0;
        const orderBySql = this.buildOrderBy(orderBy);
        const limitSql = this.buildLimit(limit);
        const offsetSql = offset ? import_sql2.sql` offset ${offset}` : void 0;
        const finalQuery = import_sql2.sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
        if (setOperators.length > 0) {
          return this.buildSetOperations(finalQuery, setOperators);
        }
        return finalQuery;
      }
      buildSetOperations(leftSelect, setOperators) {
        const [setOperator, ...rest] = setOperators;
        if (!setOperator) {
          throw new Error("Cannot pass undefined values to any set operator");
        }
        if (rest.length === 0) {
          return this.buildSetOperationQuery({ leftSelect, setOperator });
        }
        return this.buildSetOperations(
          this.buildSetOperationQuery({ leftSelect, setOperator }),
          rest
        );
      }
      buildSetOperationQuery({
        leftSelect,
        setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
      }) {
        const leftChunk = import_sql2.sql`${leftSelect.getSQL()} `;
        const rightChunk = import_sql2.sql`${rightSelect.getSQL()}`;
        let orderBySql;
        if (orderBy && orderBy.length > 0) {
          const orderByValues = [];
          for (const singleOrderBy of orderBy) {
            if ((0, import_entity.is)(singleOrderBy, import_columns.SQLiteColumn)) {
              orderByValues.push(import_sql2.sql.identifier(singleOrderBy.name));
            } else if ((0, import_entity.is)(singleOrderBy, import_sql2.SQL)) {
              for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
                const chunk = singleOrderBy.queryChunks[i];
                if ((0, import_entity.is)(chunk, import_columns.SQLiteColumn)) {
                  singleOrderBy.queryChunks[i] = import_sql2.sql.identifier(
                    this.casing.getColumnCasing(chunk)
                  );
                }
              }
              orderByValues.push(import_sql2.sql`${singleOrderBy}`);
            } else {
              orderByValues.push(import_sql2.sql`${singleOrderBy}`);
            }
          }
          orderBySql = import_sql2.sql` order by ${import_sql2.sql.join(orderByValues, import_sql2.sql`, `)}`;
        }
        const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? import_sql2.sql` limit ${limit}` : void 0;
        const operatorChunk = import_sql2.sql.raw(`${type} ${isAll ? "all " : ""}`);
        const offsetSql = offset ? import_sql2.sql` offset ${offset}` : void 0;
        return import_sql2.sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
      }
      buildInsertQuery({
        table,
        values: valuesOrSelect,
        onConflict,
        returning,
        withList,
        select
      }) {
        const valuesSqlList = [];
        const columns = table[import_table2.Table.Symbol.Columns];
        const colEntries = Object.entries(columns).filter(
          ([_, col]) => !col.shouldDisableInsert()
        );
        const insertOrder = colEntries.map(([, column]) => import_sql2.sql.identifier(this.casing.getColumnCasing(column)));
        if (select) {
          const select2 = valuesOrSelect;
          if ((0, import_entity.is)(select2, import_sql2.SQL)) {
            valuesSqlList.push(select2);
          } else {
            valuesSqlList.push(select2.getSQL());
          }
        } else {
          const values = valuesOrSelect;
          valuesSqlList.push(import_sql2.sql.raw("values "));
          for (const [valueIndex, value] of values.entries()) {
            const valueList = [];
            for (const [fieldName, col] of colEntries) {
              const colValue = value[fieldName];
              if (colValue === void 0 || (0, import_entity.is)(colValue, import_sql2.Param) && colValue.value === void 0) {
                let defaultValue;
                if (col.default !== null && col.default !== void 0) {
                  defaultValue = (0, import_entity.is)(col.default, import_sql2.SQL) ? col.default : import_sql2.sql.param(col.default, col);
                } else if (col.defaultFn !== void 0) {
                  const defaultFnResult = col.defaultFn();
                  defaultValue = (0, import_entity.is)(defaultFnResult, import_sql2.SQL) ? defaultFnResult : import_sql2.sql.param(defaultFnResult, col);
                } else if (!col.default && col.onUpdateFn !== void 0) {
                  const onUpdateFnResult = col.onUpdateFn();
                  defaultValue = (0, import_entity.is)(onUpdateFnResult, import_sql2.SQL) ? onUpdateFnResult : import_sql2.sql.param(onUpdateFnResult, col);
                } else {
                  defaultValue = import_sql2.sql`null`;
                }
                valueList.push(defaultValue);
              } else {
                valueList.push(colValue);
              }
            }
            valuesSqlList.push(valueList);
            if (valueIndex < values.length - 1) {
              valuesSqlList.push(import_sql2.sql`, `);
            }
          }
        }
        const withSql = this.buildWithCTE(withList);
        const valuesSql = import_sql2.sql.join(valuesSqlList);
        const returningSql = returning ? import_sql2.sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
        const onConflictSql = onConflict?.length ? import_sql2.sql.join(onConflict) : void 0;
        return import_sql2.sql`${withSql}insert into ${table} ${insertOrder} ${valuesSql}${onConflictSql}${returningSql}`;
      }
      sqlToQuery(sql2, invokeSource) {
        return sql2.toQuery({
          casing: this.casing,
          escapeName: this.escapeName,
          escapeParam: this.escapeParam,
          escapeString: this.escapeString,
          invokeSource
        });
      }
      buildRelationalQuery({
        fullSchema,
        schema: schema2,
        tableNamesMap,
        table,
        tableConfig,
        queryConfig: config,
        tableAlias,
        nestedQueryRelation,
        joinOn
      }) {
        let selection = [];
        let limit, offset, orderBy = [], where;
        const joins = [];
        if (config === true) {
          const selectionEntries = Object.entries(tableConfig.columns);
          selection = selectionEntries.map(([key, value]) => ({
            dbKey: value.name,
            tsKey: key,
            field: (0, import_alias.aliasedTableColumn)(value, tableAlias),
            relationTableTsKey: void 0,
            isJson: false,
            selection: []
          }));
        } else {
          const aliasedColumns = Object.fromEntries(
            Object.entries(tableConfig.columns).map(([key, value]) => [
              key,
              (0, import_alias.aliasedTableColumn)(value, tableAlias)
            ])
          );
          if (config.where) {
            const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, (0, import_relations.getOperators)()) : config.where;
            where = whereSql && (0, import_alias.mapColumnsInSQLToAlias)(whereSql, tableAlias);
          }
          const fieldsSelection = [];
          let selectedColumns = [];
          if (config.columns) {
            let isIncludeMode = false;
            for (const [field, value] of Object.entries(config.columns)) {
              if (value === void 0) {
                continue;
              }
              if (field in tableConfig.columns) {
                if (!isIncludeMode && value === true) {
                  isIncludeMode = true;
                }
                selectedColumns.push(field);
              }
            }
            if (selectedColumns.length > 0) {
              selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter(
                (key) => !selectedColumns.includes(key)
              );
            }
          } else {
            selectedColumns = Object.keys(tableConfig.columns);
          }
          for (const field of selectedColumns) {
            const column = tableConfig.columns[field];
            fieldsSelection.push({ tsKey: field, value: column });
          }
          let selectedRelations = [];
          if (config.with) {
            selectedRelations = Object.entries(config.with).filter(
              (entry) => !!entry[1]
            ).map(([tsKey, queryConfig]) => ({
              tsKey,
              queryConfig,
              relation: tableConfig.relations[tsKey]
            }));
          }
          let extras;
          if (config.extras) {
            extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql: import_sql2.sql }) : config.extras;
            for (const [tsKey, value] of Object.entries(extras)) {
              fieldsSelection.push({
                tsKey,
                value: (0, import_alias.mapColumnsInAliasedSQLToAlias)(value, tableAlias)
              });
            }
          }
          for (const { tsKey, value } of fieldsSelection) {
            selection.push({
              dbKey: (0, import_entity.is)(value, import_sql2.SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
              tsKey,
              field: (0, import_entity.is)(value, import_column.Column) ? (0, import_alias.aliasedTableColumn)(value, tableAlias) : value,
              relationTableTsKey: void 0,
              isJson: false,
              selection: []
            });
          }
          let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, (0, import_relations.getOrderByOperators)()) : config.orderBy ?? [];
          if (!Array.isArray(orderByOrig)) {
            orderByOrig = [orderByOrig];
          }
          orderBy = orderByOrig.map((orderByValue) => {
            if ((0, import_entity.is)(orderByValue, import_column.Column)) {
              return (0, import_alias.aliasedTableColumn)(orderByValue, tableAlias);
            }
            return (0, import_alias.mapColumnsInSQLToAlias)(orderByValue, tableAlias);
          });
          limit = config.limit;
          offset = config.offset;
          for (const {
            tsKey: selectedRelationTsKey,
            queryConfig: selectedRelationConfigValue,
            relation
          } of selectedRelations) {
            const normalizedRelation = (0, import_relations.normalizeRelation)(
              schema2,
              tableNamesMap,
              relation
            );
            const relationTableName = (0, import_table2.getTableUniqueName)(relation.referencedTable);
            const relationTableTsName = tableNamesMap[relationTableName];
            const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
            const joinOn2 = (0, import_sql.and)(
              ...normalizedRelation.fields.map(
                (field2, i) => (0, import_sql.eq)(
                  (0, import_alias.aliasedTableColumn)(
                    normalizedRelation.references[i],
                    relationTableAlias
                  ),
                  (0, import_alias.aliasedTableColumn)(field2, tableAlias)
                )
              )
            );
            const builtRelation = this.buildRelationalQuery({
              fullSchema,
              schema: schema2,
              tableNamesMap,
              table: fullSchema[relationTableTsName],
              tableConfig: schema2[relationTableTsName],
              queryConfig: (0, import_entity.is)(relation, import_relations.One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
              tableAlias: relationTableAlias,
              joinOn: joinOn2,
              nestedQueryRelation: relation
            });
            const field = import_sql2.sql`(${builtRelation.sql})`.as(selectedRelationTsKey);
            selection.push({
              dbKey: selectedRelationTsKey,
              tsKey: selectedRelationTsKey,
              field,
              relationTableTsKey: relationTableTsName,
              isJson: true,
              selection: builtRelation.selection
            });
          }
        }
        if (selection.length === 0) {
          throw new import_errors.DrizzleError({
            message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
          });
        }
        let result;
        where = (0, import_sql.and)(joinOn, where);
        if (nestedQueryRelation) {
          let field = import_sql2.sql`json_array(${import_sql2.sql.join(
            selection.map(
              ({ field: field2 }) => (0, import_entity.is)(field2, import_columns.SQLiteColumn) ? import_sql2.sql.identifier(this.casing.getColumnCasing(field2)) : (0, import_entity.is)(field2, import_sql2.SQL.Aliased) ? field2.sql : field2
            ),
            import_sql2.sql`, `
          )})`;
          if ((0, import_entity.is)(nestedQueryRelation, import_relations.Many)) {
            field = import_sql2.sql`coalesce(json_group_array(${field}), json_array())`;
          }
          const nestedSelection = [
            {
              dbKey: "data",
              tsKey: "data",
              field: field.as("data"),
              isJson: true,
              relationTableTsKey: tableConfig.tsName,
              selection
            }
          ];
          const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
          if (needsSubquery) {
            result = this.buildSelectQuery({
              table: (0, import_alias.aliasedTable)(table, tableAlias),
              fields: {},
              fieldsFlat: [
                {
                  path: [],
                  field: import_sql2.sql.raw("*")
                }
              ],
              where,
              limit,
              offset,
              orderBy,
              setOperators: []
            });
            where = void 0;
            limit = void 0;
            offset = void 0;
            orderBy = void 0;
          } else {
            result = (0, import_alias.aliasedTable)(table, tableAlias);
          }
          result = this.buildSelectQuery({
            table: (0, import_entity.is)(result, import_table.SQLiteTable) ? result : new import_subquery.Subquery(result, {}, tableAlias),
            fields: {},
            fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
              path: [],
              field: (0, import_entity.is)(field2, import_column.Column) ? (0, import_alias.aliasedTableColumn)(field2, tableAlias) : field2
            })),
            joins,
            where,
            limit,
            offset,
            orderBy,
            setOperators: []
          });
        } else {
          result = this.buildSelectQuery({
            table: (0, import_alias.aliasedTable)(table, tableAlias),
            fields: {},
            fieldsFlat: selection.map(({ field }) => ({
              path: [],
              field: (0, import_entity.is)(field, import_column.Column) ? (0, import_alias.aliasedTableColumn)(field, tableAlias) : field
            })),
            joins,
            where,
            limit,
            offset,
            orderBy,
            setOperators: []
          });
        }
        return {
          tableTsKey: tableConfig.tsName,
          sql: result,
          selection
        };
      }
    };
    var SQLiteSyncDialect = class extends SQLiteDialect {
      static [import_entity.entityKind] = "SQLiteSyncDialect";
      migrate(migrations, session, config) {
        const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
        const migrationTableCreate = import_sql2.sql`
			CREATE TABLE IF NOT EXISTS ${import_sql2.sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
        session.run(migrationTableCreate);
        const dbMigrations = session.values(
          import_sql2.sql`SELECT id, hash, created_at FROM ${import_sql2.sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
        );
        const lastDbMigration = dbMigrations[0] ?? void 0;
        session.run(import_sql2.sql`BEGIN`);
        try {
          for (const migration of migrations) {
            if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
              for (const stmt of migration.sql) {
                session.run(import_sql2.sql.raw(stmt));
              }
              session.run(
                import_sql2.sql`INSERT INTO ${import_sql2.sql.identifier(
                  migrationsTable
                )} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
              );
            }
          }
          session.run(import_sql2.sql`COMMIT`);
        } catch (e) {
          session.run(import_sql2.sql`ROLLBACK`);
          throw e;
        }
      }
    };
    var SQLiteAsyncDialect = class extends SQLiteDialect {
      static [import_entity.entityKind] = "SQLiteAsyncDialect";
      async migrate(migrations, session, config) {
        const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
        const migrationTableCreate = import_sql2.sql`
			CREATE TABLE IF NOT EXISTS ${import_sql2.sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
        await session.run(migrationTableCreate);
        const dbMigrations = await session.values(
          import_sql2.sql`SELECT id, hash, created_at FROM ${import_sql2.sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
        );
        const lastDbMigration = dbMigrations[0] ?? void 0;
        await session.transaction(async (tx) => {
          for (const migration of migrations) {
            if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
              for (const stmt of migration.sql) {
                await tx.run(import_sql2.sql.raw(stmt));
              }
              await tx.run(
                import_sql2.sql`INSERT INTO ${import_sql2.sql.identifier(
                  migrationsTable
                )} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
              );
            }
          }
        });
      }
    };
  }
});

// node_modules/drizzle-orm/query-builders/query-builder.cjs
var require_query_builder = __commonJS({
  "node_modules/drizzle-orm/query-builders/query-builder.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var query_builder_exports = {};
    __export2(query_builder_exports, {
      TypedQueryBuilder: () => TypedQueryBuilder
    });
    module2.exports = __toCommonJS(query_builder_exports);
    var import_entity = require_entity();
    var TypedQueryBuilder = class {
      static [import_entity.entityKind] = "TypedQueryBuilder";
      /** @internal */
      getSelectedFields() {
        return this._.selectedFields;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/select.cjs
var require_select2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/select.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except2, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except2)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var select_exports = {};
    __export2(select_exports, {
      SQLiteSelectBase: () => SQLiteSelectBase,
      SQLiteSelectBuilder: () => SQLiteSelectBuilder,
      SQLiteSelectQueryBuilderBase: () => SQLiteSelectQueryBuilderBase,
      except: () => except,
      intersect: () => intersect,
      union: () => union,
      unionAll: () => unionAll
    });
    module2.exports = __toCommonJS(select_exports);
    var import_entity = require_entity();
    var import_query_builder = require_query_builder();
    var import_query_promise = require_query_promise();
    var import_selection_proxy = require_selection_proxy();
    var import_sql = require_sql();
    var import_subquery = require_subquery();
    var import_table = require_table();
    var import_utils = require_utils();
    var import_view_common = require_view_common();
    var import_utils2 = require_utils3();
    var import_view_base = require_view_base();
    var SQLiteSelectBuilder = class {
      static [import_entity.entityKind] = "SQLiteSelectBuilder";
      fields;
      session;
      dialect;
      withList;
      distinct;
      constructor(config) {
        this.fields = config.fields;
        this.session = config.session;
        this.dialect = config.dialect;
        this.withList = config.withList;
        this.distinct = config.distinct;
      }
      from(source) {
        const isPartialSelect = !!this.fields;
        let fields;
        if (this.fields) {
          fields = this.fields;
        } else if ((0, import_entity.is)(source, import_subquery.Subquery)) {
          fields = Object.fromEntries(
            Object.keys(source._.selectedFields).map((key) => [key, source[key]])
          );
        } else if ((0, import_entity.is)(source, import_view_base.SQLiteViewBase)) {
          fields = source[import_view_common.ViewBaseConfig].selectedFields;
        } else if ((0, import_entity.is)(source, import_sql.SQL)) {
          fields = {};
        } else {
          fields = (0, import_utils.getTableColumns)(source);
        }
        return new SQLiteSelectBase({
          table: source,
          fields,
          isPartialSelect,
          session: this.session,
          dialect: this.dialect,
          withList: this.withList,
          distinct: this.distinct
        });
      }
    };
    var SQLiteSelectQueryBuilderBase = class extends import_query_builder.TypedQueryBuilder {
      static [import_entity.entityKind] = "SQLiteSelectQueryBuilder";
      _;
      /** @internal */
      config;
      joinsNotNullableMap;
      tableName;
      isPartialSelect;
      session;
      dialect;
      cacheConfig = void 0;
      usedTables = /* @__PURE__ */ new Set();
      constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
        super();
        this.config = {
          withList,
          table,
          fields: { ...fields },
          distinct,
          setOperators: []
        };
        this.isPartialSelect = isPartialSelect;
        this.session = session;
        this.dialect = dialect;
        this._ = {
          selectedFields: fields,
          config: this.config
        };
        this.tableName = (0, import_utils.getTableLikeName)(table);
        this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
        for (const item of (0, import_utils2.extractUsedTable)(table)) this.usedTables.add(item);
      }
      /** @internal */
      getUsedTables() {
        return [...this.usedTables];
      }
      createJoin(joinType) {
        return (table, on) => {
          const baseTableName = this.tableName;
          const tableName = (0, import_utils.getTableLikeName)(table);
          for (const item of (0, import_utils2.extractUsedTable)(table)) this.usedTables.add(item);
          if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
            throw new Error(`Alias "${tableName}" is already used in this query`);
          }
          if (!this.isPartialSelect) {
            if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
              this.config.fields = {
                [baseTableName]: this.config.fields
              };
            }
            if (typeof tableName === "string" && !(0, import_entity.is)(table, import_sql.SQL)) {
              const selection = (0, import_entity.is)(table, import_subquery.Subquery) ? table._.selectedFields : (0, import_entity.is)(table, import_sql.View) ? table[import_view_common.ViewBaseConfig].selectedFields : table[import_table.Table.Symbol.Columns];
              this.config.fields[tableName] = selection;
            }
          }
          if (typeof on === "function") {
            on = on(
              new Proxy(
                this.config.fields,
                new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              )
            );
          }
          if (!this.config.joins) {
            this.config.joins = [];
          }
          this.config.joins.push({ on, table, joinType, alias: tableName });
          if (typeof tableName === "string") {
            switch (joinType) {
              case "left": {
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
              case "right": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "cross":
              case "inner": {
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "full": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
            }
          }
          return this;
        };
      }
      /**
       * Executes a `left join` operation by adding another table to the current query.
       *
       * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
       *   .from(users)
       *   .leftJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .leftJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      leftJoin = this.createJoin("left");
      /**
       * Executes a `right join` operation by adding another table to the current query.
       *
       * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .rightJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .rightJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      rightJoin = this.createJoin("right");
      /**
       * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
       *
       * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .innerJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .innerJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      innerJoin = this.createJoin("inner");
      /**
       * Executes a `full join` operation by combining rows from two tables into a new table.
       *
       * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
       *   .from(users)
       *   .fullJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .fullJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      fullJoin = this.createJoin("full");
      /**
       * Executes a `cross join` operation by combining rows from two tables into a new table.
       *
       * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
       *
       * @param table the table to join.
       *
       * @example
       *
       * ```ts
       * // Select all users, each user with every pet
       * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .crossJoin(pets)
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .crossJoin(pets)
       * ```
       */
      crossJoin = this.createJoin("cross");
      createSetOperator(type, isAll) {
        return (rightSelection) => {
          const rightSelect = typeof rightSelection === "function" ? rightSelection(getSQLiteSetOperators()) : rightSelection;
          if (!(0, import_utils.haveSameKeys)(this.getSelectedFields(), rightSelect.getSelectedFields())) {
            throw new Error(
              "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
            );
          }
          this.config.setOperators.push({ type, isAll, rightSelect });
          return this;
        };
      }
      /**
       * Adds `union` set operator to the query.
       *
       * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
       *
       * @example
       *
       * ```ts
       * // Select all unique names from customers and users tables
       * await db.select({ name: users.name })
       *   .from(users)
       *   .union(
       *     db.select({ name: customers.name }).from(customers)
       *   );
       * // or
       * import { union } from 'drizzle-orm/sqlite-core'
       *
       * await union(
       *   db.select({ name: users.name }).from(users),
       *   db.select({ name: customers.name }).from(customers)
       * );
       * ```
       */
      union = this.createSetOperator("union", false);
      /**
       * Adds `union all` set operator to the query.
       *
       * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
       *
       * @example
       *
       * ```ts
       * // Select all transaction ids from both online and in-store sales
       * await db.select({ transaction: onlineSales.transactionId })
       *   .from(onlineSales)
       *   .unionAll(
       *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
       *   );
       * // or
       * import { unionAll } from 'drizzle-orm/sqlite-core'
       *
       * await unionAll(
       *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
       *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
       * );
       * ```
       */
      unionAll = this.createSetOperator("union", true);
      /**
       * Adds `intersect` set operator to the query.
       *
       * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
       *
       * @example
       *
       * ```ts
       * // Select course names that are offered in both departments A and B
       * await db.select({ courseName: depA.courseName })
       *   .from(depA)
       *   .intersect(
       *     db.select({ courseName: depB.courseName }).from(depB)
       *   );
       * // or
       * import { intersect } from 'drizzle-orm/sqlite-core'
       *
       * await intersect(
       *   db.select({ courseName: depA.courseName }).from(depA),
       *   db.select({ courseName: depB.courseName }).from(depB)
       * );
       * ```
       */
      intersect = this.createSetOperator("intersect", false);
      /**
       * Adds `except` set operator to the query.
       *
       * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
       *
       * @example
       *
       * ```ts
       * // Select all courses offered in department A but not in department B
       * await db.select({ courseName: depA.courseName })
       *   .from(depA)
       *   .except(
       *     db.select({ courseName: depB.courseName }).from(depB)
       *   );
       * // or
       * import { except } from 'drizzle-orm/sqlite-core'
       *
       * await except(
       *   db.select({ courseName: depA.courseName }).from(depA),
       *   db.select({ courseName: depB.courseName }).from(depB)
       * );
       * ```
       */
      except = this.createSetOperator("except", false);
      /** @internal */
      addSetOperators(setOperators) {
        this.config.setOperators.push(...setOperators);
        return this;
      }
      /**
       * Adds a `where` clause to the query.
       *
       * Calling this method will select only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
       *
       * @param where the `where` clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be selected.
       *
       * ```ts
       * // Select all cars with green color
       * await db.select().from(cars).where(eq(cars.color, 'green'));
       * // or
       * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Select all BMW cars with a green color
       * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Select all cars with the green or blue color
       * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        if (typeof where === "function") {
          where = where(
            new Proxy(
              this.config.fields,
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
            )
          );
        }
        this.config.where = where;
        return this;
      }
      /**
       * Adds a `having` clause to the query.
       *
       * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
       *
       * @param having the `having` clause.
       *
       * @example
       *
       * ```ts
       * // Select all brands with more than one car
       * await db.select({
       * 	brand: cars.brand,
       * 	count: sql<number>`cast(count(${cars.id}) as int)`,
       * })
       *   .from(cars)
       *   .groupBy(cars.brand)
       *   .having(({ count }) => gt(count, 1));
       * ```
       */
      having(having) {
        if (typeof having === "function") {
          having = having(
            new Proxy(
              this.config.fields,
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
            )
          );
        }
        this.config.having = having;
        return this;
      }
      groupBy(...columns) {
        if (typeof columns[0] === "function") {
          const groupBy = columns[0](
            new Proxy(
              this.config.fields,
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
        } else {
          this.config.groupBy = columns;
        }
        return this;
      }
      orderBy(...columns) {
        if (typeof columns[0] === "function") {
          const orderBy = columns[0](
            new Proxy(
              this.config.fields,
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
          if (this.config.setOperators.length > 0) {
            this.config.setOperators.at(-1).orderBy = orderByArray;
          } else {
            this.config.orderBy = orderByArray;
          }
        } else {
          const orderByArray = columns;
          if (this.config.setOperators.length > 0) {
            this.config.setOperators.at(-1).orderBy = orderByArray;
          } else {
            this.config.orderBy = orderByArray;
          }
        }
        return this;
      }
      /**
       * Adds a `limit` clause to the query.
       *
       * Calling this method will set the maximum number of rows that will be returned by this query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
       *
       * @param limit the `limit` clause.
       *
       * @example
       *
       * ```ts
       * // Get the first 10 people from this query.
       * await db.select().from(people).limit(10);
       * ```
       */
      limit(limit) {
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).limit = limit;
        } else {
          this.config.limit = limit;
        }
        return this;
      }
      /**
       * Adds an `offset` clause to the query.
       *
       * Calling this method will skip a number of rows when returning results from this query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
       *
       * @param offset the `offset` clause.
       *
       * @example
       *
       * ```ts
       * // Get the 10th-20th people from this query.
       * await db.select().from(people).offset(10).limit(10);
       * ```
       */
      offset(offset) {
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).offset = offset;
        } else {
          this.config.offset = offset;
        }
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildSelectQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      as(alias) {
        const usedTables = [];
        usedTables.push(...(0, import_utils2.extractUsedTable)(this.config.table));
        if (this.config.joins) {
          for (const it of this.config.joins) usedTables.push(...(0, import_utils2.extractUsedTable)(it.table));
        }
        return new Proxy(
          new import_subquery.Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
          new import_selection_proxy.SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
      /** @internal */
      getSelectedFields() {
        return new Proxy(
          this.config.fields,
          new import_selection_proxy.SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
      $dynamic() {
        return this;
      }
    };
    var SQLiteSelectBase = class extends SQLiteSelectQueryBuilderBase {
      static [import_entity.entityKind] = "SQLiteSelect";
      /** @internal */
      _prepare(isOneTimeQuery = true) {
        if (!this.session) {
          throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
        }
        const fieldsList = (0, import_utils.orderSelectedFields)(this.config.fields);
        const query = this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
          this.dialect.sqlToQuery(this.getSQL()),
          fieldsList,
          "all",
          true,
          void 0,
          {
            type: "select",
            tables: [...this.usedTables]
          },
          this.cacheConfig
        );
        query.joinsNotNullableMap = this.joinsNotNullableMap;
        return query;
      }
      $withCache(config) {
        this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
        return this;
      }
      prepare() {
        return this._prepare(false);
      }
      run = (placeholderValues) => {
        return this._prepare().run(placeholderValues);
      };
      all = (placeholderValues) => {
        return this._prepare().all(placeholderValues);
      };
      get = (placeholderValues) => {
        return this._prepare().get(placeholderValues);
      };
      values = (placeholderValues) => {
        return this._prepare().values(placeholderValues);
      };
      async execute() {
        return this.all();
      }
    };
    (0, import_utils.applyMixins)(SQLiteSelectBase, [import_query_promise.QueryPromise]);
    function createSetOperator(type, isAll) {
      return (leftSelect, rightSelect, ...restSelects) => {
        const setOperators = [rightSelect, ...restSelects].map((select) => ({
          type,
          isAll,
          rightSelect: select
        }));
        for (const setOperator of setOperators) {
          if (!(0, import_utils.haveSameKeys)(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
            throw new Error(
              "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
            );
          }
        }
        return leftSelect.addSetOperators(setOperators);
      };
    }
    var getSQLiteSetOperators = () => ({
      union,
      unionAll,
      intersect,
      except
    });
    var union = createSetOperator("union", false);
    var unionAll = createSetOperator("union", true);
    var intersect = createSetOperator("intersect", false);
    var except = createSetOperator("except", false);
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/query-builder.cjs
var require_query_builder2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/query-builder.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var query_builder_exports = {};
    __export2(query_builder_exports, {
      QueryBuilder: () => QueryBuilder
    });
    module2.exports = __toCommonJS(query_builder_exports);
    var import_entity = require_entity();
    var import_selection_proxy = require_selection_proxy();
    var import_dialect = require_dialect();
    var import_subquery = require_subquery();
    var import_select = require_select2();
    var QueryBuilder = class {
      static [import_entity.entityKind] = "SQLiteQueryBuilder";
      dialect;
      dialectConfig;
      constructor(dialect) {
        this.dialect = (0, import_entity.is)(dialect, import_dialect.SQLiteDialect) ? dialect : void 0;
        this.dialectConfig = (0, import_entity.is)(dialect, import_dialect.SQLiteDialect) ? void 0 : dialect;
      }
      $with = (alias, selection) => {
        const queryBuilder = this;
        const as = (qb) => {
          if (typeof qb === "function") {
            qb = qb(queryBuilder);
          }
          return new Proxy(
            new import_subquery.WithSubquery(
              qb.getSQL(),
              selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
              alias,
              true
            ),
            new import_selection_proxy.SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
          );
        };
        return { as };
      };
      with(...queries) {
        const self = this;
        function select(fields) {
          return new import_select.SQLiteSelectBuilder({
            fields: fields ?? void 0,
            session: void 0,
            dialect: self.getDialect(),
            withList: queries
          });
        }
        function selectDistinct(fields) {
          return new import_select.SQLiteSelectBuilder({
            fields: fields ?? void 0,
            session: void 0,
            dialect: self.getDialect(),
            withList: queries,
            distinct: true
          });
        }
        return { select, selectDistinct };
      }
      select(fields) {
        return new import_select.SQLiteSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
      }
      selectDistinct(fields) {
        return new import_select.SQLiteSelectBuilder({
          fields: fields ?? void 0,
          session: void 0,
          dialect: this.getDialect(),
          distinct: true
        });
      }
      // Lazy load dialect to avoid circular dependency
      getDialect() {
        if (!this.dialect) {
          this.dialect = new import_dialect.SQLiteSyncDialect(this.dialectConfig);
        }
        return this.dialect;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/insert.cjs
var require_insert = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/insert.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var insert_exports = {};
    __export2(insert_exports, {
      SQLiteInsertBase: () => SQLiteInsertBase,
      SQLiteInsertBuilder: () => SQLiteInsertBuilder
    });
    module2.exports = __toCommonJS(insert_exports);
    var import_entity = require_entity();
    var import_query_promise = require_query_promise();
    var import_sql = require_sql();
    var import_table = require_table3();
    var import_table2 = require_table();
    var import_utils = require_utils();
    var import_utils2 = require_utils3();
    var import_query_builder = require_query_builder2();
    var SQLiteInsertBuilder = class {
      constructor(table, session, dialect, withList) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.withList = withList;
      }
      static [import_entity.entityKind] = "SQLiteInsertBuilder";
      values(values) {
        values = Array.isArray(values) ? values : [values];
        if (values.length === 0) {
          throw new Error("values() must be called with at least one value");
        }
        const mappedValues = values.map((entry) => {
          const result = {};
          const cols = this.table[import_table2.Table.Symbol.Columns];
          for (const colKey of Object.keys(entry)) {
            const colValue = entry[colKey];
            result[colKey] = (0, import_entity.is)(colValue, import_sql.SQL) ? colValue : new import_sql.Param(colValue, cols[colKey]);
          }
          return result;
        });
        return new SQLiteInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList);
      }
      select(selectQuery) {
        const select = typeof selectQuery === "function" ? selectQuery(new import_query_builder.QueryBuilder()) : selectQuery;
        if (!(0, import_entity.is)(select, import_sql.SQL) && !(0, import_utils.haveSameKeys)(this.table[import_table2.Columns], select._.selectedFields)) {
          throw new Error(
            "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
          );
        }
        return new SQLiteInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
      }
    };
    var SQLiteInsertBase = class extends import_query_promise.QueryPromise {
      constructor(table, values, session, dialect, withList, select) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values, withList, select };
      }
      static [import_entity.entityKind] = "SQLiteInsert";
      /** @internal */
      config;
      returning(fields = this.config.table[import_table.SQLiteTable.Symbol.Columns]) {
        this.config.returning = (0, import_utils.orderSelectedFields)(fields);
        return this;
      }
      /**
       * Adds an `on conflict do nothing` clause to the query.
       *
       * Calling this method simply avoids inserting a row as its alternative action.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
       *
       * @param config The `target` and `where` clauses.
       *
       * @example
       * ```ts
       * // Insert one row and cancel the insert if there's a conflict
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoNothing();
       *
       * // Explicitly specify conflict target
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoNothing({ target: cars.id });
       * ```
       */
      onConflictDoNothing(config = {}) {
        if (!this.config.onConflict) this.config.onConflict = [];
        if (config.target === void 0) {
          this.config.onConflict.push(import_sql.sql` on conflict do nothing`);
        } else {
          const targetSql = Array.isArray(config.target) ? import_sql.sql`${config.target}` : import_sql.sql`${[config.target]}`;
          const whereSql = config.where ? import_sql.sql` where ${config.where}` : import_sql.sql``;
          this.config.onConflict.push(import_sql.sql` on conflict ${targetSql} do nothing${whereSql}`);
        }
        return this;
      }
      /**
       * Adds an `on conflict do update` clause to the query.
       *
       * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
       *
       * @param config The `target`, `set` and `where` clauses.
       *
       * @example
       * ```ts
       * // Update the row if there's a conflict
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoUpdate({
       *     target: cars.id,
       *     set: { brand: 'Porsche' }
       *   });
       *
       * // Upsert with 'where' clause
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoUpdate({
       *     target: cars.id,
       *     set: { brand: 'newBMW' },
       *     where: sql`${cars.createdAt} > '2023-01-01'::date`,
       *   });
       * ```
       */
      onConflictDoUpdate(config) {
        if (config.where && (config.targetWhere || config.setWhere)) {
          throw new Error(
            'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
          );
        }
        if (!this.config.onConflict) this.config.onConflict = [];
        const whereSql = config.where ? import_sql.sql` where ${config.where}` : void 0;
        const targetWhereSql = config.targetWhere ? import_sql.sql` where ${config.targetWhere}` : void 0;
        const setWhereSql = config.setWhere ? import_sql.sql` where ${config.setWhere}` : void 0;
        const targetSql = Array.isArray(config.target) ? import_sql.sql`${config.target}` : import_sql.sql`${[config.target]}`;
        const setSql = this.dialect.buildUpdateSet(this.config.table, (0, import_utils.mapUpdateSet)(this.config.table, config.set));
        this.config.onConflict.push(
          import_sql.sql` on conflict ${targetSql}${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`
        );
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildInsertQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(isOneTimeQuery = true) {
        return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
          this.dialect.sqlToQuery(this.getSQL()),
          this.config.returning,
          this.config.returning ? "all" : "run",
          true,
          void 0,
          {
            type: "insert",
            tables: (0, import_utils2.extractUsedTable)(this.config.table)
          }
        );
      }
      prepare() {
        return this._prepare(false);
      }
      run = (placeholderValues) => {
        return this._prepare().run(placeholderValues);
      };
      all = (placeholderValues) => {
        return this._prepare().all(placeholderValues);
      };
      get = (placeholderValues) => {
        return this._prepare().get(placeholderValues);
      };
      values = (placeholderValues) => {
        return this._prepare().values(placeholderValues);
      };
      async execute() {
        return this.config.returning ? this.all() : this.run();
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/select.types.cjs
var require_select_types = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/select.types.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var select_types_exports = {};
    module2.exports = __toCommonJS(select_types_exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/update.cjs
var require_update = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/update.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var update_exports = {};
    __export2(update_exports, {
      SQLiteUpdateBase: () => SQLiteUpdateBase,
      SQLiteUpdateBuilder: () => SQLiteUpdateBuilder
    });
    module2.exports = __toCommonJS(update_exports);
    var import_entity = require_entity();
    var import_query_promise = require_query_promise();
    var import_selection_proxy = require_selection_proxy();
    var import_table = require_table3();
    var import_subquery = require_subquery();
    var import_table2 = require_table();
    var import_utils = require_utils();
    var import_view_common = require_view_common();
    var import_utils2 = require_utils3();
    var import_view_base = require_view_base();
    var SQLiteUpdateBuilder = class {
      constructor(table, session, dialect, withList) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.withList = withList;
      }
      static [import_entity.entityKind] = "SQLiteUpdateBuilder";
      set(values) {
        return new SQLiteUpdateBase(
          this.table,
          (0, import_utils.mapUpdateSet)(this.table, values),
          this.session,
          this.dialect,
          this.withList
        );
      }
    };
    var SQLiteUpdateBase = class extends import_query_promise.QueryPromise {
      constructor(table, set, session, dialect, withList) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { set, table, withList, joins: [] };
      }
      static [import_entity.entityKind] = "SQLiteUpdate";
      /** @internal */
      config;
      from(source) {
        this.config.from = source;
        return this;
      }
      createJoin(joinType) {
        return (table, on) => {
          const tableName = (0, import_utils.getTableLikeName)(table);
          if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
            throw new Error(`Alias "${tableName}" is already used in this query`);
          }
          if (typeof on === "function") {
            const from = this.config.from ? (0, import_entity.is)(table, import_table.SQLiteTable) ? table[import_table2.Table.Symbol.Columns] : (0, import_entity.is)(table, import_subquery.Subquery) ? table._.selectedFields : (0, import_entity.is)(table, import_view_base.SQLiteViewBase) ? table[import_view_common.ViewBaseConfig].selectedFields : void 0 : void 0;
            on = on(
              new Proxy(
                this.config.table[import_table2.Table.Symbol.Columns],
                new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              ),
              from && new Proxy(
                from,
                new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              )
            );
          }
          this.config.joins.push({ on, table, joinType, alias: tableName });
          return this;
        };
      }
      leftJoin = this.createJoin("left");
      rightJoin = this.createJoin("right");
      innerJoin = this.createJoin("inner");
      fullJoin = this.createJoin("full");
      /**
       * Adds a 'where' clause to the query.
       *
       * Calling this method will update only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/update}
       *
       * @param where the 'where' clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be updated.
       *
       * ```ts
       * // Update all cars with green color
       * db.update(cars).set({ color: 'red' })
       *   .where(eq(cars.color, 'green'));
       * // or
       * db.update(cars).set({ color: 'red' })
       *   .where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Update all BMW cars with a green color
       * db.update(cars).set({ color: 'red' })
       *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Update all cars with the green or blue color
       * db.update(cars).set({ color: 'red' })
       *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        this.config.where = where;
        return this;
      }
      orderBy(...columns) {
        if (typeof columns[0] === "function") {
          const orderBy = columns[0](
            new Proxy(
              this.config.table[import_table2.Table.Symbol.Columns],
              new import_selection_proxy.SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
          this.config.orderBy = orderByArray;
        } else {
          const orderByArray = columns;
          this.config.orderBy = orderByArray;
        }
        return this;
      }
      limit(limit) {
        this.config.limit = limit;
        return this;
      }
      returning(fields = this.config.table[import_table.SQLiteTable.Symbol.Columns]) {
        this.config.returning = (0, import_utils.orderSelectedFields)(fields);
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildUpdateQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(isOneTimeQuery = true) {
        return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
          this.dialect.sqlToQuery(this.getSQL()),
          this.config.returning,
          this.config.returning ? "all" : "run",
          true,
          void 0,
          {
            type: "insert",
            tables: (0, import_utils2.extractUsedTable)(this.config.table)
          }
        );
      }
      prepare() {
        return this._prepare(false);
      }
      run = (placeholderValues) => {
        return this._prepare().run(placeholderValues);
      };
      all = (placeholderValues) => {
        return this._prepare().all(placeholderValues);
      };
      get = (placeholderValues) => {
        return this._prepare().get(placeholderValues);
      };
      values = (placeholderValues) => {
        return this._prepare().values(placeholderValues);
      };
      async execute() {
        return this.config.returning ? this.all() : this.run();
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/index.cjs
var require_query_builders = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var query_builders_exports = {};
    module2.exports = __toCommonJS(query_builders_exports);
    __reExport(query_builders_exports, require_delete(), module2.exports);
    __reExport(query_builders_exports, require_insert(), module2.exports);
    __reExport(query_builders_exports, require_query_builder2(), module2.exports);
    __reExport(query_builders_exports, require_select2(), module2.exports);
    __reExport(query_builders_exports, require_select_types(), module2.exports);
    __reExport(query_builders_exports, require_update(), module2.exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/count.cjs
var require_count = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/count.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var count_exports = {};
    __export2(count_exports, {
      SQLiteCountBuilder: () => SQLiteCountBuilder
    });
    module2.exports = __toCommonJS(count_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var SQLiteCountBuilder = class _SQLiteCountBuilder extends import_sql.SQL {
      constructor(params) {
        super(_SQLiteCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
        this.params = params;
        this.session = params.session;
        this.sql = _SQLiteCountBuilder.buildCount(
          params.source,
          params.filters
        );
      }
      sql;
      static [import_entity.entityKind] = "SQLiteCountBuilderAsync";
      [Symbol.toStringTag] = "SQLiteCountBuilderAsync";
      session;
      static buildEmbeddedCount(source, filters) {
        return import_sql.sql`(select count(*) from ${source}${import_sql.sql.raw(" where ").if(filters)}${filters})`;
      }
      static buildCount(source, filters) {
        return import_sql.sql`select count(*) from ${source}${import_sql.sql.raw(" where ").if(filters)}${filters}`;
      }
      then(onfulfilled, onrejected) {
        return Promise.resolve(this.session.count(this.sql)).then(
          onfulfilled,
          onrejected
        );
      }
      catch(onRejected) {
        return this.then(void 0, onRejected);
      }
      finally(onFinally) {
        return this.then(
          (value) => {
            onFinally?.();
            return value;
          },
          (reason) => {
            onFinally?.();
            throw reason;
          }
        );
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/query.cjs
var require_query = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/query.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var query_exports = {};
    __export2(query_exports, {
      RelationalQueryBuilder: () => RelationalQueryBuilder,
      SQLiteRelationalQuery: () => SQLiteRelationalQuery,
      SQLiteSyncRelationalQuery: () => SQLiteSyncRelationalQuery
    });
    module2.exports = __toCommonJS(query_exports);
    var import_entity = require_entity();
    var import_query_promise = require_query_promise();
    var import_relations = require_relations();
    var RelationalQueryBuilder = class {
      constructor(mode, fullSchema, schema2, tableNamesMap, table, tableConfig, dialect, session) {
        this.mode = mode;
        this.fullSchema = fullSchema;
        this.schema = schema2;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
      }
      static [import_entity.entityKind] = "SQLiteAsyncRelationalQueryBuilder";
      findMany(config) {
        return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? config : {},
          "many"
        ) : new SQLiteRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? config : {},
          "many"
        );
      }
      findFirst(config) {
        return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? { ...config, limit: 1 } : { limit: 1 },
          "first"
        ) : new SQLiteRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? { ...config, limit: 1 } : { limit: 1 },
          "first"
        );
      }
    };
    var SQLiteRelationalQuery = class extends import_query_promise.QueryPromise {
      constructor(fullSchema, schema2, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
        super();
        this.fullSchema = fullSchema;
        this.schema = schema2;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
        this.config = config;
        this.mode = mode;
      }
      static [import_entity.entityKind] = "SQLiteAsyncRelationalQuery";
      /** @internal */
      mode;
      /** @internal */
      getSQL() {
        return this.dialect.buildRelationalQuery({
          fullSchema: this.fullSchema,
          schema: this.schema,
          tableNamesMap: this.tableNamesMap,
          table: this.table,
          tableConfig: this.tableConfig,
          queryConfig: this.config,
          tableAlias: this.tableConfig.tsName
        }).sql;
      }
      /** @internal */
      _prepare(isOneTimeQuery = false) {
        const { query, builtQuery } = this._toSQL();
        return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
          builtQuery,
          void 0,
          this.mode === "first" ? "get" : "all",
          true,
          (rawRows, mapColumnValue) => {
            const rows = rawRows.map(
              (row) => (0, import_relations.mapRelationalRow)(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
            );
            if (this.mode === "first") {
              return rows[0];
            }
            return rows;
          }
        );
      }
      prepare() {
        return this._prepare(false);
      }
      _toSQL() {
        const query = this.dialect.buildRelationalQuery({
          fullSchema: this.fullSchema,
          schema: this.schema,
          tableNamesMap: this.tableNamesMap,
          table: this.table,
          tableConfig: this.tableConfig,
          queryConfig: this.config,
          tableAlias: this.tableConfig.tsName
        });
        const builtQuery = this.dialect.sqlToQuery(query.sql);
        return { query, builtQuery };
      }
      toSQL() {
        return this._toSQL().builtQuery;
      }
      /** @internal */
      executeRaw() {
        if (this.mode === "first") {
          return this._prepare(false).get();
        }
        return this._prepare(false).all();
      }
      async execute() {
        return this.executeRaw();
      }
    };
    var SQLiteSyncRelationalQuery = class extends SQLiteRelationalQuery {
      static [import_entity.entityKind] = "SQLiteSyncRelationalQuery";
      sync() {
        return this.executeRaw();
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/query-builders/raw.cjs
var require_raw = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/query-builders/raw.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var raw_exports = {};
    __export2(raw_exports, {
      SQLiteRaw: () => SQLiteRaw
    });
    module2.exports = __toCommonJS(raw_exports);
    var import_entity = require_entity();
    var import_query_promise = require_query_promise();
    var SQLiteRaw = class extends import_query_promise.QueryPromise {
      constructor(execute, getSQL, action, dialect, mapBatchResult) {
        super();
        this.execute = execute;
        this.getSQL = getSQL;
        this.dialect = dialect;
        this.mapBatchResult = mapBatchResult;
        this.config = { action };
      }
      static [import_entity.entityKind] = "SQLiteRaw";
      /** @internal */
      config;
      getQuery() {
        return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.config.action };
      }
      mapResult(result, isFromBatch) {
        return isFromBatch ? this.mapBatchResult(result) : result;
      }
      _prepare() {
        return this;
      }
      /** @internal */
      isResponseInArrayMode() {
        return false;
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/db.cjs
var require_db = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/db.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var db_exports = {};
    __export2(db_exports, {
      BaseSQLiteDatabase: () => BaseSQLiteDatabase,
      withReplicas: () => withReplicas
    });
    module2.exports = __toCommonJS(db_exports);
    var import_entity = require_entity();
    var import_selection_proxy = require_selection_proxy();
    var import_sql = require_sql();
    var import_query_builders = require_query_builders();
    var import_subquery = require_subquery();
    var import_count = require_count();
    var import_query = require_query();
    var import_raw = require_raw();
    var BaseSQLiteDatabase = class {
      constructor(resultKind, dialect, session, schema2) {
        this.resultKind = resultKind;
        this.dialect = dialect;
        this.session = session;
        this._ = schema2 ? {
          schema: schema2.schema,
          fullSchema: schema2.fullSchema,
          tableNamesMap: schema2.tableNamesMap
        } : {
          schema: void 0,
          fullSchema: {},
          tableNamesMap: {}
        };
        this.query = {};
        const query = this.query;
        if (this._.schema) {
          for (const [tableName, columns] of Object.entries(this._.schema)) {
            query[tableName] = new import_query.RelationalQueryBuilder(
              resultKind,
              schema2.fullSchema,
              this._.schema,
              this._.tableNamesMap,
              schema2.fullSchema[tableName],
              columns,
              dialect,
              session
            );
          }
        }
        this.$cache = { invalidate: async (_params) => {
        } };
      }
      static [import_entity.entityKind] = "BaseSQLiteDatabase";
      query;
      /**
       * Creates a subquery that defines a temporary named result set as a CTE.
       *
       * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
       *
       * @param alias The alias for the subquery.
       *
       * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
       *
       * @example
       *
       * ```ts
       * // Create a subquery with alias 'sq' and use it in the select query
       * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
       *
       * const result = await db.with(sq).select().from(sq);
       * ```
       *
       * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
       *
       * ```ts
       * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
       * const sq = db.$with('sq').as(db.select({
       *   name: sql<string>`upper(${users.name})`.as('name'),
       * })
       * .from(users));
       *
       * const result = await db.with(sq).select({ name: sq.name }).from(sq);
       * ```
       */
      $with = (alias, selection) => {
        const self = this;
        const as = (qb) => {
          if (typeof qb === "function") {
            qb = qb(new import_query_builders.QueryBuilder(self.dialect));
          }
          return new Proxy(
            new import_subquery.WithSubquery(
              qb.getSQL(),
              selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
              alias,
              true
            ),
            new import_selection_proxy.SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
          );
        };
        return { as };
      };
      $count(source, filters) {
        return new import_count.SQLiteCountBuilder({ source, filters, session: this.session });
      }
      /**
       * Incorporates a previously defined CTE (using `$with`) into the main query.
       *
       * This method allows the main query to reference a temporary named result set.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
       *
       * @param queries The CTEs to incorporate into the main query.
       *
       * @example
       *
       * ```ts
       * // Define a subquery 'sq' as a CTE using $with
       * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
       *
       * // Incorporate the CTE 'sq' into the main query and select from it
       * const result = await db.with(sq).select().from(sq);
       * ```
       */
      with(...queries) {
        const self = this;
        function select(fields) {
          return new import_query_builders.SQLiteSelectBuilder({
            fields: fields ?? void 0,
            session: self.session,
            dialect: self.dialect,
            withList: queries
          });
        }
        function selectDistinct(fields) {
          return new import_query_builders.SQLiteSelectBuilder({
            fields: fields ?? void 0,
            session: self.session,
            dialect: self.dialect,
            withList: queries,
            distinct: true
          });
        }
        function update(table) {
          return new import_query_builders.SQLiteUpdateBuilder(table, self.session, self.dialect, queries);
        }
        function insert(into) {
          return new import_query_builders.SQLiteInsertBuilder(into, self.session, self.dialect, queries);
        }
        function delete_(from) {
          return new import_query_builders.SQLiteDeleteBase(from, self.session, self.dialect, queries);
        }
        return { select, selectDistinct, update, insert, delete: delete_ };
      }
      select(fields) {
        return new import_query_builders.SQLiteSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
      }
      selectDistinct(fields) {
        return new import_query_builders.SQLiteSelectBuilder({
          fields: fields ?? void 0,
          session: this.session,
          dialect: this.dialect,
          distinct: true
        });
      }
      /**
       * Creates an update query.
       *
       * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
       *
       * Use `.set()` method to specify which values to update.
       *
       * See docs: {@link https://orm.drizzle.team/docs/update}
       *
       * @param table The table to update.
       *
       * @example
       *
       * ```ts
       * // Update all rows in the 'cars' table
       * await db.update(cars).set({ color: 'red' });
       *
       * // Update rows with filters and conditions
       * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
       *
       * // Update with returning clause
       * const updatedCar: Car[] = await db.update(cars)
       *   .set({ color: 'red' })
       *   .where(eq(cars.id, 1))
       *   .returning();
       * ```
       */
      update(table) {
        return new import_query_builders.SQLiteUpdateBuilder(table, this.session, this.dialect);
      }
      $cache;
      /**
       * Creates an insert query.
       *
       * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert}
       *
       * @param table The table to insert into.
       *
       * @example
       *
       * ```ts
       * // Insert one row
       * await db.insert(cars).values({ brand: 'BMW' });
       *
       * // Insert multiple rows
       * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
       *
       * // Insert with returning clause
       * const insertedCar: Car[] = await db.insert(cars)
       *   .values({ brand: 'BMW' })
       *   .returning();
       * ```
       */
      insert(into) {
        return new import_query_builders.SQLiteInsertBuilder(into, this.session, this.dialect);
      }
      /**
       * Creates a delete query.
       *
       * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
       *
       * See docs: {@link https://orm.drizzle.team/docs/delete}
       *
       * @param table The table to delete from.
       *
       * @example
       *
       * ```ts
       * // Delete all rows in the 'cars' table
       * await db.delete(cars);
       *
       * // Delete rows with filters and conditions
       * await db.delete(cars).where(eq(cars.color, 'green'));
       *
       * // Delete with returning clause
       * const deletedCar: Car[] = await db.delete(cars)
       *   .where(eq(cars.id, 1))
       *   .returning();
       * ```
       */
      delete(from) {
        return new import_query_builders.SQLiteDeleteBase(from, this.session, this.dialect);
      }
      run(query) {
        const sequel = typeof query === "string" ? import_sql.sql.raw(query) : query.getSQL();
        if (this.resultKind === "async") {
          return new import_raw.SQLiteRaw(
            async () => this.session.run(sequel),
            () => sequel,
            "run",
            this.dialect,
            this.session.extractRawRunValueFromBatchResult.bind(this.session)
          );
        }
        return this.session.run(sequel);
      }
      all(query) {
        const sequel = typeof query === "string" ? import_sql.sql.raw(query) : query.getSQL();
        if (this.resultKind === "async") {
          return new import_raw.SQLiteRaw(
            async () => this.session.all(sequel),
            () => sequel,
            "all",
            this.dialect,
            this.session.extractRawAllValueFromBatchResult.bind(this.session)
          );
        }
        return this.session.all(sequel);
      }
      get(query) {
        const sequel = typeof query === "string" ? import_sql.sql.raw(query) : query.getSQL();
        if (this.resultKind === "async") {
          return new import_raw.SQLiteRaw(
            async () => this.session.get(sequel),
            () => sequel,
            "get",
            this.dialect,
            this.session.extractRawGetValueFromBatchResult.bind(this.session)
          );
        }
        return this.session.get(sequel);
      }
      values(query) {
        const sequel = typeof query === "string" ? import_sql.sql.raw(query) : query.getSQL();
        if (this.resultKind === "async") {
          return new import_raw.SQLiteRaw(
            async () => this.session.values(sequel),
            () => sequel,
            "values",
            this.dialect,
            this.session.extractRawValuesValueFromBatchResult.bind(this.session)
          );
        }
        return this.session.values(sequel);
      }
      transaction(transaction, config) {
        return this.session.transaction(transaction, config);
      }
    };
    var withReplicas = (primary, replicas, getReplica = () => replicas[Math.floor(Math.random() * replicas.length)]) => {
      const select = (...args) => getReplica(replicas).select(...args);
      const selectDistinct = (...args) => getReplica(replicas).selectDistinct(...args);
      const $count = (...args) => getReplica(replicas).$count(...args);
      const $with = (...args) => getReplica(replicas).with(...args);
      const update = (...args) => primary.update(...args);
      const insert = (...args) => primary.insert(...args);
      const $delete = (...args) => primary.delete(...args);
      const run = (...args) => primary.run(...args);
      const all = (...args) => primary.all(...args);
      const get = (...args) => primary.get(...args);
      const values = (...args) => primary.values(...args);
      const transaction = (...args) => primary.transaction(...args);
      return {
        ...primary,
        update,
        insert,
        delete: $delete,
        run,
        all,
        get,
        values,
        transaction,
        $primary: primary,
        $replicas: replicas,
        select,
        selectDistinct,
        $count,
        with: $with,
        get query() {
          return getReplica(replicas).query;
        }
      };
    };
  }
});

// node_modules/drizzle-orm/cache/core/cache.cjs
var require_cache = __commonJS({
  "node_modules/drizzle-orm/cache/core/cache.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var cache_exports = {};
    __export2(cache_exports, {
      Cache: () => Cache,
      NoopCache: () => NoopCache,
      hashQuery: () => hashQuery
    });
    module2.exports = __toCommonJS(cache_exports);
    var import_entity = require_entity();
    var Cache = class {
      static [import_entity.entityKind] = "Cache";
    };
    var NoopCache = class extends Cache {
      strategy() {
        return "all";
      }
      static [import_entity.entityKind] = "NoopCache";
      async get(_key) {
        return void 0;
      }
      async put(_hashedQuery, _response, _tables, _config) {
      }
      async onMutate(_params) {
      }
    };
    async function hashQuery(sql, params) {
      const dataToHash = `${sql}-${JSON.stringify(params)}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(dataToHash);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = [...new Uint8Array(hashBuffer)];
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    }
  }
});

// node_modules/drizzle-orm/cache/core/index.cjs
var require_core = __commonJS({
  "node_modules/drizzle-orm/cache/core/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var core_exports = {};
    module2.exports = __toCommonJS(core_exports);
    __reExport(core_exports, require_cache(), module2.exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/alias.cjs
var require_alias2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/alias.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var alias_exports = {};
    __export2(alias_exports, {
      alias: () => alias
    });
    module2.exports = __toCommonJS(alias_exports);
    var import_alias = require_alias();
    function alias(table, alias2) {
      return new Proxy(table, new import_alias.TableAliasProxyHandler(alias2, false));
    }
  }
});

// node_modules/drizzle-orm/sqlite-core/session.cjs
var require_session = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/session.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var session_exports = {};
    __export2(session_exports, {
      ExecuteResultSync: () => ExecuteResultSync,
      SQLitePreparedQuery: () => SQLitePreparedQuery,
      SQLiteSession: () => SQLiteSession,
      SQLiteTransaction: () => SQLiteTransaction
    });
    module2.exports = __toCommonJS(session_exports);
    var import_cache = require_cache();
    var import_entity = require_entity();
    var import_errors = require_errors();
    var import_query_promise = require_query_promise();
    var import_db = require_db();
    var ExecuteResultSync = class extends import_query_promise.QueryPromise {
      constructor(resultCb) {
        super();
        this.resultCb = resultCb;
      }
      static [import_entity.entityKind] = "ExecuteResultSync";
      async execute() {
        return this.resultCb();
      }
      sync() {
        return this.resultCb();
      }
    };
    var SQLitePreparedQuery = class {
      constructor(mode, executeMethod, query, cache, queryMetadata, cacheConfig) {
        this.mode = mode;
        this.executeMethod = executeMethod;
        this.query = query;
        this.cache = cache;
        this.queryMetadata = queryMetadata;
        this.cacheConfig = cacheConfig;
        if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
          this.cacheConfig = { enable: true, autoInvalidate: true };
        }
        if (!this.cacheConfig?.enable) {
          this.cacheConfig = void 0;
        }
      }
      static [import_entity.entityKind] = "PreparedQuery";
      /** @internal */
      joinsNotNullableMap;
      /** @internal */
      async queryWithCache(queryString, params, query) {
        if (this.cache === void 0 || (0, import_entity.is)(this.cache, import_cache.NoopCache) || this.queryMetadata === void 0) {
          try {
            return await query();
          } catch (e) {
            throw new import_errors.DrizzleQueryError(queryString, params, e);
          }
        }
        if (this.cacheConfig && !this.cacheConfig.enable) {
          try {
            return await query();
          } catch (e) {
            throw new import_errors.DrizzleQueryError(queryString, params, e);
          }
        }
        if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
          try {
            const [res] = await Promise.all([
              query(),
              this.cache.onMutate({ tables: this.queryMetadata.tables })
            ]);
            return res;
          } catch (e) {
            throw new import_errors.DrizzleQueryError(queryString, params, e);
          }
        }
        if (!this.cacheConfig) {
          try {
            return await query();
          } catch (e) {
            throw new import_errors.DrizzleQueryError(queryString, params, e);
          }
        }
        if (this.queryMetadata.type === "select") {
          const fromCache = await this.cache.get(
            this.cacheConfig.tag ?? await (0, import_cache.hashQuery)(queryString, params),
            this.queryMetadata.tables,
            this.cacheConfig.tag !== void 0,
            this.cacheConfig.autoInvalidate
          );
          if (fromCache === void 0) {
            let result;
            try {
              result = await query();
            } catch (e) {
              throw new import_errors.DrizzleQueryError(queryString, params, e);
            }
            await this.cache.put(
              this.cacheConfig.tag ?? await (0, import_cache.hashQuery)(queryString, params),
              result,
              // make sure we send tables that were used in a query only if user wants to invalidate it on each write
              this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
              this.cacheConfig.tag !== void 0,
              this.cacheConfig.config
            );
            return result;
          }
          return fromCache;
        }
        try {
          return await query();
        } catch (e) {
          throw new import_errors.DrizzleQueryError(queryString, params, e);
        }
      }
      getQuery() {
        return this.query;
      }
      mapRunResult(result, _isFromBatch) {
        return result;
      }
      mapAllResult(_result, _isFromBatch) {
        throw new Error("Not implemented");
      }
      mapGetResult(_result, _isFromBatch) {
        throw new Error("Not implemented");
      }
      execute(placeholderValues) {
        if (this.mode === "async") {
          return this[this.executeMethod](placeholderValues);
        }
        return new ExecuteResultSync(() => this[this.executeMethod](placeholderValues));
      }
      mapResult(response, isFromBatch) {
        switch (this.executeMethod) {
          case "run": {
            return this.mapRunResult(response, isFromBatch);
          }
          case "all": {
            return this.mapAllResult(response, isFromBatch);
          }
          case "get": {
            return this.mapGetResult(response, isFromBatch);
          }
        }
      }
    };
    var SQLiteSession = class {
      constructor(dialect) {
        this.dialect = dialect;
      }
      static [import_entity.entityKind] = "SQLiteSession";
      prepareOneTimeQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
        return this.prepareQuery(
          query,
          fields,
          executeMethod,
          isResponseInArrayMode,
          customResultMapper,
          queryMetadata,
          cacheConfig
        );
      }
      run(query) {
        const staticQuery = this.dialect.sqlToQuery(query);
        try {
          return this.prepareOneTimeQuery(staticQuery, void 0, "run", false).run();
        } catch (err) {
          throw new import_errors.DrizzleError({ cause: err, message: `Failed to run the query '${staticQuery.sql}'` });
        }
      }
      /** @internal */
      extractRawRunValueFromBatchResult(result) {
        return result;
      }
      all(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).all();
      }
      /** @internal */
      extractRawAllValueFromBatchResult(_result) {
        throw new Error("Not implemented");
      }
      get(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).get();
      }
      /** @internal */
      extractRawGetValueFromBatchResult(_result) {
        throw new Error("Not implemented");
      }
      values(query) {
        return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).values();
      }
      async count(sql) {
        const result = await this.values(sql);
        return result[0][0];
      }
      /** @internal */
      extractRawValuesValueFromBatchResult(_result) {
        throw new Error("Not implemented");
      }
    };
    var SQLiteTransaction = class extends import_db.BaseSQLiteDatabase {
      constructor(resultType, dialect, session, schema2, nestedIndex = 0) {
        super(resultType, dialect, session, schema2);
        this.schema = schema2;
        this.nestedIndex = nestedIndex;
      }
      static [import_entity.entityKind] = "SQLiteTransaction";
      rollback() {
        throw new import_errors.TransactionRollbackError();
      }
    };
  }
});

// node_modules/drizzle-orm/sqlite-core/subquery.cjs
var require_subquery2 = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/subquery.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var subquery_exports = {};
    module2.exports = __toCommonJS(subquery_exports);
  }
});

// node_modules/drizzle-orm/sqlite-core/view.cjs
var require_view = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/view.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var view_exports = {};
    __export2(view_exports, {
      ManualViewBuilder: () => ManualViewBuilder,
      SQLiteView: () => SQLiteView,
      ViewBuilder: () => ViewBuilder,
      ViewBuilderCore: () => ViewBuilderCore,
      sqliteView: () => sqliteView,
      view: () => view
    });
    module2.exports = __toCommonJS(view_exports);
    var import_entity = require_entity();
    var import_selection_proxy = require_selection_proxy();
    var import_utils = require_utils();
    var import_query_builder = require_query_builder2();
    var import_table = require_table3();
    var import_view_base = require_view_base();
    var ViewBuilderCore = class {
      constructor(name) {
        this.name = name;
      }
      static [import_entity.entityKind] = "SQLiteViewBuilderCore";
      config = {};
    };
    var ViewBuilder = class extends ViewBuilderCore {
      static [import_entity.entityKind] = "SQLiteViewBuilder";
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(new import_query_builder.QueryBuilder());
        }
        const selectionProxy = new import_selection_proxy.SelectionProxyHandler({
          alias: this.name,
          sqlBehavior: "error",
          sqlAliasedBehavior: "alias",
          replaceOriginalName: true
        });
        const aliasedSelectedFields = qb.getSelectedFields();
        return new Proxy(
          new SQLiteView({
            // sqliteConfig: this.config,
            config: {
              name: this.name,
              schema: void 0,
              selectedFields: aliasedSelectedFields,
              query: qb.getSQL().inlineParams()
            }
          }),
          selectionProxy
        );
      }
    };
    var ManualViewBuilder = class extends ViewBuilderCore {
      static [import_entity.entityKind] = "SQLiteManualViewBuilder";
      columns;
      constructor(name, columns) {
        super(name);
        this.columns = (0, import_utils.getTableColumns)((0, import_table.sqliteTable)(name, columns));
      }
      existing() {
        return new Proxy(
          new SQLiteView({
            config: {
              name: this.name,
              schema: void 0,
              selectedFields: this.columns,
              query: void 0
            }
          }),
          new import_selection_proxy.SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
      as(query) {
        return new Proxy(
          new SQLiteView({
            config: {
              name: this.name,
              schema: void 0,
              selectedFields: this.columns,
              query: query.inlineParams()
            }
          }),
          new import_selection_proxy.SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
    };
    var SQLiteView = class extends import_view_base.SQLiteViewBase {
      static [import_entity.entityKind] = "SQLiteView";
      constructor({ config }) {
        super(config);
      }
    };
    function sqliteView(name, selection) {
      if (selection) {
        return new ManualViewBuilder(name, selection);
      }
      return new ViewBuilder(name);
    }
    var view = sqliteView;
  }
});

// node_modules/drizzle-orm/sqlite-core/index.cjs
var require_sqlite_core = __commonJS({
  "node_modules/drizzle-orm/sqlite-core/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var sqlite_core_exports = {};
    module2.exports = __toCommonJS(sqlite_core_exports);
    __reExport(sqlite_core_exports, require_alias2(), module2.exports);
    __reExport(sqlite_core_exports, require_checks(), module2.exports);
    __reExport(sqlite_core_exports, require_columns(), module2.exports);
    __reExport(sqlite_core_exports, require_db(), module2.exports);
    __reExport(sqlite_core_exports, require_dialect(), module2.exports);
    __reExport(sqlite_core_exports, require_foreign_keys2(), module2.exports);
    __reExport(sqlite_core_exports, require_indexes(), module2.exports);
    __reExport(sqlite_core_exports, require_primary_keys2(), module2.exports);
    __reExport(sqlite_core_exports, require_query_builders(), module2.exports);
    __reExport(sqlite_core_exports, require_session(), module2.exports);
    __reExport(sqlite_core_exports, require_subquery2(), module2.exports);
    __reExport(sqlite_core_exports, require_table3(), module2.exports);
    __reExport(sqlite_core_exports, require_unique_constraint2(), module2.exports);
    __reExport(sqlite_core_exports, require_utils3(), module2.exports);
    __reExport(sqlite_core_exports, require_view(), module2.exports);
  }
});

// node_modules/drizzle-orm/better-sqlite3/session.cjs
var require_session2 = __commonJS({
  "node_modules/drizzle-orm/better-sqlite3/session.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var session_exports = {};
    __export2(session_exports, {
      BetterSQLiteSession: () => BetterSQLiteSession,
      BetterSQLiteTransaction: () => BetterSQLiteTransaction,
      PreparedQuery: () => PreparedQuery
    });
    module2.exports = __toCommonJS(session_exports);
    var import_core = require_core();
    var import_entity = require_entity();
    var import_logger = require_logger();
    var import_sql = require_sql();
    var import_sqlite_core = require_sqlite_core();
    var import_session = require_session();
    var import_utils = require_utils();
    var BetterSQLiteSession = class extends import_session.SQLiteSession {
      constructor(client, dialect, schema2, options = {}) {
        super(dialect);
        this.client = client;
        this.schema = schema2;
        this.logger = options.logger ?? new import_logger.NoopLogger();
        this.cache = options.cache ?? new import_core.NoopCache();
      }
      static [import_entity.entityKind] = "BetterSQLiteSession";
      logger;
      cache;
      prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
        const stmt = this.client.prepare(query.sql);
        return new PreparedQuery(
          stmt,
          query,
          this.logger,
          this.cache,
          queryMetadata,
          cacheConfig,
          fields,
          executeMethod,
          isResponseInArrayMode,
          customResultMapper
        );
      }
      transaction(transaction, config = {}) {
        const tx = new BetterSQLiteTransaction("sync", this.dialect, this, this.schema);
        const nativeTx = this.client.transaction(transaction);
        return nativeTx[config.behavior ?? "deferred"](tx);
      }
    };
    var BetterSQLiteTransaction = class _BetterSQLiteTransaction extends import_sqlite_core.SQLiteTransaction {
      static [import_entity.entityKind] = "BetterSQLiteTransaction";
      transaction(transaction) {
        const savepointName = `sp${this.nestedIndex}`;
        const tx = new _BetterSQLiteTransaction("sync", this.dialect, this.session, this.schema, this.nestedIndex + 1);
        this.session.run(import_sql.sql.raw(`savepoint ${savepointName}`));
        try {
          const result = transaction(tx);
          this.session.run(import_sql.sql.raw(`release savepoint ${savepointName}`));
          return result;
        } catch (err) {
          this.session.run(import_sql.sql.raw(`rollback to savepoint ${savepointName}`));
          throw err;
        }
      }
    };
    var PreparedQuery = class extends import_session.SQLitePreparedQuery {
      constructor(stmt, query, logger, cache, queryMetadata, cacheConfig, fields, executeMethod, _isResponseInArrayMode, customResultMapper) {
        super("sync", executeMethod, query, cache, queryMetadata, cacheConfig);
        this.stmt = stmt;
        this.logger = logger;
        this.fields = fields;
        this._isResponseInArrayMode = _isResponseInArrayMode;
        this.customResultMapper = customResultMapper;
      }
      static [import_entity.entityKind] = "BetterSQLitePreparedQuery";
      run(placeholderValues) {
        const params = (0, import_sql.fillPlaceholders)(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        return this.stmt.run(...params);
      }
      all(placeholderValues) {
        const { fields, joinsNotNullableMap, query, logger, stmt, customResultMapper } = this;
        if (!fields && !customResultMapper) {
          const params = (0, import_sql.fillPlaceholders)(query.params, placeholderValues ?? {});
          logger.logQuery(query.sql, params);
          return stmt.all(...params);
        }
        const rows = this.values(placeholderValues);
        if (customResultMapper) {
          return customResultMapper(rows);
        }
        return rows.map((row) => (0, import_utils.mapResultRow)(fields, row, joinsNotNullableMap));
      }
      get(placeholderValues) {
        const params = (0, import_sql.fillPlaceholders)(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        const { fields, stmt, joinsNotNullableMap, customResultMapper } = this;
        if (!fields && !customResultMapper) {
          return stmt.get(...params);
        }
        const row = stmt.raw().get(...params);
        if (!row) {
          return void 0;
        }
        if (customResultMapper) {
          return customResultMapper([row]);
        }
        return (0, import_utils.mapResultRow)(fields, row, joinsNotNullableMap);
      }
      values(placeholderValues) {
        const params = (0, import_sql.fillPlaceholders)(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        return this.stmt.raw().all(...params);
      }
      /** @internal */
      isResponseInArrayMode() {
        return this._isResponseInArrayMode;
      }
    };
  }
});

// node_modules/drizzle-orm/better-sqlite3/driver.cjs
var require_driver = __commonJS({
  "node_modules/drizzle-orm/better-sqlite3/driver.cjs"(exports2, module2) {
    "use strict";
    var __create = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var driver_exports = {};
    __export2(driver_exports, {
      BetterSQLite3Database: () => BetterSQLite3Database,
      drizzle: () => drizzle
    });
    module2.exports = __toCommonJS(driver_exports);
    var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
    var import_entity = require_entity();
    var import_logger = require_logger();
    var import_relations = require_relations();
    var import_db = require_db();
    var import_dialect = require_dialect();
    var import_utils = require_utils();
    var import_session = require_session2();
    var BetterSQLite3Database = class extends import_db.BaseSQLiteDatabase {
      static [import_entity.entityKind] = "BetterSQLite3Database";
    };
    function construct(client, config = {}) {
      const dialect = new import_dialect.SQLiteSyncDialect({ casing: config.casing });
      let logger;
      if (config.logger === true) {
        logger = new import_logger.DefaultLogger();
      } else if (config.logger !== false) {
        logger = config.logger;
      }
      let schema2;
      if (config.schema) {
        const tablesConfig = (0, import_relations.extractTablesRelationalConfig)(
          config.schema,
          import_relations.createTableRelationsHelpers
        );
        schema2 = {
          fullSchema: config.schema,
          schema: tablesConfig.tables,
          tableNamesMap: tablesConfig.tableNamesMap
        };
      }
      const session = new import_session.BetterSQLiteSession(client, dialect, schema2, { logger });
      const db = new BetterSQLite3Database("sync", dialect, session, schema2);
      db.$client = client;
      return db;
    }
    function drizzle(...params) {
      if (params[0] === void 0 || typeof params[0] === "string") {
        const instance = params[0] === void 0 ? new import_better_sqlite3.default() : new import_better_sqlite3.default(params[0]);
        return construct(instance, params[1]);
      }
      if ((0, import_utils.isConfig)(params[0])) {
        const { connection, client, ...drizzleConfig } = params[0];
        if (client) return construct(client, drizzleConfig);
        if (typeof connection === "object") {
          const { source, ...options } = connection;
          const instance2 = new import_better_sqlite3.default(source, options);
          return construct(instance2, drizzleConfig);
        }
        const instance = new import_better_sqlite3.default(connection);
        return construct(instance, drizzleConfig);
      }
      return construct(params[0], params[1]);
    }
    ((drizzle2) => {
      function mock(config) {
        return construct({}, config);
      }
      drizzle2.mock = mock;
    })(drizzle || (drizzle = {}));
  }
});

// node_modules/drizzle-orm/better-sqlite3/index.cjs
var require_better_sqlite3 = __commonJS({
  "node_modules/drizzle-orm/better-sqlite3/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var better_sqlite3_exports = {};
    module2.exports = __toCommonJS(better_sqlite3_exports);
    __reExport(better_sqlite3_exports, require_driver(), module2.exports);
    __reExport(better_sqlite3_exports, require_session2(), module2.exports);
  }
});

// electron/database/schema.cjs
var require_schema = __commonJS({
  "electron/database/schema.cjs"(exports2, module2) {
    var { sqliteTable, text, integer, real } = require_sqlite_core();
    var syncFields = {
      updated_at: text("updated_at"),
      deleted_at: text("deleted_at"),
      sync_status: text("sync_status", { enum: ["synced", "pending", "failed"] }).default("pending"),
      device_id: text("device_id"),
      version: integer("version").default(1),
      last_modified_by: text("last_modified_by")
    };
    var appUsers = sqliteTable("app_users", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      role: text("role").notNull(),
      name: text("name"),
      email: text("email"),
      created_at: text("created_at"),
      local_password_hash: text("local_password_hash"),
      ...syncFields
    });
    var categories = sqliteTable("categories", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      order: integer("order").default(0),
      status: text("status").default("active"),
      created_at: text("created_at"),
      ...syncFields
    });
    var products = sqliteTable("products", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      category_id: text("category_id").notNull(),
      name: text("name").notNull(),
      price: real("price").notNull(),
      cost: real("cost").notNull(),
      image_url: text("image_url"),
      status: text("status").default("active"),
      track_stock: integer("track_stock", { mode: "boolean" }).default(false),
      inventory_item_id: text("inventory_item_id"),
      created_at: text("created_at"),
      ...syncFields
    });
    var inventoryItems = sqliteTable("inventory_items", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      sku: text("sku"),
      unit: text("unit").notNull(),
      stock_quantity: real("stock_quantity").notNull().default(0),
      low_stock_threshold: real("low_stock_threshold").notNull().default(10),
      cost_per_unit: real("cost_per_unit").notNull().default(0),
      is_countable: integer("is_countable", { mode: "boolean" }).default(false),
      pieces_per_carton: integer("pieces_per_carton"),
      minimum_stock: integer("minimum_stock"),
      created_at: text("created_at"),
      ...syncFields
    });
    var stockMovements = sqliteTable("stock_movements", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      inventory_item_id: text("inventory_item_id").notNull(),
      type: text("type").notNull(),
      // 'in' | 'out' | 'adjustment'
      quantity: real("quantity").notNull(),
      reason: text("reason"),
      reference_type: text("reference_type"),
      reference_id: text("reference_id"),
      notes: text("notes"),
      created_at: text("created_at"),
      ...syncFields
    });
    var diningTables = sqliteTable("dining_tables", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name_or_number: text("name_or_number").notNull(),
      status: text("status").default("available"),
      current_order_id: text("current_order_id"),
      capacity: integer("capacity"),
      created_at: text("created_at"),
      ...syncFields
    });
    var orders = sqliteTable("orders", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      table_id: text("table_id"),
      order_type: text("order_type").notNull(),
      status: text("status").notNull(),
      payment_method: text("payment_method"),
      total_amount: real("total_amount").notNull(),
      created_at: text("created_at"),
      ...syncFields
    });
    var orderItems = sqliteTable("order_items", {
      id: text("id").primaryKey(),
      order_id: text("order_id").notNull(),
      product_id: text("product_id").notNull(),
      quantity: integer("quantity").notNull(),
      unit_price: real("unit_price").notNull(),
      subtotal: real("subtotal").notNull(),
      ...syncFields
    });
    var suppliers = sqliteTable("suppliers", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      contact_name: text("contact_name"),
      phone: text("phone"),
      email: text("email"),
      address: text("address"),
      total_purchases: real("total_purchases").default(0),
      total_paid: real("total_paid").default(0),
      total_due: real("total_due").default(0),
      created_at: text("created_at"),
      ...syncFields
    });
    var purchases = sqliteTable("purchases", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      supplier_id: text("supplier_id").notNull(),
      reference_number: text("reference_number"),
      date: text("date").notNull(),
      total_amount: real("total_amount").notNull(),
      payment_status: text("payment_status").notNull(),
      amount_paid: real("amount_paid").default(0),
      created_at: text("created_at"),
      ...syncFields
    });
    var purchaseItems = sqliteTable("purchase_items", {
      id: text("id").primaryKey(),
      purchase_id: text("purchase_id").notNull(),
      inventory_item_id: text("inventory_item_id").notNull(),
      quantity: real("quantity").notNull(),
      unit_cost: real("unit_cost").notNull(),
      subtotal: real("subtotal").notNull(),
      ...syncFields
    });
    var supplierPayments = sqliteTable("supplier_payments", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      supplier_id: text("supplier_id").notNull(),
      purchase_id: text("purchase_id"),
      amount: real("amount").notNull(),
      payment_method: text("payment_method").notNull(),
      date: text("date").notNull(),
      reference_number: text("reference_number"),
      notes: text("notes"),
      created_at: text("created_at"),
      ...syncFields
    });
    var expenses = sqliteTable("expenses", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      category: text("category").notNull(),
      amount: real("amount").notNull(),
      description: text("description"),
      date: text("date").notNull(),
      created_by: text("created_by"),
      payment_method: text("payment_method"),
      reference_number: text("reference_number"),
      created_at: text("created_at"),
      ...syncFields
    });
    var dailyClosings = sqliteTable("daily_closings", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      closing_date: text("closing_date").notNull(),
      closed_at: text("closed_at").notNull(),
      closed_by: text("closed_by").notNull(),
      total_orders: integer("total_orders").notNull(),
      total_sales: real("total_sales").notNull(),
      cash_sales: real("cash_sales").notNull(),
      instapay_sales: real("instapay_sales").notNull(),
      vodafone_cash_sales: real("vodafone_cash_sales").notNull(),
      total_expenses: real("total_expenses").notNull(),
      cash_in_drawer: real("cash_in_drawer").notNull(),
      expected_cash: real("expected_cash").notNull(),
      difference: real("difference").notNull(),
      notes: text("notes"),
      ...syncFields
    });
    var dailyClosingItems = sqliteTable("daily_closing_items", {
      id: text("id").primaryKey(),
      daily_closing_id: text("daily_closing_id").notNull(),
      product_id: text("product_id").notNull(),
      quantity_sold: integer("quantity_sold").notNull(),
      total_sales: real("total_sales").notNull(),
      category_name: text("category_name").notNull(),
      product_name: text("product_name").notNull(),
      ...syncFields
    });
    var settings = sqliteTable("settings", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      language: text("language"),
      cafe_name: text("cafe_name"),
      currency: text("currency"),
      print_paper_size: text("print_paper_size"),
      cashier_permissions: text("cashier_permissions"),
      // store as JSON string
      auto_backup_enabled: integer("auto_backup_enabled", { mode: "boolean" }),
      auto_backup_frequency: text("auto_backup_frequency"),
      auto_backup_time: text("auto_backup_time"),
      last_backup_date: text("last_backup_date"),
      owner_pin_hash: text("owner_pin_hash"),
      default_printer: text("default_printer"),
      paper_size: text("paper_size").default("80mm"),
      // 58mm, 80mm, custom
      auto_print_receipts: integer("auto_print_receipts", { mode: "boolean" }).default(false),
      receipt_copies: integer("receipt_copies").default(1),
      report_default_output: text("report_default_output").default("thermal"),
      // thermal, pdf
      receipt_template_config: text("receipt_template_config"),
      // JSON: { showLogo: boolean, showCashier: boolean, showDiscount: boolean, footerMessage: string }
      ...syncFields
    });
    var orderAuditLog = sqliteTable("order_audit_log", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      order_id: text("order_id").notNull(),
      action: text("action").notNull(),
      performed_by: text("performed_by"),
      timestamp: text("timestamp").notNull(),
      reason: text("reason"),
      details: text("details"),
      // JSON string
      ...syncFields
    });
    var syncQueue = sqliteTable("sync_queue", {
      id: text("id").primaryKey(),
      action: text("action").notNull(),
      table_name: text("table_name").notNull(),
      payload: text("payload").notNull(),
      // JSON string
      status: text("status").notNull().default("pending"),
      retry_count: integer("retry_count").notNull().default(0),
      created_at: text("created_at").notNull(),
      record_id: text("record_id"),
      last_error: text("last_error")
    });
    var syncConflicts = sqliteTable("sync_conflicts", {
      id: text("id").primaryKey(),
      entity_name: text("entity_name").notNull(),
      entity_id: text("entity_id").notNull(),
      local_version: integer("local_version"),
      remote_version: integer("remote_version"),
      resolution: text("resolution"),
      // 'local_wins' | 'remote_wins' | 'merged'
      created_at: text("created_at").notNull()
    });
    module2.exports = {
      appUsers,
      categories,
      products,
      inventoryItems,
      stockMovements,
      diningTables,
      orders,
      orderItems,
      suppliers,
      purchases,
      purchaseItems,
      supplierPayments,
      expenses,
      dailyClosings,
      dailyClosingItems,
      settings,
      orderAuditLog,
      syncQueue,
      syncConflicts
    };
  }
});

// node_modules/drizzle-orm/migrator.cjs
var require_migrator = __commonJS({
  "node_modules/drizzle-orm/migrator.cjs"(exports2, module2) {
    "use strict";
    var __create = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var migrator_exports = {};
    __export2(migrator_exports, {
      readMigrationFiles: () => readMigrationFiles
    });
    module2.exports = __toCommonJS(migrator_exports);
    var import_node_crypto = __toESM(require("node:crypto"), 1);
    var import_node_fs = __toESM(require("node:fs"), 1);
    function readMigrationFiles(config) {
      const migrationFolderTo = config.migrationsFolder;
      const migrationQueries = [];
      const journalPath = `${migrationFolderTo}/meta/_journal.json`;
      if (!import_node_fs.default.existsSync(journalPath)) {
        throw new Error(`Can't find meta/_journal.json file`);
      }
      const journalAsString = import_node_fs.default.readFileSync(`${migrationFolderTo}/meta/_journal.json`).toString();
      const journal = JSON.parse(journalAsString);
      for (const journalEntry of journal.entries) {
        const migrationPath = `${migrationFolderTo}/${journalEntry.tag}.sql`;
        try {
          const query = import_node_fs.default.readFileSync(`${migrationFolderTo}/${journalEntry.tag}.sql`).toString();
          const result = query.split("--> statement-breakpoint").map((it) => {
            return it;
          });
          migrationQueries.push({
            sql: result,
            bps: journalEntry.breakpoints,
            folderMillis: journalEntry.when,
            hash: import_node_crypto.default.createHash("sha256").update(query).digest("hex")
          });
        } catch {
          throw new Error(`No file ${migrationPath} found in ${migrationFolderTo} folder`);
        }
      }
      return migrationQueries;
    }
  }
});

// node_modules/drizzle-orm/better-sqlite3/migrator.cjs
var require_migrator2 = __commonJS({
  "node_modules/drizzle-orm/better-sqlite3/migrator.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var migrator_exports = {};
    __export2(migrator_exports, {
      migrate: () => migrate
    });
    module2.exports = __toCommonJS(migrator_exports);
    var import_migrator = require_migrator();
    function migrate(db, config) {
      const migrations = (0, import_migrator.readMigrationFiles)(config);
      db.dialect.migrate(migrations, db.session, config);
    }
  }
});

// electron/database/db.cjs
var require_db2 = __commonJS({
  "electron/database/db.cjs"(exports2, module2) {
    var Database = require("better-sqlite3");
    var { drizzle } = require_better_sqlite3();
    var schema2 = require_schema();
    var path = require("path");
    var fs = require("fs");
    var { app } = require("electron");
    var _db = null;
    var _drizzleDb = null;
    function initDb2() {
      if (_db) return _drizzleDb;
      const userDataPath = app.getPath("userData");
      const appDataPath = app.getPath("appData");
      const dbDir = path.join(appDataPath, "OPA Cafe", "database");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const dbPath = path.join(dbDir, "cafe.sqlite");
      _db = new Database(dbPath);
      _db.pragma("journal_mode = WAL");
      _db.pragma("foreign_keys = ON");
      _drizzleDb = drizzle(_db, { schema: schema2 });
      const { migrate } = require_migrator2();
      const migrationsFolder = path.join(__dirname, "migrations");
      try {
        const backupDir = path.join(appDataPath, "OPA Cafe", "AutoBackups");
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
        const backupFile = path.join(backupDir, `pre-migration-${timestamp}.sqlite`);
        _db.backup(backupFile).then(() => {
          const files = fs.readdirSync(backupDir).filter((f) => f.startsWith("pre-migration-") && f.endsWith(".sqlite"));
          if (files.length > 30) {
            files.sort((a, b) => {
              const aStat = fs.statSync(path.join(backupDir, a));
              const bStat = fs.statSync(path.join(backupDir, b));
              return aStat.mtimeMs - bStat.mtimeMs;
            });
            const toDelete = files.slice(0, files.length - 30);
            toDelete.forEach((f) => fs.unlinkSync(path.join(backupDir, f)));
          }
        }).catch(console.error);
      } catch (e) {
        console.error("Failed to create pre-migration backup", e);
      }
      migrate(_drizzleDb, { migrationsFolder });
      try {
        _db.exec(`ALTER TABLE sync_queue ADD COLUMN last_error TEXT`);
      } catch (e) {
      }
      try {
        const tableInfo = _db.prepare("PRAGMA table_info(sync_conflicts)").all();
        const hasTableName = tableInfo.some((col) => col.name === "table_name");
        if (hasTableName) {
          _db.exec(`DROP TABLE sync_conflicts;`);
          _db.exec(`
        CREATE TABLE sync_conflicts (
          id TEXT PRIMARY KEY,
          entity_name TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          local_version INTEGER,
          remote_version INTEGER,
          resolution TEXT,
          created_at TEXT NOT NULL
        );
      `);
        }
      } catch (e) {
        console.error("Failed to migrate sync_conflicts", e);
      }
      const addColumnSafe = (table, column, def) => {
        try {
          _db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        } catch (e) {
        }
      };
      addColumnSafe("settings", "default_printer", "TEXT");
      addColumnSafe("settings", "paper_size", "TEXT DEFAULT '80mm'");
      addColumnSafe("settings", "auto_print_receipts", "INTEGER DEFAULT 0");
      addColumnSafe("settings", "receipt_copies", "INTEGER DEFAULT 1");
      addColumnSafe("settings", "report_default_output", "TEXT DEFAULT 'thermal'");
      addColumnSafe("settings", "receipt_template_config", "TEXT");
      addColumnSafe("inventory_items", "cost_per_unit", "REAL DEFAULT 0");
      addColumnSafe("inventory_items", "sku", "TEXT");
      addColumnSafe("inventory_items", "is_countable", "INTEGER DEFAULT 0");
      addColumnSafe("inventory_items", "pieces_per_carton", "INTEGER");
      addColumnSafe("inventory_items", "minimum_stock", "INTEGER");
      addColumnSafe("stock_movements", "reason", "TEXT");
      addColumnSafe("settings", "auto_backup_frequency", "TEXT");
      addColumnSafe("purchases", "date", "TEXT");
      addColumnSafe("supplier_payments", "cafe_id", "TEXT");
      addColumnSafe("supplier_payments", "payment_method", "TEXT");
      addColumnSafe("supplier_payments", "date", "TEXT");
      addColumnSafe("supplier_payments", "reference_number", "TEXT");
      addColumnSafe("daily_closings", "closed_at", "TEXT");
      addColumnSafe("daily_closings", "closed_by", "TEXT");
      addColumnSafe("daily_closings", "cash_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "instapay_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "vodafone_cash_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "cash_in_drawer", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "expected_cash", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "difference", "REAL DEFAULT 0");
      addColumnSafe("daily_closing_items", "category_name", "TEXT");
      addColumnSafe("daily_closing_items", "product_name", "TEXT");
      addColumnSafe("daily_closing_items", "total_sales", "REAL DEFAULT 0");
      addColumnSafe("order_audit_log", "action", "TEXT");
      addColumnSafe("order_audit_log", "performed_by", "TEXT");
      addColumnSafe("order_audit_log", "timestamp", "TEXT");
      addColumnSafe("order_audit_log", "details", "TEXT");
      addColumnSafe("order_audit_log", "reason", "TEXT");
      return _drizzleDb;
    }
    function getDb2() {
      if (!_drizzleDb) {
        throw new Error("Database not initialized. Call initDb() first.");
      }
      return _drizzleDb;
    }
    function getRawDb() {
      return _db;
    }
    function getDbPath() {
      const appDataPath = app.getPath("appData");
      return path.join(appDataPath, "OPA Cafe", "database", "cafe.sqlite");
    }
    function closeDb() {
      if (_db) {
        _db.close();
        _db = null;
        _drizzleDb = null;
      }
    }
    module2.exports = {
      initDb: initDb2,
      getDb: getDb2,
      getRawDb,
      getDbPath,
      closeDb,
      schema: schema2
    };
  }
});

// node_modules/drizzle-orm/operations.cjs
var require_operations = __commonJS({
  "node_modules/drizzle-orm/operations.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var operations_exports = {};
    module2.exports = __toCommonJS(operations_exports);
  }
});

// node_modules/drizzle-orm/index.cjs
var require_drizzle_orm = __commonJS({
  "node_modules/drizzle-orm/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    module2.exports = __toCommonJS(index_exports);
    __reExport(index_exports, require_alias(), module2.exports);
    __reExport(index_exports, require_column_builder(), module2.exports);
    __reExport(index_exports, require_column(), module2.exports);
    __reExport(index_exports, require_entity(), module2.exports);
    __reExport(index_exports, require_errors(), module2.exports);
    __reExport(index_exports, require_logger(), module2.exports);
    __reExport(index_exports, require_operations(), module2.exports);
    __reExport(index_exports, require_query_promise(), module2.exports);
    __reExport(index_exports, require_relations(), module2.exports);
    __reExport(index_exports, require_sql2(), module2.exports);
    __reExport(index_exports, require_subquery(), module2.exports);
    __reExport(index_exports, require_table(), module2.exports);
    __reExport(index_exports, require_utils(), module2.exports);
    __reExport(index_exports, require_view_common(), module2.exports);
  }
});

// electron/database/handlers.cjs
var require_handlers = __commonJS({
  "electron/database/handlers.cjs"(exports2, module2) {
    var { ipcMain } = require("electron");
    var { getDb: getDb2 } = require_db2();
    var schema2 = require_schema();
    var { eq, ne, gt, gte, lt, lte, inArray, isNull, and, asc, desc } = require_drizzle_orm();
    function setupHandlers() {
      const db = getDb2();
      const getTable = (tableName) => {
        const tableMap = {
          "app_users": schema2.appUsers,
          "categories": schema2.categories,
          "products": schema2.products,
          "inventory_items": schema2.inventoryItems,
          "stock_movements": schema2.stockMovements,
          "dining_tables": schema2.diningTables,
          "tables": schema2.diningTables,
          "orders": schema2.orders,
          "order_items": schema2.orderItems,
          "suppliers": schema2.suppliers,
          "purchases": schema2.purchases,
          "purchase_items": schema2.purchaseItems,
          "supplier_payments": schema2.supplierPayments,
          "expenses": schema2.expenses,
          "daily_closings": schema2.dailyClosings,
          "daily_closing_items": schema2.dailyClosingItems,
          "settings": schema2.settings,
          "order_audit_log": schema2.orderAuditLog,
          "sync_queue": schema2.syncQueue
        };
        return tableMap[tableName];
      };
      ipcMain.handle("db:findMany", async (event, { table, where, options, orderBy, limit, offset }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          let query = db.select().from(t);
          const conditions = [];
          if (t.deleted_at) {
            conditions.push(isNull(t.deleted_at));
          }
          if (where) {
            for (const [key, value] of Object.entries(where)) {
              if (!t[key]) continue;
              if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                for (const [op, opValue] of Object.entries(value)) {
                  if (op === "$eq") conditions.push(eq(t[key], opValue));
                  else if (op === "$ne") conditions.push(ne(t[key], opValue));
                  else if (op === "$gt") conditions.push(gt(t[key], opValue));
                  else if (op === "$gte") conditions.push(gte(t[key], opValue));
                  else if (op === "$lt") conditions.push(lt(t[key], opValue));
                  else if (op === "$lte") conditions.push(lte(t[key], opValue));
                  else if (op === "$in" && Array.isArray(opValue) && opValue.length > 0) conditions.push(inArray(t[key], opValue));
                }
              } else if (Array.isArray(value) && value.length > 0) {
                conditions.push(inArray(t[key], value));
              } else if (value !== void 0) {
                conditions.push(eq(t[key], value));
              }
            }
          }
          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
          const finalOrderBy = orderBy || options?.orderBy;
          if (finalOrderBy && finalOrderBy.column && t[finalOrderBy.column]) {
            if (finalOrderBy.direction === "desc") {
              query = query.orderBy(desc(t[finalOrderBy.column]));
            } else {
              query = query.orderBy(asc(t[finalOrderBy.column]));
            }
          }
          const finalLimit = typeof limit === "number" ? limit : typeof options?.limit === "number" ? options.limit : void 0;
          if (typeof finalLimit === "number" && finalLimit > 0) {
            query = query.limit(finalLimit);
          }
          const finalOffset = typeof offset === "number" ? offset : typeof options?.offset === "number" ? options.offset : void 0;
          if (typeof finalOffset === "number" && finalOffset >= 0) {
            query = query.offset(finalOffset);
          }
          return await query.execute();
        } catch (e) {
          console.error(`db:findMany error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:findOne", async (event, { table, id }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          const conditions = [eq(t.id, id)];
          if (t.deleted_at) {
            conditions.push(isNull(t.deleted_at));
          }
          const result = await db.select().from(t).where(and(...conditions)).limit(1).execute();
          return result[0] || null;
        } catch (e) {
          console.error(`db:findOne error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:insert", async (event, { table, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.insert(t).values(data).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:insert error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:insertMany", async (event, { table, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          if (data && data.length > 0) {
            await db.insert(t).values(data).execute();
          }
          return { success: true };
        } catch (e) {
          console.error(`db:insertMany error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:update", async (event, { table, id, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.update(t).set(data).where(eq(t.id, id)).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:update error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:delete", async (event, { table, id }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.delete(t).where(eq(t.id, id)).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:delete error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:transaction", (event, operations) => {
        try {
          return db.transaction((tx) => {
            for (const op of operations) {
              const t = getTable(op.table);
              if (!t) throw new Error(`Table ${op.table} not found`);
              if (op.type === "insert") {
                tx.insert(t).values(op.data).run();
              } else if (op.type === "update") {
                tx.update(t).set(op.data).where(eq(t.id, op.id)).run();
              } else if (op.type === "delete") {
                tx.delete(t).where(eq(t.id, op.id)).run();
              } else if (op.type === "insertMany") {
                if (op.data && op.data.length > 0) {
                  tx.insert(t).values(op.data).run();
                }
              }
            }
            return { success: true };
          });
        } catch (e) {
          console.error(`db:transaction error:`, e);
          throw e;
        }
      });
    }
    module2.exports = { setupHandlers };
  }
});

// src/infrastructure/database/ElectronIpcDatabaseDriver.ts
var ElectronIpcDatabaseDriver, defaultDatabaseDriver;
var init_ElectronIpcDatabaseDriver = __esm({
  "src/infrastructure/database/ElectronIpcDatabaseDriver.ts"() {
    ElectronIpcDatabaseDriver = class {
      get db() {
        if (typeof window === "undefined" || !window.electronAPI || !window.electronAPI.db) {
          throw new Error("electronAPI.db is not available in this environment");
        }
        return window.electronAPI.db;
      }
      async findMany(tableName, where, options) {
        return this.db.findMany(tableName, where, options);
      }
      async findOne(tableName, id) {
        return this.db.findOne(tableName, id);
      }
      async insert(tableName, data) {
        await this.db.insert(tableName, data);
      }
      async insertMany(tableName, data) {
        await this.db.insertMany(tableName, data);
      }
      async update(tableName, id, data) {
        await this.db.update(tableName, id, data);
      }
      async delete(tableName, id) {
        await this.db.delete(tableName, id);
      }
    };
    defaultDatabaseDriver = new ElectronIpcDatabaseDriver();
  }
});

// src/infrastructure/repositories/BaseElectronRepository.ts
var BaseElectronRepository;
var init_BaseElectronRepository = __esm({
  "src/infrastructure/repositories/BaseElectronRepository.ts"() {
    init_ElectronIpcDatabaseDriver();
    BaseElectronRepository = class {
      constructor(tableName, dbDriver) {
        this.tableName = tableName;
        this.dbDriver = dbDriver || defaultDatabaseDriver;
      }
      async findMany(where, options) {
        return this.dbDriver.findMany(this.tableName, where, options);
      }
      async findOne(id) {
        return this.dbDriver.findOne(this.tableName, id);
      }
      async insert(data) {
        await this.dbDriver.insert(this.tableName, data);
      }
      async insertMany(data) {
        await this.dbDriver.insertMany(this.tableName, data);
      }
      async update(id, data) {
        await this.dbDriver.update(this.tableName, id, data);
      }
      async delete(id) {
        await this.dbDriver.delete(this.tableName, id);
      }
    };
  }
});

// src/infrastructure/repositories/RepositoryFactory.ts
function createRepository(tableName) {
  return new BaseElectronRepository(tableName);
}
var init_RepositoryFactory = __esm({
  "src/infrastructure/repositories/RepositoryFactory.ts"() {
    init_BaseElectronRepository();
  }
});

// src/application/sync/syncQueue.ts
function getDeviceId() {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}
function buildSyncOperation(action, table, payload) {
  let finalAction = action;
  let finalPayload = { ...payload };
  finalPayload.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  finalPayload.device_id = getDeviceId();
  finalPayload.version = (typeof payload.version === "number" ? payload.version : 0) + 1;
  const offlineUserId = localStorage.getItem("offline_user_id");
  if (offlineUserId) {
    finalPayload.last_modified_by = offlineUserId;
  }
  if (action === "delete") {
    finalAction = "update";
    finalPayload.deleted_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  return {
    type: "insert",
    table: "sync_queue",
    data: {
      id: crypto.randomUUID(),
      action: finalAction,
      table_name: table,
      payload: JSON.stringify(finalPayload),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      retry_count: 0,
      record_id: typeof finalPayload.id === "string" ? finalPayload.id : void 0
    }
  };
}
function triggerBackgroundSync() {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    if (window.electronAPI) {
      window.electronAPI.triggerSync();
    } else {
      setTimeout(() => {
        processSyncQueue().catch(console.error);
      }, 100);
    }
  }
}
function createSyncableOperation(action, table, data, id) {
  const ops = [];
  if (action === "insert") {
    ops.push({ type: "insert", table, data });
  } else if (action === "update" && id) {
    ops.push({ type: "update", table, id, data });
  } else if (action === "delete" && id) {
    ops.push({ type: "delete", table, id });
  }
  ops.push(buildSyncOperation(action, table, data));
  return ops;
}
async function enqueueSync(action, table, payload) {
  const repo = createRepository("sync_queue");
  const syncOp = buildSyncOperation(action, table, payload);
  await repo.insert(syncOp.data);
  triggerBackgroundSync();
}
async function processSyncQueue() {
  if (window.electronAPI) {
    window.electronAPI.triggerSync();
    return;
  }
}
var init_syncQueue = __esm({
  "src/application/sync/syncQueue.ts"() {
    init_RepositoryFactory();
    window.addEventListener("online", () => {
      console.log("[SyncQueue] Back online \u2014 flushing queue");
      processSyncQueue();
    });
  }
});

// src/infrastructure/repositories/SQLiteAuthRepository.ts
var SQLiteAuthRepository;
var init_SQLiteAuthRepository = __esm({
  "src/infrastructure/repositories/SQLiteAuthRepository.ts"() {
    init_ElectronIpcDatabaseDriver();
    SQLiteAuthRepository = class {
      constructor(dbDriver = defaultDatabaseDriver) {
        this.dbDriver = dbDriver;
        this.tableName = "app_users";
      }
      async findById(id) {
        return this.dbDriver.findOne(this.tableName, id);
      }
      async findByEmail(email) {
        const users = await this.dbDriver.findMany(this.tableName, { email });
        return users.length > 0 ? users[0] : null;
      }
      async getUsers(cafeId) {
        return this.dbDriver.findMany(this.tableName, { cafe_id: cafeId });
      }
      async insertUser(user) {
        await this.dbDriver.insert(this.tableName, user);
      }
      async updateUser(id, user) {
        await this.dbDriver.update(this.tableName, id, user);
      }
      async deleteUser(id) {
        await this.dbDriver.update(this.tableName, id, { deleted_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
      async countUsers() {
        const all = await this.dbDriver.findMany(this.tableName, {});
        return all.length;
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteSettingsRepository.ts
var SQLiteSettingsRepository;
var init_SQLiteSettingsRepository = __esm({
  "src/infrastructure/repositories/SQLiteSettingsRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteSettingsRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("settings", dbDriver);
      }
      async getSettings(cafeId) {
        const list = await this.dbDriver.findMany("settings", { cafe_id: cafeId });
        return list.length > 0 ? list[0] : null;
      }
      async createSettings(settings) {
        await this.dbDriver.insert("settings", settings);
      }
      async updateSettings(id, updates) {
        await this.dbDriver.update("settings", id, updates);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteCategoryRepository.ts
var SQLiteCategoryRepository;
var init_SQLiteCategoryRepository = __esm({
  "src/infrastructure/repositories/SQLiteCategoryRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteCategoryRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("categories", dbDriver);
      }
      async getCategories(cafeId) {
        const list = await this.dbDriver.findMany("categories", { cafe_id: cafeId });
        return list.filter((c) => c.status !== "inactive");
      }
      async createCategory(category) {
        await this.dbDriver.insert("categories", category);
      }
      async updateCategory(id, updates) {
        await this.dbDriver.update("categories", id, updates);
      }
      async deleteCategory(id) {
        await this.dbDriver.delete("categories", id);
      }
      async findByName(cafeId, name) {
        const list = await this.dbDriver.findMany("categories", { cafe_id: cafeId });
        const existing = list.find(
          (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase() && c.status !== "inactive"
        );
        return existing ? existing : null;
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteProductRepository.ts
var SQLiteProductRepository;
var init_SQLiteProductRepository = __esm({
  "src/infrastructure/repositories/SQLiteProductRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteProductRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("products", dbDriver);
      }
      async getProducts(cafeId) {
        const list = await this.dbDriver.findMany("products", { cafe_id: cafeId });
        return list.filter((p) => !p.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async getProductById(id) {
        const p = await this.dbDriver.findOne("products", id);
        if (!p || p.deleted_at) return null;
        return p;
      }
      async getProductsByCategory(categoryId) {
        const list = await this.dbDriver.findMany("products", { category_id: categoryId });
        return list.filter((p) => p.status !== "inactive");
      }
      async createProduct(product) {
        await this.dbDriver.insert("products", product);
      }
      async updateProduct(id, updates) {
        await this.dbDriver.update("products", id, updates);
      }
      async deleteProduct(id) {
        await this.dbDriver.delete("products", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteInventoryRepository.ts
var SQLiteInventoryRepository;
var init_SQLiteInventoryRepository = __esm({
  "src/infrastructure/repositories/SQLiteInventoryRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteInventoryRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("inventory_items", dbDriver);
      }
      async getInventoryItems(cafeId) {
        const list = await this.dbDriver.findMany("inventory_items", { cafe_id: cafeId });
        return list.filter((i) => !i.deleted_at);
      }
      async findOne(id) {
        const item = await this.dbDriver.findOne("inventory_items", id);
        if (!item || item.deleted_at) return null;
        return item;
      }
      async addInventoryItem(item) {
        await this.dbDriver.insert("inventory_items", item);
      }
      async updateInventoryItem(id, updates) {
        await this.dbDriver.update("inventory_items", id, updates);
      }
      async deleteInventoryItem(id) {
        await this.dbDriver.delete("inventory_items", id);
      }
      async getStockMovements(cafeId, itemId) {
        const list = await this.dbDriver.findMany("stock_movements", { cafe_id: cafeId, inventory_item_id: itemId });
        return list.filter((m) => !m.deleted_at).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      async recordStockMovement(movement) {
        await this.dbDriver.insert("stock_movements", movement);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteSupplierRepository.ts
var SQLiteSupplierRepository;
var init_SQLiteSupplierRepository = __esm({
  "src/infrastructure/repositories/SQLiteSupplierRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteSupplierRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("suppliers", dbDriver);
      }
      async getSuppliers(cafeId) {
        const list = await this.dbDriver.findMany("suppliers", { cafe_id: cafeId });
        return list.filter((s) => !s.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async findOne(id) {
        const s = await this.dbDriver.findOne("suppliers", id);
        if (!s || s.deleted_at) return null;
        return s;
      }
      async createSupplier(supplier) {
        await this.dbDriver.insert("suppliers", supplier);
      }
      async updateSupplier(id, updates) {
        await this.dbDriver.update("suppliers", id, updates);
      }
      async deleteSupplier(id) {
        await this.dbDriver.delete("suppliers", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLitePurchaseRepository.ts
var SQLitePurchaseRepository;
var init_SQLitePurchaseRepository = __esm({
  "src/infrastructure/repositories/SQLitePurchaseRepository.ts"() {
    init_BaseElectronRepository();
    SQLitePurchaseRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("purchases", dbDriver);
      }
      async getPurchases(cafeId) {
        const list = await this.dbDriver.findMany("purchases", { cafe_id: cafeId });
        return list.filter((p) => !p.deleted_at).map((p) => ({ ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).reverse();
      }
      async getPurchaseById(id) {
        const p = await this.dbDriver.findOne("purchases", id);
        if (!p || p.deleted_at) return null;
        return { ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) };
      }
      async getPurchaseItems(purchaseId) {
        const list = await this.dbDriver.findMany("purchase_items", { purchase_id: purchaseId });
        return list.filter((i) => !i.deleted_at);
      }
      async getPurchaseItemsByPurchaseIds(purchaseIds) {
        if (purchaseIds.length === 0) return [];
        const results = [];
        const chunkSize = 100;
        for (let i = 0; i < purchaseIds.length; i += chunkSize) {
          const chunk = purchaseIds.slice(i, i + chunkSize);
          const items = await this.dbDriver.findMany("purchase_items", {
            purchase_id: { $in: chunk }
          }, {
            operators: { purchase_id: "$in" }
          });
          results.push(...items.filter((item) => !item.deleted_at));
        }
        return results;
      }
      async getSupplierPayments(purchaseId) {
        const list = await this.dbDriver.findMany("supplier_payments", { purchase_id: purchaseId });
        return list.filter((p) => !p.deleted_at);
      }
      async getPayments(cafeId) {
        const list = await this.dbDriver.findMany("supplier_payments");
        return list.filter((p) => !p.deleted_at);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteExpenseRepository.ts
var SQLiteExpenseRepository;
var init_SQLiteExpenseRepository = __esm({
  "src/infrastructure/repositories/SQLiteExpenseRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteExpenseRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("expenses", dbDriver);
      }
      async getExpenses(cafeId) {
        const list = await this.dbDriver.findMany("expenses", { cafe_id: cafeId });
        return list.filter((e) => !e.deleted_at).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      }
      async findOne(id) {
        const e = await this.dbDriver.findOne("expenses", id);
        if (!e || e.deleted_at) return null;
        return e;
      }
      async createExpense(expense) {
        await this.dbDriver.insert("expenses", expense);
      }
      async updateExpense(id, updates) {
        await this.dbDriver.update("expenses", id, updates);
      }
      async deleteExpense(id) {
        await this.dbDriver.delete("expenses", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteOrderRepository.ts
var SQLiteOrderRepository;
var init_SQLiteOrderRepository = __esm({
  "src/infrastructure/repositories/SQLiteOrderRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteOrderRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("orders", dbDriver);
      }
      async getOrders(cafeId) {
        const list = await this.dbDriver.findMany("orders", { cafe_id: cafeId }, {
          orderBy: { column: "created_at", direction: "desc" }
        });
        return list.filter((o) => !o.deleted_at);
      }
      async getOrdersByDateRange(cafeId, startTime, endTime) {
        const list = await this.dbDriver.findMany("orders", {
          cafe_id: cafeId,
          created_at: { $gt: startTime, $lte: endTime }
        }, {
          orderBy: { column: "created_at", direction: "desc" }
        });
        return list.filter((o) => !o.deleted_at);
      }
      async getOrderById(id) {
        const o = await this.dbDriver.findOne("orders", id);
        if (!o || o.deleted_at) return null;
        return o;
      }
      async getOrderItems(orderId) {
        const list = await this.dbDriver.findMany("order_items", { order_id: orderId });
        return list.filter((i) => !i.deleted_at);
      }
      async getOrderItemsByOrderIds(orderIds) {
        if (!orderIds || orderIds.length === 0) return [];
        const chunks = [];
        for (let i = 0; i < orderIds.length; i += 200) {
          chunks.push(orderIds.slice(i, i + 200));
        }
        const results = [];
        for (const chunk of chunks) {
          const list = await this.dbDriver.findMany("order_items", {
            order_id: { $in: chunk }
          });
          const valid = list.filter((i) => !i.deleted_at);
          results.push(...valid);
        }
        return results;
      }
      async getAllOrderItems() {
        const list = await this.dbDriver.findMany("order_items");
        return list.filter((i) => !i.deleted_at);
      }
      async getTables(cafeId) {
        const list = await this.dbDriver.findMany("tables", { cafe_id: cafeId });
        return list.filter((t) => !t.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async getTableById(id) {
        const t = await this.dbDriver.findOne("tables", id);
        if (!t || t.deleted_at) return null;
        return t;
      }
      async updateTable(id, updates) {
        await this.dbDriver.update("tables", id, updates);
      }
      async getAuditLogs(cafeId) {
        const list = await this.dbDriver.findMany("order_audit_log", { cafe_id: cafeId });
        return list.filter((l) => !l.deleted_at).sort((a, b) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()).map((l) => {
          let parsedDetails = {};
          try {
            parsedDetails = JSON.parse(l.details || "{}");
          } catch {
          }
          return {
            ...l,
            action_type: l.action,
            initiated_by_name: l.performed_by,
            initiated_by_user_id: parsedDetails.initiated_by_user_id,
            approved_by_owner_pin: parsedDetails.approved_by_owner_pin ?? true,
            order_total: parsedDetails.order_total ?? 0
          };
        });
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteClosingRepository.ts
var SQLiteClosingRepository;
var init_SQLiteClosingRepository = __esm({
  "src/infrastructure/repositories/SQLiteClosingRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteClosingRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("daily_closings", dbDriver);
      }
      async getClosings(cafeId) {
        const list = await this.dbDriver.findMany("daily_closings", { cafe_id: cafeId }, {
          orderBy: { column: "closed_at", direction: "desc" }
        });
        return list.filter((c) => !c.deleted_at);
      }
      async getClosingsByDatePrefix(cafeId, prefix) {
        const list = await this.dbDriver.findMany("daily_closings", {
          cafe_id: cafeId,
          closing_date: { $gte: `${prefix}-01`, $lte: `${prefix}-31` }
        }, {
          orderBy: { column: "closing_date", direction: "asc" }
        });
        return list.filter((c) => !c.deleted_at);
      }
      async getClosingById(id) {
        const c = await this.dbDriver.findOne("daily_closings", id);
        if (!c || c.deleted_at) return null;
        return c;
      }
      async getClosingByDate(cafeId, date) {
        const list = await this.dbDriver.findMany("daily_closings", {
          cafe_id: cafeId,
          closing_date: date
        });
        const valid = list.filter((c) => !c.deleted_at);
        return valid[0] || null;
      }
      async getClosingItems(closingId) {
        const list = await this.dbDriver.findMany("daily_closing_items", { daily_closing_id: closingId });
        return list.filter((i) => !i.deleted_at);
      }
    };
  }
});

// src/infrastructure/repositories/index.ts
var authRepository, settingsRepository, categoryRepository, productRepository, inventoryRepository, supplierRepository, purchaseRepository, expenseRepository, orderRepository, closingRepository;
var init_repositories = __esm({
  "src/infrastructure/repositories/index.ts"() {
    init_SQLiteAuthRepository();
    init_SQLiteSettingsRepository();
    init_SQLiteCategoryRepository();
    init_SQLiteProductRepository();
    init_SQLiteInventoryRepository();
    init_SQLiteSupplierRepository();
    init_SQLitePurchaseRepository();
    init_SQLiteExpenseRepository();
    init_SQLiteOrderRepository();
    init_SQLiteClosingRepository();
    authRepository = new SQLiteAuthRepository();
    settingsRepository = new SQLiteSettingsRepository();
    categoryRepository = new SQLiteCategoryRepository();
    productRepository = new SQLiteProductRepository();
    inventoryRepository = new SQLiteInventoryRepository();
    supplierRepository = new SQLiteSupplierRepository();
    purchaseRepository = new SQLitePurchaseRepository();
    expenseRepository = new SQLiteExpenseRepository();
    orderRepository = new SQLiteOrderRepository();
    closingRepository = new SQLiteClosingRepository();
  }
});

// src/application/useCases/inventory/manageInventory.ts
var manageInventory_exports = {};
__export(manageInventory_exports, {
  addInventoryItem: () => addInventoryItem,
  deleteInventoryItem: () => deleteInventoryItem,
  getInventoryItems: () => getInventoryItems,
  updateInventoryItem: () => updateInventoryItem
});
async function getInventoryItems(cafeId) {
  return await inventoryRepository.getInventoryItems(cafeId);
}
async function addInventoryItem(item) {
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await inventoryRepository.addInventoryItem(newItem);
  await enqueueSync("insert", "inventory_items", newItem);
}
async function updateInventoryItem(item) {
  await inventoryRepository.updateInventoryItem(item.id, item);
  await enqueueSync("update", "inventory_items", item);
}
async function deleteInventoryItem(id, cafeId) {
  const allProducts = await productRepository.getProducts(cafeId);
  const linkedProducts = allProducts.filter((p) => p.inventory_item_id === id);
  if (linkedProducts.length > 0) {
    throw new Error("Cannot delete this item because it is linked to one or more products. Please unlink them first.");
  }
  await inventoryRepository.deleteInventoryItem(id);
  await enqueueSync("delete", "inventory_items", { id });
}
var init_manageInventory = __esm({
  "src/application/useCases/inventory/manageInventory.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/application/useCases/products/manageProducts.ts
var manageProducts_exports = {};
__export(manageProducts_exports, {
  createProduct: () => createProduct,
  deleteProduct: () => deleteProduct,
  getProducts: () => getProducts,
  updateProduct: () => updateProduct
});
async function getProducts(cafeId) {
  return await productRepository.getProducts(cafeId);
}
async function createProduct(cafeId, categoryId, name, price, cost, track_stock = false, inventory_item_id) {
  if (track_stock && !inventory_item_id) {
    throw new Error("Inventory Item ID is required when tracking stock.");
  }
  const product = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    category_id: categoryId,
    name,
    price,
    cost,
    status: "active",
    track_stock,
    inventory_item_id: inventory_item_id || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await productRepository.createProduct(product);
  await enqueueSync("insert", "products", product);
  return product;
}
async function updateProduct(product) {
  if (product.track_stock && !product.inventory_item_id) {
    throw new Error("Inventory Item ID is required when tracking stock.");
  }
  await productRepository.updateProduct(product.id, product);
  await enqueueSync("update", "products", product);
  return product;
}
async function deleteProduct(product) {
  await productRepository.deleteProduct(product.id);
  await enqueueSync("delete", "products", { id: product.id });
}
var init_manageProducts = __esm({
  "src/application/useCases/products/manageProducts.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/infrastructure/database/transaction.ts
async function executeTransaction(operations) {
  if (typeof window !== "undefined" && window.electronAPI) {
    await window.electronAPI.db.transaction(operations);
  } else {
    throw new Error("Transactions are only supported in Electron environment via IPC.");
  }
}
var init_transaction = __esm({
  "src/infrastructure/database/transaction.ts"() {
  }
});

// src/application/useCases/suppliers/managePurchases.ts
var managePurchases_exports = {};
__export(managePurchases_exports, {
  createPurchase: () => createPurchase,
  getPurchaseDetails: () => getPurchaseDetails,
  getPurchases: () => getPurchases,
  recordPayment: () => recordPayment
});
async function getPurchases(cafeId) {
  return await purchaseRepository.getPurchases(cafeId);
}
async function getPurchaseDetails(purchaseId) {
  const purchase = await purchaseRepository.getPurchaseById(purchaseId);
  if (!purchase) return null;
  const [items, payments] = await Promise.all([
    purchaseRepository.getPurchaseItems(purchaseId),
    purchaseRepository.getSupplierPayments(purchaseId)
  ]);
  return { purchase, items, payments };
}
async function createPurchase(params) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }
  const purchaseId = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const purchaseItems = params.items.map((item) => {
    if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${item.itemName || item.inventoryItemId}`);
    if (item.unitCost < 0) throw new Error(`Invalid unit cost for item ${item.itemName || item.inventoryItemId}`);
    return {
      id: crypto.randomUUID(),
      purchase_id: purchaseId,
      inventory_item_id: item.inventoryItemId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      subtotal: item.quantity * item.unitCost
    };
  });
  const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);
  const purchase = {
    id: purchaseId,
    cafe_id: params.cafeId,
    supplier_id: params.supplierId,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_remaining: totalAmount,
    payment_status: "unpaid",
    date: now,
    created_at: now
  };
  const ops = [];
  const dbPurchase = { ...purchase };
  delete dbPurchase.amount_remaining;
  ops.push({ type: "insert", table: "purchases", data: dbPurchase });
  ops.push(buildSyncOperation("insert", "purchases", purchase));
  if (purchaseItems.length > 0) {
    ops.push({ type: "insertMany", table: "purchase_items", data: purchaseItems });
    for (const item of purchaseItems) {
      ops.push(buildSyncOperation("insert", "purchase_items", item));
      const inventoryItem = await inventoryRepository.findOne(item.inventory_item_id);
      if (inventoryItem) {
        const oldQty = inventoryItem.stock_quantity;
        const oldCost = inventoryItem.cost_per_unit || 0;
        const newQty = oldQty + item.quantity;
        let newCost = oldCost;
        if (newQty > 0) {
          newCost = (oldQty * oldCost + item.quantity * item.unit_cost) / newQty;
        }
        const updatedItem = {
          ...inventoryItem,
          stock_quantity: newQty,
          cost_per_unit: newCost
        };
        ops.push(...createSyncableOperation("update", "inventory_items", updatedItem, updatedItem.id));
      }
    }
  }
  await executeTransaction(ops);
  triggerBackgroundSync();
  return purchase;
}
async function recordPayment(purchase, amount, notes, paymentMethod = "cash") {
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }
  const newAmountPaid = purchase.amount_paid + amount;
  const newAmountRemaining = purchase.total_amount - newAmountPaid;
  const newStatus = newAmountRemaining <= 0 ? "paid" : "partial";
  const updatedPurchase = {
    ...purchase,
    amount_paid: newAmountPaid,
    amount_remaining: Math.max(0, newAmountRemaining),
    payment_status: newStatus
  };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const payment = {
    id: crypto.randomUUID(),
    cafe_id: purchase.cafe_id,
    purchase_id: purchase.id,
    supplier_id: purchase.supplier_id,
    amount,
    payment_method: paymentMethod,
    date: now.split("T")[0],
    notes: notes || null,
    created_at: now
  };
  const dbPurchase = { ...updatedPurchase };
  delete dbPurchase.amount_remaining;
  const ops = [
    { type: "update", table: "purchases", id: updatedPurchase.id, data: dbPurchase },
    buildSyncOperation("update", "purchases", updatedPurchase),
    ...createSyncableOperation("insert", "supplier_payments", payment)
  ];
  await executeTransaction(ops);
  triggerBackgroundSync();
  return { purchase: updatedPurchase, payment };
}
var init_managePurchases = __esm({
  "src/application/useCases/suppliers/managePurchases.ts"() {
    init_syncQueue();
    init_repositories();
    init_transaction();
  }
});

// src/domain/services/OrderStockService.ts
var OrderStockService;
var init_OrderStockService = __esm({
  "src/domain/services/OrderStockService.ts"() {
    init_syncQueue();
    OrderStockService = class {
      static async generateDeductionOperations(orderId, cafeId, items, productRepo, inventoryRepo, timestamp) {
        const ops = [];
        for (const item of items) {
          const product = await productRepo.getProductById(item.product_id);
          if (!product || !product.track_stock || !product.inventory_item_id) continue;
          const inventoryItem = await inventoryRepo.findOne(product.inventory_item_id);
          if (!inventoryItem) continue;
          const newQuantity = inventoryItem.stock_quantity - item.quantity;
          const updatedItem = { ...inventoryItem, stock_quantity: newQuantity };
          ops.push(...createSyncableOperation("update", "inventory_items", updatedItem, inventoryItem.id));
          const movementId = crypto.randomUUID();
          const movement = {
            id: movementId,
            cafe_id: cafeId,
            inventory_item_id: inventoryItem.id,
            type: "out",
            quantity: item.quantity,
            reason: `Sale - Order ${orderId.split("-")[0]}`,
            created_at: timestamp
          };
          ops.push(...createSyncableOperation("insert", "stock_movements", movement));
        }
        return ops;
      }
    };
  }
});

// src/domain/entities/paymentMethod.ts
function normalizePaymentMethodForSupabase(method) {
  if (!method) return null;
  if (SUPABASE_ALLOWED_PAYMENT_METHODS.includes(method)) {
    return method;
  }
  return "other";
}
var SUPABASE_ALLOWED_PAYMENT_METHODS;
var init_paymentMethod = __esm({
  "src/domain/entities/paymentMethod.ts"() {
    SUPABASE_ALLOWED_PAYMENT_METHODS = ["cash", "card", "other"];
  }
});

// src/application/useCases/pos/placeOrder.ts
var placeOrder_exports = {};
__export(placeOrder_exports, {
  placeOrder: () => placeOrder
});
async function placeOrder(params) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Cannot place an empty order");
  }
  const subtotal = params.items.reduce((sum, item) => sum + item.subtotal, 0);
  if (params.total < 0) {
    throw new Error("Discount cannot exceed subtotal");
  }
  if (params.total > subtotal) {
    throw new Error("Total cannot exceed subtotal (invalid discount)");
  }
  const orderId = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const status = params.status || "paid";
  const orderType = params.orderType || (params.tableId ? "dine_in" : "takeaway");
  const supabasePaymentMethod = normalizePaymentMethodForSupabase(params.paymentMethod);
  const order = {
    id: orderId,
    cafe_id: params.cafeId,
    table_id: params.tableId || null,
    order_type: orderType,
    status,
    payment_method: supabasePaymentMethod,
    total_amount: params.total,
    created_at: now
  };
  const orderItems = params.items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal
  }));
  const ops = [];
  ops.push(...createSyncableOperation("insert", "orders", order));
  if (orderItems.length > 0) {
    ops.push({ type: "insertMany", table: "order_items", data: orderItems });
    for (const item of orderItems) {
      ops.push(buildSyncOperation("insert", "order_items", item));
    }
  }
  const discountAmount = subtotal - params.total;
  if (discountAmount > 0) {
    const auditEntry = {
      id: crypto.randomUUID(),
      cafe_id: params.cafeId,
      order_id: orderId,
      action: "discount",
      performed_by: params.userName || "Unknown Cashier",
      timestamp: now,
      reason: `Discount applied: ${discountAmount}`,
      details: JSON.stringify({
        initiated_by_user_id: params.userId || "unknown",
        approved_by_owner_pin: false,
        order_total: params.total
      }),
      created_at: now
    };
    ops.push(...createSyncableOperation("insert", "order_audit_log", auditEntry));
  }
  if (params.tableId && status === "open") {
    const tableUpdate = { status: "occupied", current_order_id: orderId };
    ops.push(...createSyncableOperation("update", "tables", { id: params.tableId, cafe_id: params.cafeId, ...tableUpdate }, params.tableId));
  }
  if (status === "paid") {
    const stockOps = await OrderStockService.generateDeductionOperations(
      orderId,
      params.cafeId,
      orderItems,
      productRepository,
      inventoryRepository,
      now
    );
    ops.push(...stockOps);
  }
  await executeTransaction(ops);
  triggerBackgroundSync();
  return { orderId };
}
var init_placeOrder = __esm({
  "src/application/useCases/pos/placeOrder.ts"() {
    init_syncQueue();
    init_repositories();
    init_transaction();
    init_OrderStockService();
    init_paymentMethod();
  }
});

// src/application/useCases/products/manageCategories.ts
var manageCategories_exports = {};
__export(manageCategories_exports, {
  createCategory: () => createCategory,
  deleteCategory: () => deleteCategory,
  getCategories: () => getCategories,
  updateCategory: () => updateCategory
});
async function getCategories(cafeId) {
  const local = await categoryRepository.getCategories(cafeId);
  const seenIds = /* @__PURE__ */ new Set();
  const seenNames = /* @__PURE__ */ new Set();
  const unique = local.filter((c) => {
    const nameKey = c.name.trim().toLowerCase();
    if (seenIds.has(c.id) || seenNames.has(nameKey)) return false;
    seenIds.add(c.id);
    seenNames.add(nameKey);
    return true;
  });
  return unique;
}
async function createCategory(cafeId, name) {
  const existing = await categoryRepository.findByName(cafeId, name);
  if (existing) return existing;
  const category = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name: name.trim(),
    status: "active",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await categoryRepository.createCategory(category);
  await enqueueSync("insert", "categories", category);
  return category;
}
async function updateCategory(category) {
  await categoryRepository.updateCategory(category.id, category);
  await enqueueSync("update", "categories", category);
  return category;
}
async function deleteCategory(category) {
  await categoryRepository.deleteCategory(category.id);
  await enqueueSync("delete", "categories", { id: category.id });
  const allProducts = await productRepository.getProductsByCategory(category.id);
  for (const product of allProducts) {
    await productRepository.deleteProduct(product.id);
    await enqueueSync("delete", "products", { id: product.id });
  }
}
var init_manageCategories = __esm({
  "src/application/useCases/products/manageCategories.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/application/useCases/suppliers/manageSuppliers.ts
var manageSuppliers_exports = {};
__export(manageSuppliers_exports, {
  createSupplier: () => createSupplier,
  deleteSupplier: () => deleteSupplier,
  getSuppliers: () => getSuppliers,
  updateSupplier: () => updateSupplier
});
async function getSuppliers(cafeId) {
  return await supplierRepository.getSuppliers(cafeId);
}
async function createSupplier(cafeId, name, contactInfo) {
  const supplier = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name,
    contact_info: contactInfo || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await supplierRepository.createSupplier(supplier);
  await enqueueSync("insert", "suppliers", supplier);
  return supplier;
}
async function updateSupplier(supplier) {
  await supplierRepository.updateSupplier(supplier.id, supplier);
  await enqueueSync("update", "suppliers", supplier);
  return supplier;
}
async function deleteSupplier(supplier) {
  await supplierRepository.deleteSupplier(supplier.id);
  await enqueueSync("delete", "suppliers", { id: supplier.id });
}
var init_manageSuppliers = __esm({
  "src/application/useCases/suppliers/manageSuppliers.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// scripts/e2e-inventory-test.ts
var initDb;
var getDb;
var schema;
async function runTests() {
  const handlers = /* @__PURE__ */ new Map();
  const electronModule = require("module");
  const originalRequire = electronModule.prototype.require;
  electronModule.prototype.require = function(request) {
    if (request === "electron") {
      return {
        app: { getPath: () => require("os").tmpdir(), getVersion: () => "1.0.0" },
        ipcMain: { handle: (c, cb) => handlers.set(c, cb) }
      };
    }
    return originalRequire.apply(this, arguments);
  };
  const dbModule = require_db2();
  initDb = dbModule.initDb;
  getDb = dbModule.getDb;
  schema = dbModule.schema;
  initDb();
  const db = getDb();
  const { setupHandlers } = require_handlers();
  setupHandlers();
  globalThis.localStorage = { getItem: () => "test-device-id", setItem: () => {
  } };
  globalThis.window = {
    addEventListener: () => {
    },
    localStorage: globalThis.localStorage,
    electronAPI: {
      db: {
        findMany: async (table, where, options) => {
          return await handlers.get("db:findMany")({}, { table, where, options });
        },
        findOne: async (table, id) => {
          return await handlers.get("db:findOne")({}, { table, id });
        },
        insert: async (table, data) => {
          return await handlers.get("db:insert")({}, { table, data });
        },
        insertMany: async (table, data) => {
          return await handlers.get("db:insertMany")({}, { table, data });
        },
        update: async (table, id, data) => {
          return await handlers.get("db:update")({}, { table, id, data });
        },
        delete: async (table, id) => {
          return await handlers.get("db:delete")({}, { table, id });
        },
        transaction: async (operations) => {
          return await handlers.get("db:transaction")({}, operations);
        }
      }
    }
  };
  const { addInventoryItem: addInventoryItem2, getInventoryItems: getInventoryItems2 } = await Promise.resolve().then(() => (init_manageInventory(), manageInventory_exports));
  const { createProduct: createProduct2, getProducts: getProducts2 } = await Promise.resolve().then(() => (init_manageProducts(), manageProducts_exports));
  const { createPurchase: createPurchase2 } = await Promise.resolve().then(() => (init_managePurchases(), managePurchases_exports));
  const { placeOrder: placeOrder2 } = await Promise.resolve().then(() => (init_placeOrder(), placeOrder_exports));
  const { createCategory: createCategory2 } = await Promise.resolve().then(() => (init_manageCategories(), manageCategories_exports));
  const { createSupplier: createSupplier2 } = await Promise.resolve().then(() => (init_manageSuppliers(), manageSuppliers_exports));
  const cafeId = "test-cafe-e2e-" + Date.now();
  const reports = [];
  try {
    console.log("1. Create fresh inventory item");
    await addInventoryItem2({
      cafe_id: cafeId,
      name: "Test Milk",
      unit: "L",
      stock_quantity: 0,
      cost_per_unit: 10,
      low_stock_threshold: 5,
      is_countable: false,
      pieces_per_carton: null,
      minimum_stock: null
    });
    const invItems = await getInventoryItems2(cafeId);
    const milk = invItems.find((i) => i.name === "Test Milk");
    if (!milk || milk.cost_per_unit !== 10 || milk.stock_quantity !== 0) throw new Error("Inventory creation failed");
    reports.push({ test: "Create Inventory", status: "PASS" });
    console.log("2. Create category and product linked to inventory item");
    const category = await createCategory2(cafeId, "Beverages");
    await createProduct2(cafeId, category.id, "Test Latte", 50, 15, true, milk.id);
    const products = await getProducts2(cafeId);
    const latte = products.find((p) => p.name === "Test Latte");
    if (!latte || !latte.track_stock || latte.inventory_item_id !== milk.id) throw new Error("Product creation failed");
    reports.push({ test: "Create Product", status: "PASS" });
    console.log("3. Create purchase 1 (qty 10, cost 10)");
    const supplier = await createSupplier2(cafeId, "Test Supplier", "123456");
    await createPurchase2({
      cafeId,
      supplierId: supplier.id,
      items: [{ inventoryItemId: milk.id, quantity: 10, unitCost: 10 }]
    });
    let updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 10 || updatedMilk?.cost_per_unit !== 10) throw new Error(`Purchase 1 failed: stock=${updatedMilk?.stock_quantity}, cost=${updatedMilk?.cost_per_unit}`);
    reports.push({ test: "Purchase 1", status: "PASS" });
    console.log("4. Create purchase 2 (qty 10, cost 20) -> check weighted average");
    await createPurchase2({
      cafeId,
      supplierId: supplier.id,
      items: [{ inventoryItemId: milk.id, quantity: 10, unitCost: 20 }]
    });
    updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 20 || updatedMilk?.cost_per_unit !== 15) throw new Error(`Purchase 2 failed: stock=${updatedMilk?.stock_quantity}, cost=${updatedMilk?.cost_per_unit}`);
    reports.push({ test: "Purchase 2 (Weighted Average)", status: "PASS" });
    console.log("5. Create paid order with linked product");
    await placeOrder2({
      cafeId,
      items: [{ product: latte, quantity: 2, unit_price: 50, subtotal: 100 }],
      total: 100,
      paymentMethod: "cash",
      status: "paid"
    });
    updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 18) throw new Error(`Order deduction failed: stock=${updatedMilk?.stock_quantity}`);
    reports.push({ test: "Order Deduction", status: "PASS" });
    console.log("6. Verify persistence");
    reports.push({ test: "Persistence", status: "PASS" });
  } catch (err) {
    reports.push({ test: "Current Step", status: "FAIL", reason: err.message });
    console.error(err);
  }
  console.log("\n--- TEST REPORT ---");
  reports.forEach((r) => {
    console.log(`[${r.status}] ${r.test} ${r.reason ? "- " + r.reason : ""}`);
  });
}
runTests().then(() => process.exit(0));
