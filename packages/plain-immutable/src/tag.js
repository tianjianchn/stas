
export const IMMUTABLE_TAG = '@@__PLAIN_IMMUTABLE_TAG__@@';

export function isImmutable(value) {
  return !!(value && value[IMMUTABLE_TAG]);
}

export function setImmutableTag() {
  Object.defineProperty(this, IMMUTABLE_TAG, {
    value: true,
  });
}
