
import BasicStore from 'stas-core';
import immutable from 'plain-immutable';
import Model from './model';
import { isPlainObject, stringify } from './util';

export default class StasImmutableStore extends BasicStore {
  _models = {}; // model instances. {<model name>: <model>}
  _database = {}; // container that stores records of each model. {<model name>: {<id>: <record>}}
  _isDatabaseChanged = false; // whether the model record has been changed under mutating(mutate())
  _isMutating = false; // whether is under mutating(mutate())

  constructor(initialState, { database } = {}) {
    initialState = parseState(initialState);
    database = parseDatabase(database);

    super(initialState);

    if (database) this._database = database;
  }

  get database() {
    return this._database;
  }

  getDatabase() {
    return this._database;
  }

  model(name, attributes) {
    if (attributes) {
      if (this._models[name]) throw new Error(`Cannot redefine model: ${name}`);
      this._models[name] = new Model(this, name, attributes);
      return this._models[name];
    } else {
      if (!this._models[name]) this._models[name] = new Model(this, name, attributes);
      return this._models[name];
    }
  }

  mutate(mutater) {
    if (!mutater || typeof mutater !== 'function') {
      throw new TypeError(`Invalid mutater: ${mutater}, expect function`);
    }

    if (this._isMutating) {
      throw new Error('Cannot start another mutation operation');
    }
    this._isMutating = true;
    this._isDatabaseChanged = false;

    try {
      const newState = mutater(this._state);

      if (newState !== this._state) {
        return super.setState(parseState(newState));
      }
      if (this._isDatabaseChanged) {
        this.forceUpdate();
      }
    } finally {
      this._isMutating = false;
      this._isDatabaseChanged = false;
    }
  }

  setState(newState, { database } = {}) {
    if (this._isMutating) {
      throw new Error('Cannot call setState() under store.mutate()');
    }

    database = parseDatabase(database);

    const shouldDatabaseChange = database && this._database !== database;
    if (shouldDatabaseChange) this._database = database;

    if (newState !== this._state) {
      return super.setState(parseState(newState));
    }
    if (shouldDatabaseChange) {
      this.forceUpdate();
    }
  }
}

function parseState(state) {
  if (state === undefined || state === null) return state;
  if (!(Array.isArray(state) || isPlainObject(state))) {
    throw new TypeError(`Invalid state: ${stringify(state)}, expect object or array`);
  }
  return immutable(state);
}

function parseDatabase(database) {
  if (database !== undefined && database !== null && !isPlainObject(database)) {
    throw new TypeError(`Invalid database: ${stringify(database)}, expect plain object`);
  }
  if (database) {
    Object.keys(database).forEach((modelName) => {
      const records = database[modelName];
      Object.keys(records).forEach((id) => {
        records[id] = immutable(records[id]);
      });
    });
  }
  return database;
}
