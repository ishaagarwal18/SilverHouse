import React, { useState, useEffect } from 'react';
import {
  Star, ThumbsUp, CheckCircle2, Camera, Upload, X,
  Sparkles, Filter, ChevronDown, MessageSquare, AlertCircle, Eye
} from 'lucide-react';
import { fetchProductReviews, submitProductReview, uploadReviewPhotos, resolveImageUrl } from '../../services/api';

export default function ProductReviewsSection({
  product,
  user,
  onTriggerToast
}) {
  const productId = product?.product_id || product?.id;
  const productName = product?.name || product?.title || 'Pure Silver Artifact';

  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [avgRating, setAvgRating] = useState(5.0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Sort State
  const [selectedStarFilter, setSelectedStarFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'highest', 'lowest'

  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);

  // Helpful Votes Tracking (stored in localStorage)
  const [helpfulMap, setHelpfulMap] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sh_helpful_reviews');
      if (stored) setHelpfulMap(JSON.parse(stored));
    } catch {}
  }, []);

  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await fetchProductReviews(productId);
      setReviews(res.reviews || []);
      setTotalCount(res.total || 0);
      setAvgRating(res.averageRating || 5.0);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Handle Photo File Selection (Max 5 photos)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - selectedFiles.length;
    if (remainingSlots <= 0) {
      if (onTriggerToast) onTriggerToast('error', 'Limit Reached', 'You can upload up to 5 photos per review.');
      return;
    }

    const newFiles = files.slice(0, remainingSlots);
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);

    // Generate previews
    const newPreviews = [];
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    });
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit Review Handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId) return;

    if (!descriptionInput.trim() && selectedFiles.length === 0) {
      if (onTriggerToast) onTriggerToast('error', 'Review Required', 'Please share a few words or photos about your experience.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload photos if selected
      let uploadedPhotoUrls = [];
      if (selectedFiles.length > 0) {
        uploadedPhotoUrls = await uploadReviewPhotos(selectedFiles);
      }

      // 2. Resolve user ID if patron is logged in
      const parsedUserId = user ? (user.userId || user.user_id || user.id || null) : null;

      // 3. Submit review to backend
      const res = await submitProductReview({
        productId,
        userId: parsedUserId,
        star: ratingInput,
        description: descriptionInput.trim(),
        photos: uploadedPhotoUrls
      });

      if (res && res.success) {
        if (onTriggerToast) {
          onTriggerToast('success', 'Review Published', 'Thank you for your valuable review! Your feedback helps fellow patrons.');
        }
        // Reset form
        setDescriptionInput('');
        setRatingInput(5);
        setSelectedFiles([]);
        setFilePreviews([]);
        setShowFormModal(false);
        // Refresh review list live
        await loadReviews();
      } else {
        if (onTriggerToast) {
          onTriggerToast('error', 'Submission Failed', res.error || 'Could not submit review. Please try again.');
        }
      }
    } catch (err) {
      console.error('Submit review error:', err);
      if (onTriggerToast) onTriggerToast('error', 'Network Error', 'Failed to communicate with server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helpful toggle
  const toggleHelpful = (reviewId) => {
    const current = !!helpfulMap[reviewId];
    const updated = { ...helpfulMap, [reviewId]: !current };
    setHelpfulMap(updated);
    try {
      localStorage.setItem('sh_helpful_reviews', JSON.stringify(updated));
    } catch {}
    if (onTriggerToast && !current) {
      onTriggerToast('success', 'Feedback Recorded', 'Thank you for voting this review as helpful.');
    }
  };

  // Calculate Star Distribution Counts
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Number(r.star) === stars).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { stars, count, pct };
  });

  // Filter & Sort reviews
  let displayedReviews = [...reviews];
  if (selectedStarFilter !== 'ALL') {
    displayedReviews = displayedReviews.filter(r => Number(r.star) === Number(selectedStarFilter));
  }

  displayedReviews.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'highest') return Number(b.star || 5) - Number(a.star || 5);
    if (sortBy === 'lowest') return Number(a.star || 5) - Number(b.star || 5);
    return 0;
  });

  const ratingDescriptions = {
    5: 'Exceptional — Royal Heirloom Craftsmanship',
    4: 'Very Good — Delighted With Purity & Finish',
    3: 'Good — Standard Quality & Satisfactory',
    2: 'Fair — Expectation Was Higher',
    1: 'Poor — Unsatisfactory Experience'
  };

  return (
    <section id="customer-reviews-section" className="mt-16 pt-12 border-t border-silver-200">
      <div className="max-w-7xl mx-auto">

        {/* Section Heading & Write Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Patron Voices</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span className="text-xs text-silver-500">Verified SilverHouse Feedback</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              Customer Reviews & Ratings
            </h2>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37] group-hover:text-black" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Top Summary Dashboard (Rating Scorecard + Breakdown + Trust Assurance) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-silver-200 shadow-xs mb-10">
          
          {/* Col 1: Big Score (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:border-r md:border-silver-200 md:pr-6 text-center md:text-left">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-5xl sm:text-6xl font-bold text-[#1A1A1A] tracking-tight">
                {totalCount > 0 ? avgRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-silver-400 font-serif text-2xl">/ 5.0</span>
            </div>

            <div className="flex items-center space-x-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(avgRating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-silver-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-silver-600 font-medium">
              Based on <strong>{totalCount}</strong> authentic customer {totalCount === 1 ? 'review' : 'reviews'}
            </p>

            <div className="mt-4 flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>100% Certified Silver Purity</span>
            </div>
          </div>

          {/* Col 2: Star Breakdown Progress Bars (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-2 md:px-4">
            {distribution.map(({ stars, count, pct }) => (
              <button
                key={stars}
                onClick={() => setSelectedStarFilter(selectedStarFilter === String(stars) ? 'ALL' : String(stars))}
                className={`flex items-center space-x-3 text-xs w-full p-1 rounded-lg transition-colors text-left cursor-pointer ${
                  selectedStarFilter === String(stars) ? 'bg-amber-50 ring-1 ring-[#D4AF37]' : 'hover:bg-silver-50'
                }`}
                title={`Filter by ${stars} stars`}
              >
                <div className="flex items-center space-x-1 w-12 shrink-0">
                  <span className="font-bold text-[#1A1A1A]">{stars}</span>
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                </div>

                <div className="flex-1 h-2.5 bg-silver-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#D4AF37] to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-12 text-right text-silver-500 text-[11px] font-mono shrink-0">
                  {count} ({pct}%)
                </span>
              </button>
            ))}
          </div>

          {/* Col 3: Trust Features (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-3 md:border-l md:border-silver-200 md:pl-6 text-xs text-silver-700">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A1A1A] block">Verified Buyers</strong>
                <span className="text-[11px] text-silver-500">Every review is tied to verified purchases.</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <Camera className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A1A1A] block">Customer Photos</strong>
                <span className="text-[11px] text-silver-500">Real patron silverware unboxings & shrines.</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A1A1A] block">BIS Certified</strong>
                <span className="text-[11px] text-silver-500">Authentic 925 & 999 Hallmark standard.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-silver-50 p-3 rounded-xl border border-silver-200 text-xs mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="font-bold text-silver-600 flex items-center space-x-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Filter:</span>
            </span>

            {['ALL', '5', '4', '3', '2', '1'].map((val) => (
              <button
                key={val}
                onClick={() => setSelectedStarFilter(val)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedStarFilter === val
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'bg-white text-silver-700 hover:bg-silver-200 border border-silver-200'
                }`}
              >
                {val === 'ALL' ? `All (${totalCount})` : `${val} Stars`}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-silver-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-silver-300 rounded-lg px-2.5 py-1 text-xs text-[#1A1A1A] font-semibold focus:outline-hidden focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Review Cards List */}
        {loading ? (
          <div className="p-12 text-center text-silver-500 space-y-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading authentic reviews...</p>
          </div>
        ) : displayedReviews.length === 0 ? (
          /* Empty State */
          <div className="p-10 sm:p-14 bg-white rounded-2xl border border-silver-200 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center mx-auto border border-amber-200">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              Be the First to Review This Sacred Silver Artifact
            </h3>
            <p className="text-xs text-silver-500 max-w-md mx-auto leading-relaxed">
              No reviews yet for <strong>{productName}</strong>. Have you experienced its divine presence or gifted it to family? Share your blessings and thoughts!
            </p>
            <button
              onClick={() => setShowFormModal(true)}
              className="px-6 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedReviews.map((rev) => {
              const reviewStar = Number(rev.star || 5);
              const authorName = rev.customer_name || 'SilverHouse Patron';
              const initial = authorName.charAt(0).toUpperCase() || 'S';
              const createdDate = rev.created_at
                ? new Date(rev.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Recent';

              const photos = Array.isArray(rev.photos)
                ? rev.photos
                : (rev.photo ? [rev.photo] : []);

              const isHelpful = !!helpfulMap[rev.reviewid];

              return (
                <div
                  key={rev.reviewid}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-silver-200 shadow-2xs space-y-4 hover:border-silver-300 transition-colors"
                >
                  {/* Card Header: Avatar + Name + Rating + Date */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1A1A1A] to-[#3A3A3A] text-[#D4AF37] font-bold text-sm flex items-center justify-center border border-[#D4AF37]/30 shadow-2xs">
                        {initial}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#1A1A1A]">{authorName}</span>
                          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-silver-400 block mt-0.5">{createdDate}</span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= reviewStar
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'text-silver-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Description */}
                  {rev.description && (
                    <p className="text-xs sm:text-sm text-silver-800 leading-relaxed font-normal">
                      {rev.description}
                    </p>
                  )}

                  {/* Customer Attached Photos */}
                  {photos.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-silver-500 mb-2 flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-[#D4AF37]" />
                        <span>Attached Photos ({photos.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {photos.map((imgSrc, pIdx) => {
                          const resolved = resolveImageUrl(imgSrc);
                          return (
                            <button
                              key={pIdx}
                              onClick={() => setLightboxImage(resolved)}
                              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-silver-200 hover:border-[#D4AF37] transition-all group cursor-pointer shadow-2xs"
                              title="Click to view full photo"
                            >
                              <img
                                src={resolved}
                                alt={`Customer review photo ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Card Footer: Helpful Action */}
                  <div className="pt-2 border-t border-silver-100 flex items-center justify-between text-xs text-silver-500">
                    <span className="text-[11px]">Certified 925 / 999 Sterling Silver Review</span>
                    <button
                      onClick={() => toggleHelpful(rev.reviewid)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isHelpful
                          ? 'bg-amber-50 text-[#D4AF37] border-amber-300'
                          : 'bg-white hover:bg-silver-50 text-silver-600 border-silver-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? 'fill-[#D4AF37]' : ''}`} />
                      <span>{isHelpful ? 'Helpful (You voted)' : 'Helpful'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* WRITE A REVIEW MODAL / DRAWER */}
      {/* ======================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-silver-300 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-silver-100 text-silver-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center space-x-1.5 text-xs uppercase font-bold tracking-wider text-[#D4AF37] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Patron Review</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Review {productName}
              </h3>
              <p className="text-xs text-silver-500 mt-1">
                Share your experience, silver quality, packaging, and craftsmanship impressions.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingInput(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-115 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= (hoverRating || ratingInput)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-silver-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#D4AF37] ml-2">
                    {ratingInput} / 5
                  </span>
                </div>
                <p className="text-[11px] text-silver-500 mt-1">
                  {ratingDescriptions[hoverRating || ratingInput]}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                  Your Review Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="How was the purity, shine, hallmark finish, and packaging? Did it make a wonderful gift or sacred shrine addition?"
                  className="w-full bg-silver-50 border border-silver-300 rounded-xl p-3.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              {/* Photo Upload (Max 5 photos) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Add Photos (Optional)
                  </label>
                  <span className="text-[11px] text-silver-500 font-mono">
                    {selectedFiles.length} / 5 photos
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 mb-2">
                  {filePreviews.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-silver-300 shadow-2xs group">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {selectedFiles.length < 5 && (
                    <label className="w-16 h-16 border-2 border-dashed border-silver-300 hover:border-[#D4AF37] rounded-xl flex flex-col items-center justify-center text-silver-400 hover:text-[#D4AF37] cursor-pointer transition-colors bg-silver-50 hover:bg-amber-50/50">
                      <Upload className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold uppercase">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-silver-400">
                  Tip: Upload photos of the hallmark certificate or unboxing to get a Verified Showcase badge.
                </p>
              </div>

              {/* Patron Info Display */}
              <div className="p-3 bg-silver-50 rounded-xl border border-silver-200 text-xs">
                {user ? (
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Posting as <strong>{user.full_name || user.name || 'Patron'}</strong> ({user.phone || 'Verified Customer'})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-silver-600">
                    <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                    <span>Posting as verified SilverHouse Patron guest review.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-silver-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-silver-300 text-xs font-bold text-silver-700 hover:bg-silver-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center space-x-2 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* IMAGE LIGHTBOX MODAL */}
      {/* ======================================================== */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size review photo"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

    </section>
  );
}
