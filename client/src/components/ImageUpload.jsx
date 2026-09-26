import { useState, useRef } from 'react';
import api from '../services/api';
import { UploadCloud, X, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUpload({
  label = 'Upload Image',
  folder = 'complaints/issues',
  value = '',
  onChange,
  required = false,
  helpText = 'PNG, JPG or WEBP up to 5MB',
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image file size exceeds 5MB limit. Please select a smaller photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = res.data?.data?.url;
      const uploadedPublicId = res.data?.data?.publicId || '';
      if (uploadedUrl) {
        // Pass { url, publicId } so parent can store publicId for backend cleanup
        onChange({ url: uploadedUrl, publicId: uploadedPublicId });
      } else {
        throw new Error('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      const msg = err.response?.data?.message || err.message || 'Image upload failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange({ url: '', publicId: '' });
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '0.45rem',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* If an image is already uploaded/selected */}
      {value ? (
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.85rem',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            <img
              src={value}
              alt="Uploaded Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#059669',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Image uploaded & verified</span>
            </div>
            <p
              style={{
                margin: '0 0 0.5rem',
                fontSize: '0.75rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {value}
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={13} />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <X size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Dropzone state */
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !loading && fileInputRef.current?.click()}
          style={{
            border: dragOver ? '2px dashed #c8102e' : '2px dashed #e5e7eb',
            borderRadius: '10px',
            padding: '1.75rem 1rem',
            textAlign: 'center',
            cursor: loading ? 'wait' : 'pointer',
            background: dragOver ? '#fdecef' : '#f8f8f8',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#c8102e',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.85rem', color: '#c8102e', fontWeight: 600 }}>
                Uploading to Cloudinary...
              </span>
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#fdecef',
                  color: '#c8102e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                <UploadCloud size={22} />
              </div>
              <p
                style={{
                  margin: '0 0 0.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#171717',
                }}
              >
                Click to browse or drag & drop photo
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                {helpText}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#dc2626',
            fontSize: '0.8rem',
            marginTop: '0.4rem',
          }}
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
