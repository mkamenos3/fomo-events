'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types'
import EventCard from '@/components/EventCard'
import EventModal from '@/components/EventModal'

const CATEGORIES = [
  { key: 'all', label: 'All Events' },
  { key: 'festival', label: '🎪 Festivals' },
  { key: 'nightlife', label: '🌙 Nightlife' },
  { key: 'beach', label: '🏖️ Beach' },
  { key: 'music', label: '🎵 Music' },
]

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_sort', { ascending: true })
      if (!error && data) setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  const filtered = category === 'all'
    ? events
    : events.filter(e => e.category === category)

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>FOMO</span>
              <span style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                borderRadius: 6, padding: '2px 8px',
                fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#fff',
                textTransform: 'uppercase',
              }}>Cyprus</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
              {events.length} events this summer
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
        <div className="animate-fade-in-up">
          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 88px)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-3px',
            marginBottom: 20,
          }}>
            Don&apos;t miss<br />
            <span style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>a single thing.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 480, lineHeight: 1.6, marginBottom: 40 }}>
            The best parties, festivals &amp; live events across Cyprus this summer. Before it sells out.
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 100,
                border: category === cat.key
                  ? '1px solid rgba(168,85,247,0.6)'
                  : '1px solid var(--border)',
                background: category === cat.key
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))'
                  : 'rgba(255,255,255,0.04)',
                color: category === cat.key ? '#fff' : 'var(--muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: 0.3,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: 340,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.04)',
                animation: 'pulse-slow 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div
            className="stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {filtered.map(event => (
              <div
                key={event.id}
                className="animate-fade-in-up"
                style={{ opacity: 0 }}
              >
                <EventCard event={event} onClick={() => setSelectedEvent(event)} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
                <p style={{ fontSize: 16 }}>No events in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        marginTop: 80,
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          © 2025 FOMO Cyprus · Made for people who hate missing out
        </p>
      </footer>

      {/* Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </main>
  )
}
