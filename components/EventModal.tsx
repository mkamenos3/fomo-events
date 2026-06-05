'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Event, TicketTier, Order } from '@/types'

interface Props {
  event: Event
  onClose: () => void
}

type Step = 'detail' | 'checkout' | 'confirm'

export default function EventModal({ event, onClose }: Props) {
  const [tiers, setTiers] = useState<TicketTier[]>([])
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState<Step>('detail')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('ticket_tiers')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setTiers(data)
          setSelectedTier(data[0] ?? null)
        }
      })

    // lock body scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [event.id])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTier) return
    setSubmitting(true)
    setError('')

    const order: Order = {
      event_id: event.id,
      tier_id: selectedTier.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || undefined,
      quantity,
      total: selectedTier.price * quantity,
    }

    const { data, error: err } = await supabase
      .from('orders')
      .insert(order)
      .select('reference')
      .single()

    setSubmitting(false)
    if (err) {
      setError('Something went wrong. Please try again.')
      return
    }
    setOrderRef(data?.reference ?? 'FOMO-' + Math.random().toString(36).slice(2,10).toUpperCase())
    setStep('confirm')
  }

  const total = selectedTier ? selectedTier.price * quantity : 0

  return (
    <div
      className="animate-fade-in modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          background: '#111',
          borderRadius: '24px 24px 0 0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero gradient header */}
        <div style={{
          position: 'relative',
          height: 200,
          background: `linear-gradient(145deg, #${event.grad_from}, #${event.grad_to})`,
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(17,17,17,0.9) 100%)',
          }} />
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
            }}
          >
            ×
          </button>
          {/* Back button for checkout */}
          {step === 'checkout' && (
            <button
              onClick={() => setStep('detail')}
              style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100, padding: '6px 14px',
                color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
          {/* Emoji */}
          <div style={{
            position: 'absolute', bottom: 20, left: 24, fontSize: 56,
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
          }}>
            {event.emoji}
          </div>
          {/* Badge */}
          {event.is_featured && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              borderRadius: 100, padding: '3px 12px',
              fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#fff',
            }}>
              ⚡ FEATURED
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* DETAIL STEP */}
          {step === 'detail' && (
            <div style={{ padding: '24px 28px 32px' }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {event.city_label} · {event.venue}
                </span>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 6 }}>{event.name}</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>
                {event.description}
              </p>

              {/* Info row */}
              <div style={{
                display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24,
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}>
                {[
                  { icon: '📅', label: event.date_label },
                  { icon: '📍', label: event.venue },
                  { icon: '🎟️', label: `From €${event.price_from}` },
                  { icon: '👥', label: `${event.capacity} capacity` },
                ].map(item => (
                  <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                  {event.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 12px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Lineup */}
              {event.lineup && Array.isArray(event.lineup) && event.lineup.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                    Lineup
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {event.lineup.map((artist: { name: string; role?: string; time?: string }, i: number) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                      }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{artist.name}</span>
                          {artist.role && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{artist.role}</span>}
                        </div>
                        {artist.time && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{artist.time}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket Tiers */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Tickets
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {tiers.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                      Loading tiers…
                    </div>
                  ) : tiers.map(tier => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 14,
                        border: selectedTier?.id === tier.id
                          ? `1px solid rgba(168,85,247,0.6)`
                          : '1px solid var(--border)',
                        background: selectedTier?.id === tier.id
                          ? 'rgba(168,85,247,0.12)'
                          : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{tier.name}</span>
                          {tier.is_low_stock && (
                            <span style={{
                              padding: '2px 8px', borderRadius: 100,
                              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                              fontSize: 10, fontWeight: 700, color: '#fca5a5',
                            }}>
                              🔥 Low stock
                            </span>
                          )}
                        </div>
                        {tier.description && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tier.description}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>€{tier.price}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tier.available} left</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quantity + CTA */}
                {selectedTier && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      border: '1px solid var(--border)', borderRadius: 12,
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{
                          width: 44, height: 52, background: 'rgba(255,255,255,0.06)',
                          border: 'none', borderRight: '1px solid var(--border)',
                          color: '#fff', fontSize: 20, cursor: 'pointer', fontWeight: 300,
                        }}
                      >−</button>
                      <span style={{ width: 44, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(10, q + 1))}
                        style={{
                          width: 44, height: 52, background: 'rgba(255,255,255,0.06)',
                          border: 'none', borderLeft: '1px solid var(--border)',
                          color: '#fff', fontSize: 20, cursor: 'pointer',
                        }}
                      >+</button>
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      style={{
                        flex: 1, height: 52,
                        background: `linear-gradient(135deg, #${event.grad_from}, #${event.grad_to})`,
                        border: 'none', borderRadius: 12,
                        color: '#fff', fontSize: 15, fontWeight: 800,
                        cursor: 'pointer', letterSpacing: '-0.3px',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      Buy {quantity} ticket{quantity > 1 ? 's' : ''} · €{total}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHECKOUT STEP */}
          {step === 'checkout' && selectedTier && (
            <form onSubmit={handleCheckout} style={{ padding: '24px 28px 32px' }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>
                Almost there 🎉
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                {quantity}× {selectedTier.name} · {event.name} · €{total}
              </p>

              {[
                { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Your name on the ticket', required: true },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com', required: true },
                { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+357 ...', required: false },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 10, color: '#fff', fontSize: 15,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.target.style.borderColor = `rgba(168,85,247,0.6)`)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              ))}

              {/* Order summary */}
              <div style={{
                margin: '24px 0',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>{selectedTier.name} × {quantity}</span>
                  <span style={{ fontSize: 14 }}>€{total}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 900 }}>€{total}</span>
                  </div>
                </div>
              </div>

              {error && (
                <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', height: 56,
                  background: submitting
                    ? 'rgba(255,255,255,0.1)'
                    : `linear-gradient(135deg, #${event.grad_from}, #${event.grad_to})`,
                  border: 'none', borderRadius: 14,
                  color: '#fff', fontSize: 16, fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.3px', transition: 'all 0.2s',
                }}
              >
                {submitting ? '⏳ Processing...' : `Confirm & Pay €${total}`}
              </button>

              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
                🔒 Secure checkout · Instant confirmation by email
              </p>
            </form>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <div style={{ padding: '40px 28px 48px', textAlign: 'center' }}>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🎊</div>
              <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>You&apos;re in!</h3>
              <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
                {quantity} ticket{quantity > 1 ? 's' : ''} for <strong style={{ color: '#fff' }}>{event.name}</strong> confirmed.
                Check your email for details.
              </p>

              <div style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                borderRadius: 16, marginBottom: 32,
              }}>
                <p style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Booking Reference
                </p>
                <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: '#fff' }}>
                  {orderRef}
                </p>
              </div>

              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, rgba(${parseInt(event.grad_from.slice(0,2),16)},${parseInt(event.grad_from.slice(2,4),16)},${parseInt(event.grad_from.slice(4,6),16)}, 0.15), rgba(${parseInt(event.grad_to.slice(0,2),16)},${parseInt(event.grad_to.slice(2,4),16)},${parseInt(event.grad_to.slice(4,6),16)}, 0.15))`,
                borderRadius: 14,
                border: `1px solid rgba(255,255,255,0.1)`,
                marginBottom: 24,
              }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{event.emoji} {event.name}</p>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>{event.date_label} · {event.venue}</p>
              </div>

              <button
                onClick={onClose}
                style={{
                  padding: '14px 48px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border)',
                  borderRadius: 100,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back to Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
