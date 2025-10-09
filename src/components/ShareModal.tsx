import React from 'react';
import Modal from './ui/Modal';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  TelegramIcon,
} from 'react-share';
import Toast from './ui/Toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  url, 
  title, 
  description 
}) => {
  const [showToast, setShowToast] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
    } catch (error) {
      console.error('Link kopyalanamadı:', error);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Link kopyalandı! 🔗"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <div className="space-y-4">
          {/* Başlık */}
          <div className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Paylaşım Yap</h3>
            <p className="text-sm text-gray-600">Bu gönderiyi sosyal medyada paylaş</p>
          </div>

          {/* Sosyal Medya Butonları */}
          <div className="grid grid-cols-5 gap-3">
            <div className="flex flex-col items-center space-y-2">
              <FacebookShareButton
                url={url}
                className="hover:scale-110 transition-transform"
              >
                <FacebookIcon size={48} round />
              </FacebookShareButton>
              <span className="text-xs text-gray-600">Facebook</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <TwitterShareButton
                url={url}
                title={title}
                className="hover:scale-110 transition-transform"
              >
                <TwitterIcon size={48} round />
              </TwitterShareButton>
              <span className="text-xs text-gray-600">Twitter</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <WhatsappShareButton
                url={url}
                title={title}
                separator=" - "
                className="hover:scale-110 transition-transform"
              >
                <WhatsappIcon size={48} round />
              </WhatsappShareButton>
              <span className="text-xs text-gray-600">WhatsApp</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <LinkedinShareButton
                url={url}
                title={title}
                className="hover:scale-110 transition-transform"
              >
                <LinkedinIcon size={48} round />
              </LinkedinShareButton>
              <span className="text-xs text-gray-600">LinkedIn</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <TelegramShareButton
                url={url}
                title={title}
                className="hover:scale-110 transition-transform"
              >
                <TelegramIcon size={48} round />
              </TelegramShareButton>
              <span className="text-xs text-gray-600">Telegram</span>
            </div>
          </div>

          {/* Link Kopyalama */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Kopyala</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareModal;

