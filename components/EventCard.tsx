'use client'
import { useState } from 'react'
import { Event } from '@/types'

interface Props {
  event: Event
  onClick: () => void
}

export default function EventCard({ event, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const soldPct = Math.min(Math.round((event.attending / event.capacity) * 100), 100)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        height: 340,
        background: `linear-gradient(145deg, #${event.grad_from}, #${event.grad_to})`,
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.3s ease',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)`
          : `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`,
        userSelect: 'none',
      }}
    >
      {/* Gradient overlay for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        transition: 'opacity 0.3s',
        opacity: hovered ? 0.9 : 0.7,
      }} />

      {/* Noise texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
      }} />

      {/* Featured badge */}
      {event.is_featured && (
        <div style={{
          position: 'absolute', top: 16, left: 16,
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          borderRadius: 100, padding: '4px 12px',
          fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
          color: '#fff', textTransform: 'uppercase',
          zIndex: 3,
        }}>
          ⚡ Featured
        </div>
      )}

      {/* Category badge */}
      {event.badge_label && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 100, padding: '4px 12px',
          fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 3,
        }}>
          {event.badge_label}
        </div>
      )}

      {/* Emoji */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -60%) scale(${hovered ? 1.15 : 1})`,
        transition: 'transform 0.3s ease',
        fontSize: 64,
        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
        zIndex: 2,
      }}>
        {event.emoji}
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 20px 22px',
        zIndex: 3,
      }}>
        <h3 style={{
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: '-0.5px',
          color: '#fff',
          marginBottom: 6,
          textShadow: '0 1px 8px rgba(0,0,0,0.4)',
        }}>
          {event.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            📍 {event.city_label}
          </span>
          <span style={{
            width: 3, height: 3, borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)', flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            📅 {event.date_label}
          </span>
        </div>

        {/* Capacity bar */}
        {soldPct > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${soldPct}%`,
                background: soldPct > 80
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : 'rgba(255,255,255,0.7)',
                borderRadius: 2,
              }} />
            </div>
            {soldPct > 60 && (
              <p style={{ fontSize: 10, color: soldPct > 80 ? '#fca5a5' : 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 600 }}>
                {soldPct > 80 ? '🔥 Selling fast' : `${100 - soldPct}% remaining`}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
          }}>
            From €{event.price_from}
          </span>
          <button style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            Get Tickets →
          </button>
        </div>
      </div>
    </div>
  )
}
