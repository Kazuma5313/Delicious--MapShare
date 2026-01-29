import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FolderOpen, Trophy, RefreshCw, X, ImagePlus, ChevronRight } from 'lucide-react';
import type { ComparePhoto } from '../types';

// ダミー画像を生成するSVG
const generateDummyImage = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const color = colors[index % colors.length];
  const foodEmojis = ['🍕', '🍣', '🍔', '🍜', '🍰', '🥗', '🌮', '🍝', '🍛', '🍱'];
  const emoji = foodEmojis[index % foodEmojis.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${color}"/>
      <text x="200" y="130" font-size="80" text-anchor="middle">${emoji}</text>
      <text x="200" y="200" font-size="24" text-anchor="middle" fill="white" font-family="sans-serif">Sample Photo ${index + 1}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// ダミー画像の初期データ
const createDummyPhotos = (): ComparePhoto[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `dummy-${i}`,
    url: generateDummyImage(i),
    name: `Sample Photo ${i + 1}`,
    wins: 0,
    losses: 0,
    score: 0,
  }));
};

interface ComparisonPair {
  left: ComparePhoto;
  right: ComparePhoto;
}

export function PhotoComparison() {
  const [photos, setPhotos] = useState<ComparePhoto[]>(createDummyPhotos);
  const [currentPair, setCurrentPair] = useState<ComparisonPair | null>(null);
  const [comparedPairs, setComparedPairs] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // 総比較回数を計算
  const totalPairs = photos.length > 1 ? (photos.length * (photos.length - 1)) / 2 : 0;

  // 次の比較ペアを選択
  const selectNextPair = useCallback(() => {
    if (photos.length < 2) {
      setCurrentPair(null);
      return;
    }

    // 未比較のペアを探す
    const uncomparedPairs: ComparisonPair[] = [];
    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        const pairKey = `${photos[i].id}-${photos[j].id}`;
        const reversePairKey = `${photos[j].id}-${photos[i].id}`;
        if (!comparedPairs.has(pairKey) && !comparedPairs.has(reversePairKey)) {
          uncomparedPairs.push({
            left: photos[i],
            right: photos[j],
          });
        }
      }
    }

    if (uncomparedPairs.length === 0) {
      setCurrentPair(null);
      setIsComplete(true);
      return;
    }

    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * uncomparedPairs.length);
    // ランダムに左右を入れ替え
    const pair = uncomparedPairs[randomIndex];
    if (Math.random() > 0.5) {
      setCurrentPair({ left: pair.right, right: pair.left });
    } else {
      setCurrentPair(pair);
    }
  }, [photos, comparedPairs]);

  // 比較開始
  useEffect(() => {
    if (photos.length >= 2 && !currentPair && !isComplete) {
      selectNextPair();
    }
  }, [photos, currentPair, isComplete, selectNextPair]);

  // 勝者を選択
  const handleSelectWinner = (winner: ComparePhoto, loser: ComparePhoto) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === winner.id) {
          const newWins = photo.wins + 1;
          return { ...photo, wins: newWins, score: newWins - photo.losses };
        }
        if (photo.id === loser.id) {
          const newLosses = photo.losses + 1;
          return { ...photo, losses: newLosses, score: photo.wins - newLosses };
        }
        return photo;
      })
    );

    const pairKey = `${winner.id}-${loser.id}`;
    setComparedPairs((prev) => new Set(prev).add(pairKey));
    setComparisonCount((prev) => prev + 1);
    setCurrentPair(null);
  };

  // ファイル処理
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'));

    const newPhotos: ComparePhoto[] = [];

    for (const file of imageFiles) {
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newPhotos.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        name: file.name,
        wins: 0,
        losses: 0,
        score: 0,
      });
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
      setIsComplete(false);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    // フォルダ対応
    const processEntry = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => {
          (entry as FileSystemFileEntry).file(resolve);
        });
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        const entries = await new Promise<FileSystemEntry[]>((resolve) => {
          dirReader.readEntries(resolve);
        });
        for (const subEntry of entries) {
          await processEntry(subEntry);
        }
      }
    };

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          await processEntry(entry);
        }
      }
    }

    if (files.length > 0) {
      await processFiles(files);
    } else if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  // ファイル選択
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // リセット
  const handleReset = () => {
    setPhotos([]);
    setCurrentPair(null);
    setComparedPairs(new Set());
    setIsComplete(false);
    setComparisonCount(0);
  };

  // 写真を削除
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setComparedPairs(new Set());
    setIsComplete(false);
    setComparisonCount(0);
  };

  // ダミー画像をロード
  const handleLoadDummy = () => {
    setPhotos(createDummyPhotos());
    setComparedPairs(new Set());
    setIsComplete(false);
    setComparisonCount(0);
  };

  // ランキングを取得（スコア順）
  const ranking = [...photos].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });

  return (
    <div className="photo-comparison">
      <div className="comparison-header">
        <h2>Photo Comparison</h2>
        <p className="comparison-subtitle">
          2枚の写真を比較して、好みの方を選んでください
        </p>
      </div>

      {/* ドロップゾーン */}
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="drop-zone-icon" />
        <p>写真をドラッグ&ドロップ</p>
        <p className="drop-zone-hint">または</p>
        <div className="upload-buttons">
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={18} />
            ファイルを選択
          </button>
          <button
            className="upload-btn"
            onClick={() => folderInputRef.current?.click()}
          >
            <FolderOpen size={18} />
            フォルダを選択
          </button>
          <button className="upload-btn secondary" onClick={handleLoadDummy}>
            <RefreshCw size={18} />
            ダミー画像を読込
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="image/*"
          multiple
          // @ts-expect-error webkitdirectory is not in the type
          webkitdirectory=""
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* 進捗表示 */}
      {photos.length >= 2 && (
        <div className="comparison-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(comparisonCount / totalPairs) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {comparisonCount} / {totalPairs} 比較完了
          </span>
        </div>
      )}

      {/* 比較エリア */}
      {currentPair && !isComplete && (
        <div className="comparison-arena">
          <h3>どちらが好みですか？</h3>
          <div className="comparison-cards">
            <button
              className="comparison-card"
              onClick={() => handleSelectWinner(currentPair.left, currentPair.right)}
            >
              <img src={currentPair.left.url} alt={currentPair.left.name} />
              <span className="card-name">{currentPair.left.name}</span>
            </button>

            <div className="vs-badge">VS</div>

            <button
              className="comparison-card"
              onClick={() => handleSelectWinner(currentPair.right, currentPair.left)}
            >
              <img src={currentPair.right.url} alt={currentPair.right.name} />
              <span className="card-name">{currentPair.right.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* 完了メッセージ */}
      {isComplete && photos.length >= 2 && (
        <div className="comparison-complete">
          <Trophy size={48} className="trophy-icon" />
          <h3>比較完了！</h3>
          <p>全 {totalPairs} 回の比較が終了しました</p>
        </div>
      )}

      {/* ランキング */}
      {photos.length > 0 && (
        <div className="ranking-section">
          <div className="ranking-header">
            <h3>
              <Trophy size={20} />
              ランキング
            </h3>
            <button className="reset-btn" onClick={handleReset}>
              <RefreshCw size={16} />
              リセット
            </button>
          </div>
          <div className="ranking-list">
            {ranking.map((photo, index) => (
              <div key={photo.id} className={`ranking-item rank-${index + 1}`}>
                <span className="rank-number">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `${index + 1}.`}
                </span>
                <img src={photo.url} alt={photo.name} className="rank-thumbnail" />
                <div className="rank-info">
                  <span className="rank-name">{photo.name}</span>
                  <span className="rank-stats">
                    {photo.wins}勝 {photo.losses}敗 (スコア: {photo.score})
                  </span>
                </div>
                <button
                  className="remove-photo-btn"
                  onClick={() => handleRemovePhoto(photo.id)}
                  title="削除"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 写真が少ない場合のメッセージ */}
      {photos.length < 2 && (
        <div className="empty-state">
          <ChevronRight size={24} />
          <p>比較を始めるには2枚以上の写真を追加してください</p>
        </div>
      )}
    </div>
  );
}
