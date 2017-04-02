
import immutable, { isImmutable } from 'plain-immutable';
import { isPlainObject, stringify } from './util';

export default class Model {
  _store = null; // the attached store that contains the records
  _isEnsured = false; // ensure relationships definition right

  name = null; // the model name
  attributes = {}; // definition for relationships

  constructor(store, name, attributes = {}) {
    if (!name || typeof name !== 'string') {
      throw new TypeError(`Invalid name: ${stringify(name)}, expect string`);
    }
    if (!isPlainObject(attributes)) {
      throw new TypeError(`Invalid attributes: ${stringify(attributes)}, expect plain object`);
    }

    this._store = store;
    this.name = name;
    this.attributes = attributes;
  }

  // return the record(s)
  get(ids) {
    if (!ids) return null;

    const records = this.ensure();
    if (Array.isArray(ids)) {
      return immutable(ids.map(id => records[id] || null));
    } else {
      return immutable(records[ids]) || null;
    }
  }

  // replace the record
  set(record) {
    if (!record || !record.id) return;
    const id = record.id;

    const records = this.ensure();
    if (record === records[id]) return;

    this._tryMutating();
    records[id] = immutable(record || null);
  }

  // remove record(s)
  remove(ids) {
    if (!ids) return;

    const records = this.ensure();
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (records[id]) {
          this._tryMutating();
          delete records[id];
        }
      });
    } else if (records[ids]) {
      this._tryMutating();
      delete records[ids];
    }
  }

  // merge the plain json data to the model, return id(s)
  merge(records) {
    if (Array.isArray(records)) {
      return records.map(this._merge);
    } else {
      return this._merge(records);
    }
  }

  _merge = (record) => {
    if (!record || !record.id) return record;

    const id = record.id;
    const records = this.ensure();
    let newRecord = isImmutable(record) ? null : record;

    Object.keys(this.attributes).forEach((key) => {
      const attr = this.attributes[key];
      if (!record[key]) {
        if (Array.isArray(attr)) {
          if (!newRecord) newRecord = record.mutable();
          newRecord[key] = [];
        }
      } else if (Array.isArray(attr)) {
        const model = attr[0];
        const newVal = model.merge(record[key]);
        if (newVal !== record[key]) {
          if (!newRecord) newRecord = record.mutable();
          newRecord[key] = Array.isArray(newVal) ? newVal : [newVal];
        }
      } else {
        const model = attr;
        let val = record[key];
        if (Array.isArray(val)) val = val[0];

        const newVal = model.merge(val);
        if (newVal !== val) {
          if (!newRecord) newRecord = record.mutable();
          newRecord[key] = newVal;
        }
      }
    });

    newRecord || (newRecord = record);

    if (!records[id]) {
      this._tryMutating();
      records[id] = immutable(newRecord);
    } else {
      newRecord = records[id].merge(newRecord);
      if (newRecord !== records[id]) {
        this._tryMutating();
        records[id] = newRecord;
      }
    }
    return id;
  }

  ensure() {
    const store = this._store;

    // ensure relationships definition right
    if (!this._isEnsured) {
      if (!this.attributes) return;
      Object.keys(this.attributes).forEach((key) => {
        const val = this.attributes[key];
        this.attributes[key] = this._getModel(key, val);
      });
      this._isEnsured = true;
    }

    const database = store._database;

    const records = database[this.name];
    if (!records) {
      return (database[this.name] = {});
    }
    return records;
  }

  _getModel(key, attr) {
    const isArray = Array.isArray(attr);
    let model = isArray ? attr[0] : attr;
    if (typeof model === 'string') {
      model = this._store._models[model];
    }

    if (!model || !(model instanceof Model)) {
      throw new Error(`Invalid attribute at ${key} in ${this.name}: ${stringify(attr)}, expect a model(or string) that exists`);
    } else {
      if (isArray) return [model];
      return model;
    }
  }

  _tryMutating() {
    const store = this._store;
    if (!store._isMutating) {
      throw new Error('Cannot mutate the records of model outside store.mutate()');
    }
    store._isDatabaseChanged = true;
  }

}
