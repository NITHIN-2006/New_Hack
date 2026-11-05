import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
  role: 'seeker' | 'provider';
  targetName: string;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void | Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ role, targetName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(rating, feedback);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = role === 'provider' 
    ? `Rate the customer: ${targetName}` 
    : `Rate your AidMate: ${targetName}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col justify-end z-[2500] animate-in fade-in duration-200 sm:items-center sm:justify-center">
      <div className="bg-white w-full rounded-t-3xl sm:rounded-2xl sm:max-w-md p-6 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <h3 className="text-center text-lg font-medium text-gray-800 mb-4">{title}</h3>

        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 transition-transform ${hoverRating >= star || rating >= star ? 'scale-110' : 'scale-100'}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-10 h-10 ${
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full border border-gray-200 rounded-xl p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={() => void handleSubmit()}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving Review…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
