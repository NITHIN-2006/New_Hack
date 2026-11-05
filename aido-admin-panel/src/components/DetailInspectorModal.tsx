import { X } from 'lucide-react';
import { ComplaintItem, ReviewItem } from '../types/user.types';

interface DetailInspectorModalProps {
  title: string;
  subtitle: string;
  type: 'REVIEWS' | 'COMPLAINTS';
  items: ReviewItem[] | ComplaintItem[];
  onClose: () => void;
}

export default function DetailInspectorModal({
  title,
  subtitle,
  type,
  items,
  onClose,
}: DetailInspectorModalProps) {
  const listItems = items as Array<ReviewItem | ComplaintItem>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#172033]">{title}</h3>
            <p className="text-xs font-medium text-[#64748B]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] text-[#64748B] transition hover:border-[#16A34A] hover:text-[#16A34A]"
            aria-label="Close inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {listItems.length === 0 ? (
            <p className="text-sm text-[#64748B]">No {type.toLowerCase()} available.</p>
          ) : (
            <div className="space-y-3">
              {listItems.map(item => {
                if (type === 'REVIEWS') {
                  const review = item as ReviewItem;
                  return (
                    <div key={review.id} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[#172033]">{review.reviewerName}</span>
                        <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-[10px] font-bold uppercase text-[#166534]">
                          {review.rating.toFixed(1)} / 5
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#334155]">{review.comment}</p>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
                        {review.createdAt}
                      </p>
                    </div>
                  );
                }

                const complaint = item as ComplaintItem;
                return (
                  <div key={complaint.id} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[#172033]">{complaint.complainantName}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          complaint.severity === 'HIGH'
                            ? 'bg-[#FEE2E2] text-[#B91C1C]'
                            : complaint.severity === 'MEDIUM'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#DCFCE7] text-[#166534]'
                        }`}
                      >
                        {complaint.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#334155]">{complaint.reason}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
                      <span>{complaint.status}</span>
                      <span>{complaint.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
