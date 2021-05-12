import React, {cloneElement, forwardRef, useCallback, useMemo, useState} from 'react'
import {isElement} from 'react-is'
import {Popover, PopoverProps} from '../../primitives'
import {ThemeColorSchemeKey} from '../../theme'
import {Placement} from '../../types'
import {MenuProps} from './menu'

export interface MenuButtonProps {
  /**
   * Use `popover={{boundaryElement: ...}}` instead.
   * @deprecated
   */
  boundaryElement?: HTMLElement
  button: React.ReactElement
  id: string
  menu?: React.ReactElement
  /**
   * Use `popover={{placement: ...}}` instead.
   * @deprecated
   */
  placement?: Placement
  popover?: Omit<PopoverProps, 'content' | 'open'>
  /**
   * Use `popover={{scheme: ...}}` instead.
   * @deprecated
   */
  popoverScheme?: ThemeColorSchemeKey
  /**
   * Use `popover={{radius: ...}}` instead.
   * @deprecated
   */
  popoverRadius?: number | number[]
  /**
   * Use `popover={{radius: ...}}` instead.
   *
   * Do not use in production.
   * @beta
   * @deprecated
   */
  portal?: boolean
  /**
   * Use `popover={{preventOverflow: ...}}` instead.
   * @deprecated
   */
  preventOverflow?: boolean
}

export const MenuButton = forwardRef(function MenuButton(
  props: MenuButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement | null>
) {
  const {
    boundaryElement,
    button: buttonProp,
    id,
    menu: menuProp,
    placement,
    popoverScheme,
    portal,
    popover,
    popoverRadius,
    preventOverflow,
  } = props
  const [open, setOpen] = useState(false)
  const [focusLast, setFocusLast] = useState(false)
  const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null)
  const [menuElements, setChildMenuElements] = useState<HTMLElement[]>([])

  const handleButtonClick = useCallback(() => {
    setOpen((v) => !v)
    setFocusLast(false)
  }, [])

  const handleButtonKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setFocusLast(false)

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setFocusLast(true)

      return
    }
  }, [])

  const handleMenuClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (buttonElement && (target === buttonElement || buttonElement.contains(target))) {
        return
      }

      for (const el of menuElements) {
        if (target === el || el.contains(target)) {
          return
        }
      }

      setOpen(false)
    },
    [buttonElement, menuElements]
  )

  const handleMenuEscape = useCallback(() => {
    setOpen(false)
    if (buttonElement) buttonElement.focus()
  }, [buttonElement])

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      const target = event.relatedTarget

      if (!(target instanceof Node)) {
        return
      }

      if (target === buttonElement) {
        return
      }

      for (const el of menuElements) {
        if (el === target || el.contains(target)) {
          return
        }
      }

      setOpen(false)
    },
    [buttonElement, menuElements]
  )

  const handleItemClick = useCallback(() => {
    setOpen(false)
    if (buttonElement) buttonElement.focus()
  }, [buttonElement])

  const registerElement = useCallback((el: HTMLElement) => {
    setChildMenuElements((els) => els.concat([el]))

    return () => {
      setChildMenuElements((els) => {
        return els.filter((_el) => _el !== el)
      })
    }
  }, [])

  const menuProps: MenuProps = useMemo(
    () => ({
      'aria-labelledby': id,
      focusLast,
      onBlurCapture: handleBlur,
      onClickOutside: handleMenuClickOutside,
      onEscape: handleMenuEscape,
      onItemClick: handleItemClick,
      registerElement,
    }),
    [
      focusLast,
      handleMenuClickOutside,
      handleMenuEscape,
      handleItemClick,
      id,
      handleBlur,
      registerElement,
    ]
  )

  const menu = isElement(menuProp) ? cloneElement(menuProp, menuProps) : null

  const setButtonRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        ref.current = el
      }

      setButtonElement(el)
    },
    [ref]
  )

  const button = useMemo(
    () =>
      isElement(buttonProp)
        ? cloneElement(buttonProp, {
            'data-ui': 'MenuButton',
            id,
            onClick: handleButtonClick,
            onKeyDown: handleButtonKeyDown,
            'aria-haspopup': true,
            'aria-expanded': open,
            ref: setButtonRef,
            selected: open,
          })
        : null,
    [buttonProp, handleButtonClick, handleButtonKeyDown, id, open, setButtonRef]
  )

  const popoverProps: PopoverProps = useMemo(() => {
    return {
      boundaryElement,
      placement,
      portal,
      radius: popoverRadius,
      overflow: preventOverflow,
      scheme: popoverScheme,
      ...(popover || {}),
    }
  }, [boundaryElement, placement, popover, popoverRadius, portal, preventOverflow, popoverScheme])

  return (
    <Popover {...popoverProps} content={menu} data-ui="MenuButton__popover" open={open}>
      {button || <></>}
    </Popover>
  )
})
