import {DependencyList, RefObject, useEffect, useState} from "react";

/**
 * A custom react hook. Returns a function `rerender()` which forces the component to update
 */
export function useManualRerender(): () => void {
    const [dummy, setDummy] = useState(0);
    return () => setDummy(dummy + 1);
}


/**
 * A custom react hook. Equivalent to
 * <pre>
 * useEffect(() => {
 *     window.addEventListener(listenerType, listener);
 *
 *     return () => {
 *         window.removeEventListener(listenerType, listener);
 *     }
 * }, dependencies ?? []);
 * </pre>
 */
export function useListenerOnWindow<K extends keyof WindowEventMap>(
    window: Window,
    listenerType: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    dependencies ?: DependencyList
): void {
    useEffect(() => {
        window.addEventListener(listenerType, listener);

        return () => {
            window.removeEventListener(listenerType, listener);
        }
    }, dependencies ?? []);
}

/**
 * A custom react hook. Equivalent to
 * <pre>
 * useEffect(() => {
 *     element.addEventListener(listenerType, listener);
 *
 *     return () => {
 *         element.removeEventListener(listenerType, listener);
 *     }
 * }, dependencies ?? []);
 * </pre>
 */
export function useListenerOnHTMLElement<E extends HTMLElement, K extends keyof HTMLElementEventMap>(
    element: RefObject<E>,
    listenerType: K,
    listener: (this: E, ev: HTMLElementEventMap[K]) => any,
    dependencies ?: DependencyList
): void {
    type listener_t = (this: HTMLElement, ev: HTMLElementEventMap[K]) => any;

    useEffect(() => {
        element.current?.addEventListener(listenerType, listener as listener_t);

        return () => {
            element.current?.removeEventListener(listenerType, listener as listener_t);
        }
    }, dependencies ?? []);
}