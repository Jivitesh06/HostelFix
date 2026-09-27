import React, { useState, useRef, useEffect } from 'react';
import messService from '../services/messService';
import {
  Camera,
  UploadCloud,
  FileImage,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  X,
  Coffee,
  Utensils,
  Soup,
  Sandwich,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

const MEAL_ICONS = {
  BREAKFAST: Coffee,
  LUNCH: Utensils,
  SNACKS: Sandwich,
  DINNER: Soup,
};

const MEAL_LABELS = {
  BREAKFAST: 'Breakfast (7:30 – 9:30 AM)',
  LUNCH: 'Lunch (12:30 – 2:30 PM)',
  SNACKS: 'Evening Snacks (5:00 – 6:15 PM)',
  DINNER: 'Dinner (7:45 – 9:45 PM)',
};

export default function MenuPhotoUpdateModal({ isOpen, onClose, onPublished }) {
  const [step, setStep] = useState('UPLOAD'); // 'UPLOAD' | 'PROCESSING' | 'PREVIEW' | 'SUCCESS'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview & Editing state
  const [menuSlots, setMenuSlots] = useState([]);
  const [selectedWeekOf, setSelectedWeekOf] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState('All');
  const [showPhotoRef, setShowPhotoRef] = useState(false);
  const [uncertainCount, setUncertainCount] = useState(0);

  // Status & error states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  const fileInputRef = useRef(null);

  // Initialize current Monday
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      setSelectedWeekOf(monday.toISOString().split('T')[0]);
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep('UPLOAD');
    setFile(null);
    setFilePreview(null);
    setUploadedImageUrl(null);
    setMenuSlots([]);
    setErrorMessage('');
    setIsSubmitting(false);
    setShowPhotoRef(false);
    setActiveDayFilter('All');
  };

  if (!isOpen) return null;

  // File selection
  const handleFileChange = (selected) => {
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(selected.type)) {
      setErrorMessage('Please select a valid JPG, PNG, or WEBP image file.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setErrorMessage('');
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // OCR Processing
  const handleStartOcr = async () => {
    if (!file) return;
    setStep('PROCESSING');
    setErrorMessage('');

    try {
      const res = await messService.extractMenuFromPhoto(file);
      setUploadedImageUrl(res.imageUrl);
      setUncertainCount(res.uncertainCount || 0);

      if (res.weekOf) {
        setSelectedWeekOf(res.weekOf);
      }

      // Ensure all 28 slots are present
      const slots = res.menu && res.menu.length === 28 ? res.menu : createDefault28Slots();
      setMenuSlots(slots);
      setStep('PREVIEW');
    } catch (err) {
      console.error('OCR Extraction error:', err);
      setErrorMessage(
        err.response?.data?.message ||
        'Unable to complete automatic OCR text extraction. You can still review and enter the menu items manually.'
      );
      // Fallback: load 28 empty template slots so Warden can manually type
      setMenuSlots(createDefault28Slots());
      setStep('PREVIEW');
    }
  };

  const createDefault28Slots = () => {
    const slots = [];
    for (const d of DAYS) {
      for (const m of MEALS) {
        slots.push({
          dayOfWeek: d,
          mealType: m,
          items: '',
          isUncertain: true,
          confidence: 0,
        });
      }
    }
    return slots;
  };

  // Handle manual edits
  const handleItemChange = (day, meal, newText) => {
    setMenuSlots((prev) =>
      prev.map((slot) => {
        if (slot.dayOfWeek === day && slot.mealType === meal) {
          return {
            ...slot,
            items: newText,
            isUncertain: !newText.trim() || newText.trim().length < 2,
          };
        }
        return slot;
      })
    );
  };

  // Publish to database
  const handlePublish = async () => {
    setErrorMessage('');

    // Client-side validation: all 28 slots must be filled
    const emptySlots = menuSlots.filter((s) => !s.items || s.items.trim().length < 2);
    if (emptySlots.length > 0) {
      setErrorMessage(
        `Cannot publish: ${emptySlots.length} meal slot(s) are empty. Please fill in dishes for all 28 meals before publishing.`
      );
      return;
    }

    if (!selectedWeekOf) {
      setErrorMessage('Please select a valid week starting date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await messService.publishWeeklyMenu({
        menu: menuSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          mealType: s.mealType,
          items: s.items.trim(),
        })),
        weekOf: selectedWeekOf,
        imageUrl: uploadedImageUrl || null,
      });

      setPublishResult(response);
      setStep('SUCCESS');
      if (onPublished) {
        onPublished();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to publish weekly menu. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter slots for viewing
  const displayedSlots =
    activeDayFilter === 'All'
      ? menuSlots
      : menuSlots.filter((s) => s.dayOfWeek === activeDayFilter);

  const missingCount = menuSlots.filter((s) => !s.items || s.items.trim().length < 2).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: step === 'PREVIEW' ? '1080px' : '620px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fdecef',
                color: '#c8102e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                Update Weekly Menu from Photo
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                {step === 'UPLOAD' && 'Upload a photo or screenshot of the weekly dining schedule'}
                {step === 'PROCESSING' && 'Running intelligent OCR recognition on image...'}
                {step === 'PREVIEW' && 'Review extracted meal items and confirm before publishing to live schedule'}
                {step === 'SUCCESS' && 'Schedule successfully published!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4b5563',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* ── STEP 1: UPLOAD ────────────────────────────────────────────── */}
          {step === 'UPLOAD' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#c8102e' : '#d1d5db'}`,
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: isDragging ? '#fff5f5' : '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1.25rem',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />

                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#fee2e2',
                    color: '#c8102e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <UploadCloud size={28} />
                </div>

                <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 600, color: '#1f2937' }}>
                  Click to select or drag & drop menu photo
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  Supports PNG, JPG, JPEG, WEBP up to 5MB
                </p>
              </div>

              {/* Selected File Card */}
              {file && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <FileImage size={24} color="#6b7280" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for OCR
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFilePreview(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Tips */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.825rem',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                  💡 Pro Tips for Best OCR Accuracy:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li>Ensure the menu table or paper schedule is well-lit and in focus.</li>
                  <li>Include all day names (Mon–Sun) and meal titles (Breakfast, Lunch, Snacks, Dinner).</li>
                  <li>You will be able to review and freely edit every dish before publishing.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── STEP 2: PROCESSING ────────────────────────────────────────── */}
          {step === 'PROCESSING' && (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fdecef',
                  color: '#c8102e',
                  marginBottom: '1.25rem',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <Sparkles size={32} />
              </div>

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                Analyzing Menu Image & Running OCR...
              </h4>
              <p style={{ margin: '0 auto 1.5rem', maxWidth: '420px', fontSize: '0.875rem', color: '#6b7280' }}>
                Uploading image to secure storage, recognizing columns, and structuring all 28 meal entries.
                This typically takes 3 to 6 seconds.
              </p>

              <div
                style={{
                  width: '180px',
                  height: '4px',
                  background: '#f3f4f6',
                  borderRadius: '2px',
                  margin: '0 auto',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '50%',
                    background: '#c8102e',
                    borderRadius: '2px',
                    animation: 'indeterminate 1.5s infinite linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: PREVIEW & EDIT ────────────────────────────────────── */}
          {step === 'PREVIEW' && (
            <div>
              {/* Alert Summary Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: missingCount > 0 ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${missingCount > 0 ? '#fde68a' : '#bbf7d0'}`,
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {missingCount > 0 ? (
                    <AlertTriangle size={20} color="#d97706" />
                  ) : (
                    <CheckCircle2 size={20} color="#16a34a" />
                  )}
                  <div>
                    <strong style={{ color: missingCount > 0 ? '#92400e' : '#166534', fontSize: '0.9rem' }}>
                      {missingCount > 0
                        ? `${28 - missingCount} of 28 meal slots recognized. ${missingCount} slots need your review.`
                        : 'All 28 meal slots successfully structured!'}
                    </strong>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.775rem', color: '#6b7280' }}>
                      Verify the dishes below against the original photo before publishing.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Photo toggle button */}
                  {(uploadedImageUrl || filePreview) && (
                    <button
                      type="button"
                      onClick={() => setShowPhotoRef(!showPhotoRef)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        background: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {showPhotoRef ? <EyeOff size={15} /> : <Eye size={15} />}
                      <span>{showPhotoRef ? 'Hide Photo' : 'View Uploaded Photo'}</span>
                    </button>
                  )}

                  {/* Week of selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="#4b5563" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                      Week of:
                    </span>
                    <input
                      type="date"
                      value={selectedWeekOf}
                      onChange={(e) => setSelectedWeekOf(e.target.value)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Photo Reference Drawer */}
              {showPhotoRef && (uploadedImageUrl || filePreview) && (
                <div
                  style={{
                    marginBottom: '1.25rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>
                      Original Document Reference
                    </span>
                    <a
                      href={uploadedImageUrl || filePreview}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: '#c8102e', fontWeight: 600 }}
                    >
                      Open Full Size ↗
                    </a>
                  </div>
                  <img
                    src={uploadedImageUrl || filePreview}
                    alt="Reference Menu"
                    style={{
                      maxHeight: '260px',
                      width: '100%',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      background: '#18181b',
                    }}
                  />
                </div>
              )}

              {/* Day Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  paddingBottom: '0.6rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {['All', ...DAYS].map((dayName) => {
                  const daySlots =
                    dayName === 'All'
                      ? menuSlots
                      : menuSlots.filter((s) => s.dayOfWeek === dayName);
                  const dayHasMissing = daySlots.some(
                    (s) => !s.items || s.items.trim().length < 2 || s.isUncertain
                  );

                  const isActive = activeDayFilter === dayName;
                  return (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => setActiveDayFilter(dayName)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '20px',
                        border: `1px solid ${isActive ? '#c8102e' : '#e5e7eb'}`,
                        background: isActive ? '#fdecef' : '#ffffff',
                        color: isActive ? '#c8102e' : '#4b5563',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>{dayName}</span>
                      {dayHasMissing && (
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: '#f59e0b',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 28-Slot Editable Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    activeDayFilter === 'All'
                      ? 'repeat(auto-fit, minmax(320px, 1fr))'
                      : 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                {displayedSlots.map((slot) => {
                  const Icon = MEAL_ICONS[slot.mealType] || Coffee;
                  const isMissing = !slot.items || slot.items.trim().length < 2;
                  const needsReview = isMissing || slot.isUncertain;

                  return (
                    <div
                      key={`${slot.dayOfWeek}-${slot.mealType}`}
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${needsReview ? '#f59e0b' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        padding: '0.85rem',
                        boxShadow: needsReview
                          ? '0 2px 8px rgba(245, 158, 11, 0.12)'
                          : '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Icon size={16} color={needsReview ? '#d97706' : '#c8102e'} />
                          <strong style={{ fontSize: '0.85rem', color: '#111827' }}>
                            {activeDayFilter === 'All' ? `${slot.dayOfWeek} — ` : ''}
                            {slot.mealType}
                          </strong>
                        </div>

                        {needsReview && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#b45309',
                              background: '#fef3c7',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <AlertTriangle size={11} />
                            {isMissing ? 'Empty' : 'Review'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                        {MEAL_LABELS[slot.mealType]}
                      </div>

                      <textarea
                        rows={2}
                        value={slot.items}
                        onChange={(e) =>
                          handleItemChange(slot.dayOfWeek, slot.mealType, e.target.value)
                        }
                        placeholder={`Dishes for ${slot.dayOfWeek} ${slot.mealType}...`}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: `1px solid ${needsReview ? '#fde68a' : '#d1d5db'}`,
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: needsReview ? '#fffdf7' : '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 4: SUCCESS ───────────────────────────────────────────── */}
          {step === 'SUCCESS' && (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                Weekly Menu Published Successfully!
              </h4>
              <p style={{ margin: '0 auto 1.5rem', maxWidth: '440px', fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>
                All 28 meal entries have been verified and updated in the official database.
                Students and staff can now view the latest meal options for the week of{' '}
                <strong>{selectedWeekOf}</strong>.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  maxWidth: '320px',
                  margin: '0 auto 1.5rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                }}
              >
                <div>✓ 28 Active Meal Slots Updated</div>
                <div>✓ Existing Student Ratings Preserved</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.75rem',
                  borderRadius: '8px',
                  background: '#c8102e',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Return to Mess Schedule
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step !== 'SUCCESS' && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {step === 'PREVIEW' ? (
              <button
                type="button"
                onClick={() => setStep('UPLOAD')}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={15} />
                <span>Upload Different Photo</span>
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {step === 'UPLOAD' && (
                <button
                  type="button"
                  onClick={handleStartOcr}
                  disabled={!file}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: file ? '#c8102e' : '#9ca3af',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: file ? 'pointer' : 'not-allowed',
                    boxShadow: file ? '0 1px 2px rgba(200, 16, 46, 0.2)' : 'none',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Extract Menu with OCR</span>
                </button>
              )}

              {step === 'PREVIEW' && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || missingCount > 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: missingCount > 0 || isSubmitting ? '#9ca3af' : '#c8102e',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: missingCount > 0 || isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow:
                      missingCount === 0 && !isSubmitting
                        ? '0 1px 2px rgba(200, 16, 46, 0.2)'
                        : 'none',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s infinite linear' }} />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Publish Menu (28 Slots)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
