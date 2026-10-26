"use client"

import * as React from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/src/components/ui/combobox"
import { cn } from "@/src/shared/lib/utils"
import type { EntityComboboxOption } from "@/src/components/entity-combobox"

export type EntityMultiComboboxProps = {
  options: EntityComboboxOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-label"?: string
}

export function EntityMultiCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione…",
  emptyText = "Nenhum resultado",
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: EntityMultiComboboxProps) {
  const anchor = useComboboxAnchor()
  const selected = React.useMemo(
    () => options.filter((item) => value.includes(item.id)),
    [options, value],
  )

  return (
    <Combobox
      multiple
      autoHighlight
      items={options}
      value={selected}
      onValueChange={(items) => {
        onValueChange((items ?? []).map((item) => item.id))
      }}
      itemToStringLabel={(item) => item.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
    >
      <ComboboxChips
        ref={anchor}
        id={id}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={cn("w-full", className)}
      >
        <ComboboxValue>
          {(values: EntityComboboxOption[]) => (
            <React.Fragment>
              {values.map((item) => (
                <ComboboxChip key={item.id}>{item.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                disabled={disabled}
                placeholder={values.length === 0 ? placeholder : undefined}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
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
