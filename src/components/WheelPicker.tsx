import { useEffect, useRef } from 'react'

const ITEM_HEIGHT = 40
const VISIBLE_COUNT = 5
const PADDING = ((VISIBLE_COUNT - 1) / 2) * ITEM_HEIGHT

export interface WheelPickerOption {
  value: string
  label: string
}

interface WheelPickerProps {
  options: WheelPickerOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

export function WheelPicker({ options, value, onChange, ariaLabel }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const index = options.findIndex((o) => o.value === value)
    if (index === -1) return
    const target = index * ITEM_HEIGHT
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTop = target
    }
  }, [value, options])

  function settleToNearest() {
    const el = scrollRef.current
    if (!el) return
    const index = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)))
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
    const selected = options[index]
    if (selected && selected.value !== value) {
      onChange(selected.value)
    }
  }

  function handleScroll() {
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
    scrollTimeout.current = window.setTimeout(settleToNearest, 120)
  }

  function handleOptionClick(index: number) {
    scrollRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
  }

  return (
    <div className="wheel-picker" style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}>
      <div className="wheel-picker-highlight" style={{ height: ITEM_HEIGHT, top: PADDING }} />
      <div
        className="wheel-picker-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ paddingTop: PADDING, paddingBottom: PADDING }}
        role="listbox"
        aria-label={ariaLabel}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            className={`wheel-picker-item ${option.value === value ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT }}
            onClick={() => handleOptionClick(index)}
            role="option"
            aria-selected={option.value === value}
          >
            {option.label}
          </div>
        ))}
      </div>
      <div className="wheel-picker-fade wheel-picker-fade-top" />
      <div className="wheel-picker-fade wheel-picker-fade-bottom" />
    </div>
  )
}
