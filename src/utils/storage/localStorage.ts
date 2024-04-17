export interface StorageDefinition {
  name: string,
  value: string
}

export interface Storage {
  contains: (pattern: RegExp) => StorageDefinition[];
  create: (name: string, value: string) => void;
  delete: (name: string) => void;
  deleteAll: (pattern: RegExp) => void;
  get: (name: string) => StorageDefinition | null;
  getAll: () => StorageDefinition[];
  getValue: (name: string) => string | null;
  setValue: (name: string, value: string) => void;
}


const _getAllStorage = (pattern?: RegExp) => {
  let storage = Object.keys(localStorage);

  if (pattern) {
    storage = storage.filter(clave =>
      pattern.test(clave)
    );
  }

  return storage.map(clave => {
    return {  name: clave, value: localStorage.getItem(clave) } as StorageDefinition;
  }) || [];
}

const _constains = (pattern: RegExp) => {
  return _getAllStorage(pattern);
}

const _createStorage = (name: string, value: string) => {
  localStorage.setItem(name, value);
}

const _deleteStorage = (name: string) => {
  localStorage.removeItem(name);
}

const _deleteAllStorage = (pattern: RegExp) => {
  const storageArray = _getAllStorage(pattern);

  storageArray.forEach((storage: StorageDefinition) => {
    _deleteStorage(storage.name);
  })
}

const _getStorage = (name: string) => {
  const storageArray = _getAllStorage(new RegExp(name));

  if (storageArray.length) {
    return storageArray.find(storage => storage.name === name) || null;
  }

  return null;
}

const _getStorageValue = (name: string) => {
  if (localStorage.getItem(name)) {
    return localStorage.getItem(name) || null;
  }

  return null;
}

const _setStorageValue = (name: string, value: string) => {
  if (localStorage.getItem(name)) {
    localStorage.setItem(name, value);
  }
}

export const containsStorage = (pattern: RegExp) => {
  return _constains(pattern);
}

export function createStorage(name: string, value: string) {
  _createStorage(name, value);
}

export function deleteStorage(name: string) {
  _deleteStorage(name);
}

export function deleteAllStorage(pattern: RegExp) {
  _deleteAllStorage(pattern);
}

export function getStorage(name: string) {
  return _getStorage(name);
}

export function getAllStorage() {
  return _getAllStorage();
}

export function getStorageValue(name: string) {
  return _getStorageValue(name);
}

export function setStorageValue(name: string, value: string) {
  _setStorageValue(name, value);
}

const storage: Storage = {
  contains: containsStorage,
  create: createStorage,
  delete: deleteStorage,
  deleteAll: deleteAllStorage,
  get: getStorage,
  getAll: getAllStorage,
  getValue: getStorageValue,
  setValue: setStorageValue
}

export default storage;
