'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Wallet, Transaction, TransactionStatus } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type FilterKey = 'ALL' | 'COMPLETED' | 'PENDING' | 'WITHDRAWN';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Tout' },
  { key: 'COMPLETED', label: 'Complétées' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'WITHDRAWN', label: 'Retraits' },
];

function formatEuros(n: number): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-${s}` : s;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'STYLIST') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const load = async () => {
      const [walletRes, txRes] = await Promise.all([
        api.get<Wallet>('/wallet'),
        api.get<Transaction[]>('/wallet/transactions'),
      ]);
      if (walletRes.success && walletRes.data) setWallet(walletRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
      setLoading(false);
    };
    if (user?.role === 'STYLIST') load();
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  const handleWithdrawSuccess = async () => {
    const [walletRes, txRes] = await Promise.all([
      api.get<Wallet>('/wallet'),
      api.get<Transaction[]>('/wallet/transactions'),
    ]);
    if (walletRes.success && walletRes.data) setWallet(walletRes.data);
    if (txRes.success && txRes.data) setTransactions(txRes.data);
    setShowWithdraw(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2] px-5">
        <p className="text-sm text-[#8A8A8A]">
          Impossible de charger le portefeuille
        </p>
      </div>
    );
  }

  const feePct = Math.round((wallet.platform_fee_percent || 0.2) * 100);
  const stylistPct = 100 - feePct;

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-serif text-3xl text-[#111111]">Portefeuille</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">
          Vos revenus de stylisme
        </p>
      </header>

      {/* Balance card */}
      <section className="mx-5 bg-[#111111] rounded-3xl p-6 relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, #C6A47E 0%, transparent 70%)',
          }}
        />
        <p className="text-xs uppercase tracking-widest text-[#C6A47E]">
          Solde disponible
        </p>
        <p className="font-serif text-5xl text-white mt-2">
          {formatEuros(wallet.balance)}
          <span className="text-xl text-[#8A8A8A] ml-2">euros</span>
        </p>
        {wallet.pending_balance > 0 && (
          <p className="text-xs text-[#C6A47E] mt-2">
            + {formatEuros(wallet.pending_balance)} euros en attente
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowWithdraw(true)}
          disabled={wallet.balance < 20}
          className="mt-5 w-full rounded-full bg-white text-[#111111] py-3 text-sm font-semibold disabled:opacity-40"
        >
          Retirer les fonds
        </button>
        {wallet.balance < 20 && (
          <p className="text-[10px] text-[#8A8A8A] mt-2 text-center">
            Minimum 20 euros pour un retrait
          </p>
        )}
      </section>

      {/* Stats row */}
      <section className="mt-4 px-5 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
            Total gagn&eacute;
          </p>
          <p className="font-serif text-2xl text-[#111111] mt-1">
            {formatEuros(wallet.total_earned)}
            <span className="text-xs text-[#8A8A8A] ml-1">euros</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
            Ce mois
          </p>
          <p className="font-serif text-2xl text-[#111111] mt-1">
            {formatEuros(wallet.this_month)}
            <span className="text-xs text-[#8A8A8A] ml-1">euros</span>
          </p>
        </div>
      </section>

      {/* Commission info banner */}
      <section className="mt-4 mx-5 bg-[#F0EDE8] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6A47E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#111111]">
              Commission LIEN : {feePct}%
            </p>
            <p className="text-[11px] text-[#8A8A8A] mt-1 leading-relaxed">
              Vous conservez {stylistPct}% de chaque prestation. La commission
              de {feePct}% couvre les frais de plateforme, le paiement s&eacute;curis&eacute;
              et le support client.
            </p>
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="mt-8 px-5">
        <h2 className="font-serif text-lg text-[#111111]">
          Historique des transactions
        </h2>

        {/* Filter tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap ${
                filter === f.key
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#8A8A8A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-sm text-[#8A8A8A]">Aucune transaction</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))
          )}
        </div>
      </section>

      {/* Withdrawal modal */}
      {showWithdraw && (
        <WithdrawModal
          wallet={wallet}
          onClose={() => setShowWithdraw(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}

function statusMeta(status: TransactionStatus): {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Complétée',
        color: '#2E7D32',
        bg: '#E8F5E9',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      };
    case 'PENDING':
      return {
        label: 'En attente',
        color: '#C6A47E',
        bg: '#F0EDE8',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      };
    case 'WITHDRAWN':
      return {
        label: 'Retrait',
        color: '#111111',
        bg: '#F7F5F2',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        ),
      };
    case 'REFUNDED':
      return {
        label: 'Remboursée',
        color: '#B00020',
        bg: '#FDECEA',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        ),
      };
  }
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const meta = statusMeta(tx.status);
  const isWithdrawal = tx.status === 'WITHDRAWN';
  const displayAmount = isWithdrawal ? -Math.abs(tx.net_amount) : tx.net_amount;
  const sign = displayAmount >= 0 ? '+' : '';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-[#111111] truncate">
              {isWithdrawal
                ? 'Retrait'
                : tx.client?.name
                  ? `Session avec ${tx.client.name}`
                  : tx.description || 'Transaction'}
            </p>
            <span
              className="font-serif text-base shrink-0"
              style={{ color: displayAmount >= 0 ? '#111111' : '#B00020' }}
            >
              {sign}
              {formatEuros(displayAmount)} euros
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span
              className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] text-[#8A8A8A]">
              {formatDate(tx.created_at)}
            </span>
          </div>
          {!isWithdrawal && tx.gross_amount > 0 && (
            <p className="text-[10px] text-[#CFCFCF] mt-1.5">
              {Math.round((1 - tx.platform_fee / tx.gross_amount) * 100)}% de{' '}
              {formatEuros(tx.gross_amount)} euros total
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({
  wallet,
  onClose,
  onSuccess,
}: {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Number(amount.replace(',', '.'));
  const valid =
    !Number.isNaN(parsed) && parsed >= 20 && parsed <= wallet.balance;

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    const res = await api.post('/wallet/withdraw', { amount: parsed });
    setSubmitting(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Erreur lors du retrait');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center">
      <div className="w-full max-w-lg bg-white rounded-t-3xl lg:rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-[#111111]">Retirer les fonds</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F5F2] flex items-center justify-center"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#8A8A8A] mb-4">
          Solde disponible :{' '}
          <span className="text-[#111111] font-semibold">
            {formatEuros(wallet.balance)} euros
          </span>
        </p>

        {/* Amount input */}
        <div className="relative bg-[#F7F5F2] rounded-2xl p-5 text-center">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent font-serif text-5xl text-[#111111] text-center outline-none placeholder:text-[#CFCFCF]"
          />
          <p className="text-xs text-[#8A8A8A] mt-1">euros</p>
        </div>

        {/* Quick amounts */}
        <div className="mt-3 flex gap-2">
          {[50, 100, wallet.balance].map((amt, i) => {
            const label =
              i === 2 ? `Tout (${formatEuros(amt)})` : `${amt} euros`;
            return (
              <button
                key={i}
                type="button"
                disabled={amt > wallet.balance || amt < 20}
                onClick={() => setAmount(String(amt))}
                className="flex-1 rounded-full bg-[#F0EDE8] text-[#111111] text-[11px] py-2 disabled:opacity-30"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Stripe connect info */}
        {!wallet.stripe_account_id && (
          <div className="mt-4 bg-[#FFF7E6] border border-[#F0E0B0] rounded-xl p-3">
            <p className="text-[11px] text-[#8A5F00]">
              Vous devez d&apos;abord connecter un compte Stripe pour recevoir
              vos retraits.{' '}
              <Link href="/stylist-profile" className="underline font-semibold">
                Configurer maintenant
              </Link>
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-500 text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="mt-5 w-full rounded-full bg-[#111111] text-white py-4 text-sm font-semibold disabled:opacity-40"
        >
          {submitting ? 'Traitement...' : 'Confirmer le retrait'}
        </button>

        <p className="mt-3 text-[10px] text-[#CFCFCF] text-center">
          Le virement arrive sous 1 &agrave; 3 jours ouvr&eacute;s
        </p>
      </div>
    </div>
  );
}
