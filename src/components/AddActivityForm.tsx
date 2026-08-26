import { useState } from 'react'
import type { FormEvent } from 'react'

interface AddActivityFormProps {
  onAdd: (name: string) => void
}

export function AddActivityForm({ onAdd }: AddActivityFormProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <form className="add-activity-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ny aktivitet, t.ex. Löpning"
        aria-label="Aktivitetsnamn"
      />
      <button type="submit" className="btn btn-primary">
        Lägg till
      </button>
    </form>
  )
}
