import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Garde le focus à l'intérieur d'une couche modale (intro, plan) et le
 * restitue à l'élément d'origine à la fermeture. Sans cela, la tabulation
 * peut sortir du dialogue et atteindre la scène 3D, pourtant décorative.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  ref: RefObject<T | null>,
  onEscape?: () => void,
): void {
  const onEscapeRef = useRef(onEscape)
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      )

    const first = focusables()[0]
    first?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault()
        onEscapeRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const current = document.activeElement

      if (event.shiftKey && (current === firstItem || !node.contains(current))) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && (current === lastItem || !node.contains(current))) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      previous?.focus({ preventScroll: true })
    }
  }, [active, ref])
}
