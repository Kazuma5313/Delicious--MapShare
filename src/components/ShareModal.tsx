import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Copy, Download, Upload, Check, Link, Users, AlertCircle } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export function ShareModal({ onClose }: ShareModalProps) {
  const { generateShareData, importShareData, restaurants, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'share' | 'import'>('share');
  const [shareUrl, setShareUrl] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importResult, setImportResult] = useState<'success' | 'error' | null>(null);

  const handleGenerateLink = () => {
    const data = generateShareData();
    const url = `${window.location.origin}?share=${data}`;
    setShareUrl(url);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    const data = generateShareData();
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const data = {
      restaurants,
      exportedBy: currentUser.name,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delicious-mapshare-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = importShareData(importCode.trim());
    setImportResult(success ? 'success' : 'error');
    if (success) {
      setImportCode('');
      setTimeout(() => {
        setImportResult(null);
        onClose();
      }, 1500);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.restaurants) {
            const shareData = btoa(encodeURIComponent(JSON.stringify(data)));
            const success = importShareData(shareData);
            setImportResult(success ? 'success' : 'error');
            if (success) {
              setTimeout(() => {
                setImportResult(null);
                onClose();
              }, 1500);
            }
          }
        } catch {
          setImportResult('error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Users size={24} />
            共有
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="share-tabs">
          <button
            className={`tab ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            共有する
          </button>
          <button
            className={`tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            インポート
          </button>
        </div>

        {activeTab === 'share' ? (
          <div className="share-content">
            <p className="share-description">
              お店のリストを彼女や友達と共有しましょう！<br />
              リンクやコードを送るだけで、簡単に共有できます。
            </p>

            <div className="share-section">
              <h3>
                <Link size={18} />
                リンクで共有
              </h3>
              <button className="generate-button" onClick={handleGenerateLink}>
                共有リンクを生成
              </button>
              {shareUrl && (
                <div className="share-url">
                  <input type="text" value={shareUrl} readOnly />
                  <button onClick={handleCopyLink}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}
            </div>

            <div className="share-section">
              <h3>
                <Copy size={18} />
                コードで共有
              </h3>
              <p className="share-hint">
                コードをコピーして、LINEやメッセージで送信できます。
              </p>
              <button className="copy-code-button" onClick={handleCopyCode}>
                {copied ? (
                  <>
                    <Check size={18} /> コピーしました！
                  </>
                ) : (
                  <>
                    <Copy size={18} /> 共有コードをコピー
                  </>
                )}
              </button>
            </div>

            <div className="share-section">
              <h3>
                <Download size={18} />
                ファイルで保存
              </h3>
              <p className="share-hint">
                バックアップや他のデバイスへの移行に便利です。
              </p>
              <button className="export-button" onClick={handleExport}>
                JSONファイルをダウンロード
              </button>
            </div>

            <div className="share-stats">
              <span>{restaurants.length}件のお店を共有</span>
            </div>
          </div>
        ) : (
          <div className="import-content">
            <p className="share-description">
              共有されたコードやファイルからお店をインポートできます。
            </p>

            {importResult && (
              <div className={`import-result ${importResult}`}>
                {importResult === 'success' ? (
                  <>
                    <Check size={20} />
                    インポートに成功しました！
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    インポートに失敗しました。コードを確認してください。
                  </>
                )}
              </div>
            )}

            <div className="import-section">
              <h3>
                <Copy size={18} />
                コードでインポート
              </h3>
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="共有コードを貼り付けてください..."
                rows={4}
              />
              <button
                className="import-button"
                onClick={handleImport}
                disabled={!importCode.trim()}
              >
                <Upload size={18} />
                インポート
              </button>
            </div>

            <div className="import-section">
              <h3>
                <Upload size={18} />
                ファイルでインポート
              </h3>
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  hidden
                />
                <Upload size={20} />
                JSONファイルを選択
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
