export type EventCategory = 'Social' | 'Academic' | 'Club' | 'Admin' | string;

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  category: EventCategory;
  description: string;
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseEventsCsv(csv: string): Event[] {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const indexOf = (names: string[]): number => names.map(normalizeHeader).map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
  const nameIndex = indexOf(['eventname', 'name']);
  const dateIndex = indexOf(['date']);
  const timeIndex = indexOf(['time']);
  const categoryIndex = indexOf(['category']);
  const descriptionIndex = indexOf(['description', 'details']);

  return rows.slice(1).flatMap((row, index) => {
    const event: Event = {
      id: `${row[dateIndex] ?? 'event'}-${row[nameIndex] ?? index}`,
      name: row[nameIndex] ?? '',
      date: row[dateIndex] ?? '',
      time: row[timeIndex] ?? '',
      category: row[categoryIndex] ?? 'Other',
      description: row[descriptionIndex] ?? '',
    };

    return event.name && event.date ? [event] : [];
  });
}

export function isUpcoming(event: Event, today = new Date()): boolean {
  const eventDate = new Date(`${event.date}T${event.time || '23:59'}`);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return !Number.isNaN(eventDate.getTime()) && eventDate >= startOfToday;
}

export function eventTimestamp(event: Event): number {
  return new Date(`${event.date}T${event.time || '00:00'}`).getTime();
}
