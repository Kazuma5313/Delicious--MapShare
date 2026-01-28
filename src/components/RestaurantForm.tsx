import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { RESTAURANT_CATEGORIES, PRICE_RANGES, SUGGESTED_TAGS } from '../utils/categories';
import { X, Plus, Camera, MapPin, Star } from 'lucide-react';

interface RestaurantFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RestaurantForm({ lat, lng, onClose, onSuccess }: RestaurantFormProps) {
  const { addRestaurant, addPhoto } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<string>(RESTAURANT_CATEGORIES[0]);
  const [priceRange, setPriceRange] = useState<1 | 2 | 3 | 4>(2);
  const [rating, setRating] = useState(3);
  const [visited, setVisited] = useState(false);
  const [visitedDate, setVisitedDate] = useState('');
  const [wantToGo, setWantToGo] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotos((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRestaurant = addRestaurant({
      name,
      address,
      lat,
      lng,
      category,
      priceRange,
      rating,
      visited,
      visitedDate: visitedDate ? new Date(visitedDate) : undefined,
      wantToGo: !visited && wantToGo,
      tags,
    });

    photos.forEach((photoUrl) => {
      addPhoto(newRestaurant.id, { url: photoUrl });
    });

    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content restaurant-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新しいお店を追加</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>お店の名前 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お店の名前を入力"
              required
            />
          </div>

          <div className="form-group">
            <label>住所</label>
            <div className="input-with-icon">
              <MapPin size={18} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="住所を入力"
              />
            </div>
            <small>
              位置: {lat.toFixed(6)}, {lng.toFixed(6)}
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>カテゴリー</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {RESTAURANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>価格帯</label>
              <div className="price-selector">
                {PRICE_RANGES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`price-button ${priceRange === p.value ? 'active' : ''}`}
                    onClick={() => setPriceRange(p.value as 1 | 2 | 3 | 4)}
                    title={p.description}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>評価</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-button"
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={28}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                    stroke={star <= rating ? '#F59E0B' : '#CBD5E1'}
                  />
                </button>
              ))}
              <span className="rating-value">{rating}.0</span>
            </div>
          </div>

          <div className="form-group">
            <label>ステータス</label>
            <div className="status-selector">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={visited}
                  onChange={(e) => {
                    setVisited(e.target.checked);
                    if (e.target.checked) setWantToGo(false);
                  }}
                />
                <span>訪問済み</span>
              </label>
              {!visited && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={wantToGo}
                    onChange={(e) => setWantToGo(e.target.checked)}
                  />
                  <span>行きたい</span>
                </label>
              )}
            </div>
          </div>

          {visited && (
            <div className="form-group">
              <label>訪問日</label>
              <input
                type="date"
                value={visitedDate}
                onChange={(e) => setVisitedDate(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>タグ</label>
            <div className="tag-suggestions">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-button ${tags.includes(tag) ? 'active' : ''}`}
                  onClick={() =>
                    tags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="custom-tag-input">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="カスタムタグを追加"
              />
              <button
                type="button"
                onClick={() => {
                  if (customTag.trim()) {
                    handleAddTag(customTag.trim());
                    setCustomTag('');
                  }
                }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>写真</label>
            <div className="photo-upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                hidden
              />
              <button
                type="button"
                className="photo-upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={24} />
                <span>写真を追加</span>
              </button>
              {photos.length > 0 && (
                <div className="photo-preview-grid">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-preview">
                      <img src={photo} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="submit-button" disabled={!name}>
              追加する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
