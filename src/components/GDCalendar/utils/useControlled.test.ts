import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useControlled } from './useControlled';

describe('useControlled', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts from defaultValue and keeps its own state when uncontrolled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControlled<number>(undefined, onChange, 1)
    );

    expect(result.current.isControlled).toBe(false);
    expect(result.current.value).toBe(1);

    act(() => result.current.onChange(2));

    expect(onChange).toHaveBeenCalledWith(2);
    expect(result.current.value).toBe(2);
  });

  it('ignores internal state and reports changes when controlled', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useControlled<number>(value, onChange, 1),
      { initialProps: { value: 5 } }
    );

    expect(result.current.isControlled).toBe(true);
    expect(result.current.value).toBe(5);

    act(() => result.current.onChange(6));

    expect(onChange).toHaveBeenCalledWith(6);
    expect(result.current.value).toBe(5);

    rerender({ value: 7 });

    expect(result.current.value).toBe(7);
  });

  it('treats null as a controlled value so the parent can clear it', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useControlled<number | null>(null, undefined, 1)
    );

    expect(result.current.isControlled).toBe(true);
    expect(result.current.value).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns once when switching from controlled to uncontrolled', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ value }: { value?: number }) =>
        useControlled<number>(value, undefined, 1),
      { initialProps: { value: 5 } as { value?: number } }
    );

    expect(errorSpy).not.toHaveBeenCalled();

    rerender({ value: undefined });

    expect(errorSpy).toHaveBeenCalledTimes(1);

    const message = String(errorSpy.mock.calls[0][0]);

    expect(message).toContain('controlled to uncontrolled');
    expect(message).toContain('`null`');

    rerender({ value: undefined });

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('warns when switching from uncontrolled to controlled', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ value }: { value?: number }) =>
        useControlled<number>(value, undefined, 1),
      { initialProps: {} as { value?: number } }
    );

    rerender({ value: 5 });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0][0])).toContain(
      'uncontrolled to controlled'
    );
  });

  it('does not warn when a controlled value merely changes', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ value }: { value: number }) =>
        useControlled<number>(value, undefined, 1),
      { initialProps: { value: 5 } }
    );

    rerender({ value: 6 });

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
