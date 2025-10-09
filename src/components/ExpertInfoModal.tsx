import React from 'react';
import Link from 'next/link';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface ExpertInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpertInfoModal: React.FC<ExpertInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-5">
        {/* Hero Section */}
        <div className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Uzman Başvuru Süreci
          </h2>
          <p className="text-sm text-gray-600">
            Platformumuza katılmak için izlemeniz gereken adımlar
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                1
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Başvuru Formu</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                &quot;Doktor&quot; hesap türünü seçerek formunu doldurun. Uzmanlık alanı, kurum ve deneyim bilgilerinizi eksiksiz girin.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                2
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Belge Doğrulama</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                İhtiyaç duyulduğu durumda diploma ve çalışma belgeleriniz talep edilecektir.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                3
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Yönetim Onayı</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bilgileriniz ekibimiz tarafından incelenir. Süreç genellikle 2-5 iş günü sürer.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                4
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Hesap Aktivasyonu</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Onaylandığında uzman rozetiniz aktif olur ve içerik paylaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Uzman Olmanın Avantajları</h3>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Binlerce kullanıcıya ulaşın</span>
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Doğrulanmış uzman rozeti kazanın</span>
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Profesyonel profilinizle tanıtın</span>
            </li>
          </ul>
        </div>

        {/* Important Note */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-900 leading-relaxed">
              Başvurunuzun onaylanabilmesi için bilgilerinizin eksiksiz ve doğru olması gerekmektedir.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <Link href="/register?role=doctor" className="flex-1">
            <Button className="w-full">
              Hemen Başvur
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Kapat
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpertInfoModal;

