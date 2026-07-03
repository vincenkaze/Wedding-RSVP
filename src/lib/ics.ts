import { couple } from '../content/content'

interface ICSData {
  title: string
  start: string
  end: string
  location: string
  description: string
}

function foldLine(line: string): string {
  const max = 75
  if (line.length <= max) return line
  let result = line.slice(0, max)
  let rest = line.slice(max)
  while (rest.length > 0) {
    result += '\r\n ' + rest.slice(0, max - 1)
    rest = rest.slice(max - 1)
  }
  return result
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function generateICS(data: ICSData): string {
  const now = new Date()
  const dtstamp =
    now.getUTCFullYear() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    'T' +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0') +
    'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${couple.displayName} Wedding//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${data.start}`,
    `DTEND:${data.end}`,
    `DTSTAMP:${dtstamp}`,
    `UID:${data.start}-${couple.displayName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}@wedding`,
    `SUMMARY:${escapeText(data.title)}`,
    `LOCATION:${escapeText(data.location)}`,
    `DESCRIPTION:${escapeText(data.description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.map(foldLine).join('\r\n')
}

export function downloadICS(data: ICSData): void {
  const icsContent = generateICS(data)
  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${couple.displayName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
