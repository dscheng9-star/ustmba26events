import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, ExternalLink, LoaderCircle, Menu, RefreshCw, Sparkles, Users, X } from 'lucide-react';
import { eventTimestamp, isUpcoming, parseEventsCsv, type Event } from '@/lib/csv';

const SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv&sheet=Events'; // TODO: Replace with the published Events tab CSV URL.
const GOOGLE_FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/YOUR_FORM_ID/viewform'; // TODO: Replace with the Google Form URL.

const categories = ['All', 'Social', 'Academic', 'Club', 'Admin'] as const;
type CategoryFilter = (typeof categories)[number];

const sampleEvents: Event[] = [
  { id: 'sample-1', name: 'Cohort Welcome Drinks', date: '2026-09-03', time: '18:30', category: 'Social', description: 'Meet your cohort over drinks and small plates at The Foundry.', link: '', location: 'The Foundry, King’s Cross', contact: '' },
  { id: 'sample-2', name: 'Case Interview Workshop', date: '2026-09-08', time: '17:30', category: 'Academic', description: 'A practical session on structuring cases with second-year mentors.', link: '', location: 'Seminar Room B, Business School', contact: '' },
  { id: 'sample-3', name: 'Sailing Club Taster', date: '2026-09-12', time: '10:00', category: 'Club', description: 'Try something new on the water. No previous experience needed.', link: '', location: 'Royal Yacht Club Marina', contact: '' },
  { id: 'sample-4', name: 'Programme Town Hall', date: '2026-09-16', time: '12:30', category: 'Admin', description: 'Important programme updates, followed by an open Q&A.', link: '', location: '', contact: '' },
];

