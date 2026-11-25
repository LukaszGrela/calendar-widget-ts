import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A value that can be either controlled by the parent (via `valueFromProps`)
 * or owned by the hook itself (uncontrolled mode).
 *
 * `undefined` is the "uncontrolled" sentinel, following the React convention
 * for form controls. It therefore cannot be used to clear a controlled value:
 * pass `null` (when `T` allows it) or an explicit empty value instead.
 */
export const useControlled = <T, Rest extends unknown[] = []>(
  valueFromProps?: T,
  onChangeFromProps?: (value: T, ...rest: Rest) => void,
  defaultValue?: T
) => {
  const isControlled = valueFromProps !== undefined;
  const wasControlled = useRef(isControlled);

  useEffect(() => {
    if (wasControlled.current === isControlled) {
      return;
    }

    const previousMode = wasControlled.current ? 'controlled' : 'uncontrolled';
    const nextMode = isControlled ? 'controlled' : 'uncontrolled';

    wasControlled.current = isControlled;

    if (!import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.error(
        `[useControlled] A value changed from ${previousMode} to ` +
          `${nextMode}. Decide between using a controlled or uncontrolled ` +
          'value for the lifetime of the component. To clear a controlled ' +
          'value pass `null`; `undefined` always means "uncontrolled".'
      );
    }
  }, [isControlled]);

  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );

  const value = (isControlled ? valueFromProps : internalValue) as T;

  const onChange = useCallback(
    (newValue: T, ...rest: Rest) => {
      if (onChangeFromProps) {
        onChangeFromProps(newValue, ...rest);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
    },
    [isControlled, onChangeFromProps]
  );

  return { value, onChange, isControlled };
};
