import { useState, useMemo } from 'react';

interface TicketProgressProps {
  ticketsSold: number;
  maxTickets: number;
  maxTicketsBuffer: number;
  priceInCents: number;
  eventId: string;
}

type Phase = 'available' | 'buffer' | 'soldout';

export default function TicketProgress({
  ticketsSold,
  maxTickets,
  maxTicketsBuffer,
  priceInCents,
  eventId,
}: TicketProgressProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phase: Phase = useMemo(() => {
    if (ticketsSold >= maxTickets + maxTicketsBuffer) return 'soldout';
    if (ticketsSold >= maxTickets) return 'buffer';
    return 'available';
  }, [ticketsSold, maxTickets, maxTicketsBuffer]);

  const progressPercent = useMemo(() => {
    if (phase === 'available') {
      return Math.min((ticketsSold / maxTickets) * 100, 100);
    }
    return 100;
  }, [ticketsSold, maxTickets, phase]);

  const ticketsRemaining = useMemo(() => {
    if (phase === 'available') return maxTickets - ticketsSold;
    if (phase === 'buffer') return maxTickets + maxTicketsBuffer - ticketsSold;
    return 0;
  }, [phase, ticketsSold, maxTickets, maxTicketsBuffer]);

  const barColor = useMemo(() => {
    switch (phase) {
      case 'available':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'buffer':
        return 'bg-gradient-to-r from-amber-400 to-orange-500';
      case 'soldout':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
    }
  }, [phase]);

  const priceFormatted = `₹${(priceInCents / 100).toLocaleString('en-IN')}`;

  const isFormValid = name.trim() !== '' && email.trim() !== '' && whatsapp.trim() !== '' && agreed;

  // Price Breakdown JSON as requested
  const priceBreakdown = {
    "Base Ticket": 300,
    "Parking Pass": 100,
    "F&B Voucher": 50,
    "GST (18%)": 49
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          priceInCents,
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Redirect to PhonePe payment page
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initiate payment.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Ticket Counter */}
      <div className="text-center mb-4">
        {phase === 'soldout' ? (
          <p
            className="text-5xl md:text-7xl text-red-600 tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            SOLD OUT
          </p>
        ) : (
          <p
            className="text-5xl md:text-7xl text-black tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            {ticketsRemaining}{' '}
            <span className="text-2xl md:text-3xl text-gray-700">
              {phase === 'buffer' ? 'buffer tickets' : 'tickets'} left
            </span>
          </p>
        )}
      </div>

      {/* Phase 2 subtext */}
      {phase === 'buffer' && (
        <p className="text-center text-sm md:text-base text-amber-800 font-semibold mb-4 bg-amber-100 border-[3px] border-amber-500 p-3 shadow-[3px_3px_0px_#000]">
          🎉 Capacity is full, but we're still accepting a few more because we don't want you to miss
          out on the fun!
        </p>
      )}

      {/* Progress Bar — Brutalist */}
      <div className="bg-white border-[4px] border-black shadow-[4px_4px_0px_#000] p-1">
        <div
          className={`h-8 ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
        <span>{Math.min(ticketsSold, maxTickets)} booked</span>
        <span>{maxTickets} total</span>
      </div>

      {/* Checkout Form — only in Phase 1 & 2 */}
      {phase !== 'soldout' && (
        <form onSubmit={handleSubmit} className="mt-10">
          <h3
            className="text-3xl md:text-4xl text-black mb-6 tracking-tight"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            GRAB YOUR TICKET
          </h3>

          <div className="grid gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="ticket-name"
                className="block text-xs font-black text-black uppercase tracking-widest mb-2"
              >
                Full Name
              </label>
              <input
                id="ticket-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-white border-[3px] border-black text-black font-bold focus:outline-none focus:bg-pink-50 placeholder-gray-400 shadow-[4px_4px_0px_#000] transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="ticket-email"
                className="block text-xs font-black text-black uppercase tracking-widest mb-2"
              >
                Email Address
              </label>
              <input
                id="ticket-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border-[3px] border-black text-black font-bold focus:outline-none focus:bg-pink-50 placeholder-gray-400 shadow-[4px_4px_0px_#000] transition-colors"
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label
                htmlFor="ticket-whatsapp"
                className="block text-xs font-black text-black uppercase tracking-widest mb-2"
              >
                WhatsApp Number
              </label>
              <input
                id="ticket-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-white border-[3px] border-black text-black font-bold focus:outline-none focus:bg-pink-50 placeholder-gray-400 shadow-[4px_4px_0px_#000] transition-colors"
                required
              />
            </div>

            {/* Agreement Checkbox */}
            <label
              htmlFor="ticket-agree"
              className="flex items-start gap-3 p-4 bg-yellow-100 border-[3px] border-black cursor-pointer select-none shadow-[3px_3px_0px_#000] hover:bg-yellow-200 transition-colors"
            >
              <input
                id="ticket-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-pink-500 shrink-0"
              />
              <span className="text-sm font-semibold text-black leading-snug">
                I agree that this is a <strong>family-friendly, no-alcohol event</strong>. I will
                respect all attendees and follow the venue rules.
              </span>
            </label>

            {/* Price Breakdown */}
            <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_#000]">
              <h4 className="text-black font-black uppercase tracking-widest mb-3" style={{ fontFamily: "'Anton', sans-serif" }}>Order Summary</h4>
              <div className="space-y-2 text-sm font-semibold text-gray-700">
                {Object.entries(priceBreakdown).map(([item, amount]) => (
                  <div key={item} className="flex justify-between border-b border-gray-200 pb-1">
                    <span>{item}</span>
                    <span>₹{amount}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-black font-black text-lg">
                  <span>Total</span>
                  <span>{priceFormatted}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full py-5 text-xl font-black uppercase tracking-wider border-[4px] border-black transition-all ${
                isFormValid && !submitting
                  ? 'bg-pink-500 text-white shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                  : 'bg-gray-300 text-gray-500 shadow-[4px_4px_0px_#999] cursor-not-allowed'
              }`}
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {submitting ? (
                '⏳ PROCESSING...'
              ) : (
                <>🎟️ BOOK MY SPOT — {priceFormatted}</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Sold Out Message */}
      {phase === 'soldout' && (
        <div className="mt-10 text-center p-8 bg-red-50 border-[4px] border-red-500 shadow-[4px_4px_0px_#000]">
          <p
            className="text-2xl text-red-600 mb-2"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            ALL TICKETS ARE GONE!
          </p>
          <p className="text-sm text-red-800 font-semibold">
            Follow us on Instagram{' '}
            <a
              href="https://instagram.com/hammaadworks"
              className="underline text-pink-600 hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              @hammaadworks
            </a>{' '}
            for future events.
          </p>
        </div>
      )}
    </div>
  );
}