function formatDate(date: string): { day: string; month: string; weekday: string; full: string } {
  const parsed = new Date(`${date}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(parsed),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(parsed).toUpperCase(),
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(parsed),
    full: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed),
  };
}

function CategoryBadge({ category }: { category: string }) {
  return <span className={`category-badge category-${category.toLowerCase()}`}>{category}</span>;
}

function linkLabel(link: string): string {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    if (host.includes('wa.me') || host.includes('whatsapp.com')) return 'Join WhatsApp chat';
    if (host.includes('chat.whatsapp.com')) return 'Join WhatsApp group';
    if (host.includes('maps.google') || host.includes('maps.app.goo.gl')) return 'Open in Google Maps';
    if (host.includes('google.com') && host.includes('calendar')) return 'Add to Google Calendar';
    if (host.includes('zoom.us')) return 'Join Zoom meeting';
    if (host.includes('teams.microsoft.com')) return 'Join Teams meeting';
    if (host.includes('meet.google.com')) return 'Join Google Meet';
    if (host.includes('eventbrite.com')) return 'View on Eventbrite';
    if (host.includes('lu.ma') || host.includes('luma')) return 'View on Luma';
    if (host.includes('forms.gle') || (host.includes('google.com') && host.includes('forms'))) return 'Open Google Form';
    if (host.includes('docs.google.com')) return 'Open Google Doc';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'Watch on YouTube';
    if (host.includes('instagram.com')) return 'View on Instagram';
    if (host.includes('facebook.com')) return 'View on Facebook';
    if (host.includes('linkedin.com')) return 'View on LinkedIn';
    if (host.includes('slack.com')) return 'Open in Slack';
    if (host.includes('discord.com') || host.includes('discord.gg')) return 'Join Discord server';
    if (host.includes('t.me')) return 'Open Telegram channel';
    return `Open ${host}`;
  } catch {
    return 'Open link';
  }
}

function EventLink({ link }: { link: string }) {
  if (!link) return null;

  try {
    const url = new URL(link);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
  } catch {
    return null;
  }

  return <a className="event-link-button" href={link} target="_blank" rel="noreferrer">{linkLabel(link)} <ArrowUpRight size={15} /></a>;
}

function EventLocation({ location }: { location: string }) {
  if (!location) return null;
  return <div className="event-location">📍 {location}</div>;
}

function EventContact({ contact }: { contact: string }) {
  if (!contact) return null;
  return <div className="event-contact">👤 {contact}</div>;
}

function EventDate({ date, prominent = false }: { date: string; prominent?: boolean }) {
  const formatted = formatDate(date);
  return (
    <div className={prominent ? 'date-block date-block-large' : 'date-block'}>
      <span>{formatted.month}</span>
      <strong>{formatted.day}</strong>
    </div>
  );
}

function NextEventCard({ event }: { event: Event }) {
  const formatted = formatDate(event.date);
  return (
    <article className="next-event-card">
      <div className="next-event-accent" />
      <div className="next-event-content">
        <div className="eyebrow"><Sparkles size={14} /> NEXT UP</div>
        <div className="next-event-main">
          <EventDate date={event.date} prominent />
          <div className="next-event-copy">
            <div className="event-meta"><CategoryBadge category={event.category} /><span>{formatted.weekday}</span></div>
            <h2>{event.name}</h2>
            <EventLocation location={event.location} />
            <p style={{ whiteSpace: 'pre-wrap' }}>{event.description || 'More details will be shared soon.'}</p>
            <EventContact contact={event.contact} />
            <div className="event-time"><Clock3 size={15} /> {event.time || 'Time TBC'} <span>•</span> {formatted.full}</div>
            <EventLink link={event.link} />
          </div>
        </div>
      </div>
      <div className="next-event-ring ring-one" />
      <div className="next-event-ring ring-two" />
    </article>
  );
}

function NextUp({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  if (events.length === 1) return <NextEventCard event={events[0]} />;
  return (
    <div className="next-up-carousel" role="region" aria-label="Next up events">
      {events.map((event) => (
        <div className="next-up-carousel-slide" key={event.id}>
          <NextEventCard event={event} />
        </div>
      ))}
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  const formatted = formatDate(event.date);
  return (
    <article className="event-row">
      <EventDate date={event.date} />
      <div className="event-row-copy">
        <div className="event-meta"><CategoryBadge category={event.category} /><span>{formatted.weekday}</span></div>
        <h3>{event.name}</h3>
        <EventLocation location={event.location} />
        {event.description && <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>}
        <EventContact contact={event.contact} />
        <EventLink link={event.link} />
      </div>
      <div className="event-row-time"><Clock3 size={15} />{event.time || 'TBC'}<ChevronRight size={17} /></div>
    </article>
  );
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    setUsingSampleData(false);
    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error('The event sheet could not be reached.');
      const parsedEvents = parseEventsCsv(await response.text()).filter((event) => isUpcoming(event)).sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
      setEvents(parsedEvents);
    } catch {
      setError('We could not load the live sheet right now. Showing a preview so you can still explore the dashboard.');
      setUsingSampleData(true);
      setEvents(sampleEvents.filter((event) => isUpcoming(event)).sort((a, b) => eventTimestamp(a) - eventTimestamp(b)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadEvents(); }, []);

  const visibleEvents = useMemo(() => filter === 'All' ? events : events.filter((event) => event.category.toLowerCase() === filter.toLowerCase()), [events, filter]);
  const nextDayEvents = useMemo(() => {
    if (visibleEvents.length === 0) return [];
    const earliestDate = visibleEvents[0].date;
    return visibleEvents.filter((event) => event.date === earliestDate);
  }, [visibleEvents]);
  const laterEvents = useMemo(() => visibleEvents.slice(nextDayEvents.length), [visibleEvents, nextDayEvents]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="MBA Cohort home"><span className="brand-mark"><Users size={19} /></span><span><strong>MBA</strong><em>COHORT</em></span></a>
        <nav className={menuOpen ? 'header-nav nav-open' : 'header-nav'}>
          <a href="#events" onClick={() => setMenuOpen(false)}>Events</a>
          <a className="header-submit" href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Submit an event <ExternalLink size={14} /></a>
        </nav>
        <button className="menu-button" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </header>

      <main>
        <section className="events-section" id="events">
          <div className="section-heading"><div><span className="section-kicker">THE CALENDAR</span><h2>What’s coming up</h2></div><button className="refresh-button" type="button" onClick={() => void loadEvents()} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh</button></div>
          {error && <div className="notice"><span>{usingSampleData ? 'Preview mode' : 'Notice'}</span>{error}</div>}
          <div className="filters" role="group" aria-label="Filter events by category">{categories.map((category) => <button key={category} className={filter === category ? 'filter-button active' : 'filter-button'} type="button" onClick={() => setFilter(category)}>{filter === category && <Check size={14} />}{category}</button>)}</div>
          {loading ? <div className="loading-state"><LoaderCircle className="spin" size={26} /><span>Checking the calendar…</span></div> : visibleEvents.length === 0 ? <div className="empty-state"><CalendarDays size={28} /><h3>No {filter === 'All' ? '' : filter.toLowerCase()} events coming up</h3><p>Check back soon or suggest one for the cohort.</p></div> : <><NextUp events={nextDayEvents} />{laterEvents.length > 0 && <div className="later-events"><div className="list-heading"><span>MORE ON THE HORIZON</span><span>{laterEvents.length} {laterEvents.length === 1 ? 'event' : 'events'}</span></div><div className="event-list">{laterEvents.map((event) => <EventRow event={event} key={event.id} />)}</div></div>}</>}
        </section>

        <section className="cta-section"><div><span className="section-kicker">MAKE IT HAPPEN</span><h2>Got something<br /><i>to share?</i></h2></div><a className="outline-button" href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer">Submit an event <ArrowUpRight size={17} /></a></section>
      </main>
      <footer><a className="brand footer-brand" href="/"><span className="brand-mark"><Users size={17} /></span><span><strong>MBA</strong><em>COHORT</em></span></a><span>Built for the moments that matter.</span><span>© 2026</span></footer>
    </div>
  );
}

export default App;
