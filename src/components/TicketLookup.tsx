import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

interface TicketResult {
  id: string;
  email: string;
  created_at: string;
}

export default function TicketLookup() {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<TicketResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'not-found') {
      setUrlError(true);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setSearched(false);
    setUrlError(false);

    try {
      const { data, error } = await supabase
        .from('finals_tickets')
        .select('id, email, created_at')
        .eq('payment_status', 'paid')
        .or(`email.eq.${searchValue.trim()},whatsapp.eq.${searchValue.trim()}`);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Lookup failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div>
      {/* URL Error Banner */}
      {urlError && (
        <div
          className="mb-8 p-4 bg-red-100 border-[3px] border-black shadow-[4px_4px_0px_#000] text-center"
          role="alert"
        >
          <p className="text-black font-black uppercase tracking-widest text-sm">
            ⚠️ Ticket not found or invalid link.
          </p>
          <p className="text-gray-700 text-xs mt-1 font-medium">
            The link you used may be expired or incorrect. Try searching below.
          </p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] p-6 md:p-8">
          <label
            htmlFor="ticket-search"
            className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3"
          >
            Email or WhatsApp Number
          </label>
          <input
            id="ticket-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="e.g. you@email.com or 9876543210"
            className="w-full px-4 py-4 bg-white border-[3px] border-black text-black text-lg font-bold focus:outline-none focus:bg-yellow-50 placeholder-gray-400 shadow-[3px_3px_0px_#000] transition-colors mb-4"
          />
          <button
            type="submit"
            disabled={loading || !searchValue.trim()}
            className="w-full px-6 py-4 bg-yellow-300 text-black border-[3px] border-black font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin"></span>
                SEARCHING...
              </span>
            ) : (
              '🔍 FIND MY TICKET'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="space-y-4">
          <p
            className="text-sm font-black uppercase tracking-widest text-black mb-4 bg-green-400 border-[3px] border-black shadow-[3px_3px_0px_#000] px-4 py-2 inline-block"
          >
            🎫 {results.length} TICKET{results.length > 1 ? 'S' : ''} FOUND
          </p>
          {results.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border-[4px] border-black shadow-[6px_6px_0px_#000] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#000] transition-all"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                  Attendee
                </p>
                <p className="text-lg font-bold text-black mb-2">
                  {maskEmail(ticket.email)}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Purchased{' '}
                  {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <a
                href={`/ticket/${ticket.id}`}
                className="px-6 py-3 bg-pink-400 text-black border-[3px] border-black font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all shrink-0 text-center no-underline"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                VIEW TICKET →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Not Found */}
      {searched && results.length === 0 && (
        <div className="bg-white border-[4px] border-black border-dashed shadow-[4px_4px_0px_#000] p-8 text-center">
          <div className="text-4xl mb-3">😕</div>
          <p
            className="text-xl font-black text-black uppercase tracking-tight mb-2"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            No Ticket Found
          </p>
          <p className="text-sm text-gray-600 font-medium">
            Double-check your email or WhatsApp number. If you recently purchased, it may take a moment to process.
          </p>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            Still having issues? DM us on{' '}
            <a
              href="https://x.com/hammaadworks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline decoration-[2px] font-bold"
            >
              X (@hammaadworks)
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
