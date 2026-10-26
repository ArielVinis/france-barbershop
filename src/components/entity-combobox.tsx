"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/components/ui/combobox"
import { cn } from "@/src/shared/lib/utils"

export type EntityComboboxOption = {
  id: string
  name: string
}

export type EntityComboboxProps = {
  options: EntityComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  extraOption?: EntityComboboxOption
  allowClear?: boolean
  disabled?: boolean
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-label"?: string
}

export function EntityCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Pesquisar…",
  emptyText = "Nenhum resultado",
  extraOption,
  allowClear = false,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: EntityComboboxProps) {
  const items = extraOption ? [extraOption, ...options] : options
  const selected = items.find((item) => item.id === value) ?? null
  const showClear =
    Boolean(selected) &&
    (allowClear ||
      (extraOption != null && selected?.id !== extraOption.id) ||
      (extraOption != null && selected?.id === extraOption.id && allowClear))

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(item) => {
        if (!item) {
          onValueChange(extraOption?.id ?? (allowClear ? "" : value))
          return
        }
        onValueChange(item.id)
      }}
      itemToStringLabel={(item) => item.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        showClear={showClear}
        className={cn("w-full", className)}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
