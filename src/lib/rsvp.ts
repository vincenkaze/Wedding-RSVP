import { supabase } from './supabase'

export interface RsvpFormData {
  name: string
  guests: number
  events: string[]
  dietary: string
  message: string
}

export interface RsvpRow {
  id: string
  created_at: string
  name: string
  guests: number
  events: string[]
  dietary: string
  message: string
  source: string
  user_agent: string
}

export async function persistRsvp(data: RsvpFormData): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from('rsvps').insert({
    name: data.name.trim(),
    guests: data.guests,
    events: data.events,
    dietary: data.dietary,
    message: data.message,
    source: 'web',
    user_agent: navigator.userAgent,
  })

  if (error) {
    console.error('RSVP insert failed:', error.message)
  }
}
