import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Sol Taraf - Metin İçeriği */}
            <div className="lg:col-span-7">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  🤝 Sağlık Topluluğu Platformu
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Uzmanlar</span> ve
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> Topluluk</span>
                <br />
                bir arada
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sağlık yolculuğunuzda <span className="font-semibold text-green-700">destek alın</span>, deneyimlerinizi paylaşın, 
                <span className="font-semibold text-blue-700"> uzman görüşlerinden</span> faydalanın.
                <br />
                Birlikte daha sağlıklı bir yaşam için güçlü bir topluluk oluşturuyoruz.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                    <span className="mr-2">🚀</span>
                    Hemen Katılın
                  </Button>
                </Link>
                <Link href="/posts">
                  <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
                    <span className="mr-2">💬</span>
                    Toplulukla Tanışın
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600 transition-all duration-200">
                    <span className="mr-2">🔍</span>
                    İçerikleri Keşfedin
                  </Button>
                </Link>
              </div>

              {/* İstatistikler */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-4 text-center lg:text-left">Gerçek zamanlı istatistikler</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-xs text-gray-600">👨‍⚕️ Uzman Doktor</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-green-600">45K+</div>
                    <div className="text-xs text-gray-600">🤝 Aktif Üye</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-purple-600">120K+</div>
                    <div className="text-xs text-gray-600">❓ Cevaplanmış Soru</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-orange-600">98%</div>
                    <div className="text-xs text-gray-600">😊 Memnuniyet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Topluluk Paylaşımı Demo */}
            <div className="mt-12 lg:mt-0 lg:col-span-5">
              <div className="relative">
                {/* Ana Paylaşım Demo */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-h-96 overflow-hidden">
                  <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                    <span className="text-lg mr-2">💝</span>
                    <h3 className="font-semibold text-gray-900">Topluluk Paylaşımı</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Ana Hasta Paylaşımı */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                          👩
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Zeynep K.</p>
                          <p className="text-xs text-gray-500">3 saat önce • Diyabet Destek Grubu</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
                        <p className="text-sm text-gray-800 mb-2">
                          🎉 <strong>Güzel haberimi paylaşmak istiyorum!</strong>
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          6 ay önce tip 2 diyabet teşhisi konulmuştu. Bugün doktordan çıktım, HbA1c değerim 8.2&apos;den 6.1&apos;e düşmüş! 
                          Beslenmeme dikkat etmek ve düzenli yürüyüş gerçekten işe yaramış. Bu topluluktaki destek çok önemliydi 💪
                        </p>
                      </div>
                    </div>

                    {/* Topluluk Yanıtları */}
                    <div className="space-y-3">
                      {/* Doktor Yorumu */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                          👨‍⚕️
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-xs font-medium text-blue-800">Dr. Ali Demir ✓</p>
                            <p className="text-xs text-gray-700">Tebrikler Zeynep Hanım! Harika bir ilerleme 👏</p>
                          </div>
                        </div>
                      </div>

                      {/* Diğer Hasta Yorumu */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs">
                          👨
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs font-medium text-gray-800">Mehmet S.</p>
                            <p className="text-xs text-gray-700">Sen bana umut verdin, ben de başlayacağım! 🙏</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Etkileşim Butonları */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <span className="text-xs text-gray-500 flex items-center">❤️ 47</span>
                        <span className="text-xs text-gray-500 flex items-center">💬 12</span>
                        <span className="text-xs text-gray-500 flex items-center">🔗 8</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">#BaşarıHikayesi</span>
                    </div>
                  </div>
                </div>

                {/* Floating İstatistik Kartları */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-3 rounded-xl shadow-lg transform rotate-3">
                  <div className="text-lg font-bold">2.3K</div>
                  <div className="text-xs">Paylaşım</div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-teal-500 text-white p-3 rounded-xl shadow-lg transform -rotate-3">
                  <div className="text-lg font-bold">89%</div>
                  <div className="text-xs">Motivasyon</div>
                </div>

                <div className="absolute top-1/2 -right-8 bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-3 rounded-xl shadow-lg transform rotate-6">
                  <div className="text-lg font-bold">💪</div>
                  <div className="text-xs">Güçlü Topluluk</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-gray-50" viewBox="0 0 1440 120" fill="currentColor">
            <path d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sağlık Yolculuğunuzda
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Her Adımda</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kapsamlı sağlık platformumuzla doğru bilgiye ulaşın, uzmanlarla iletişim kurun ve 
              sağlıklı yaşam alışkanlıkları edinin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Topluluk Alanı */}
              <div className="group relative bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  👥
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Topluluk</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Diğer kullanıcılarla deneyimlerinizi paylaşın, motivasyon alın ve 
                  birlikte sağlıklı yaşayın.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    50,000+ aktif üye
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Deneyim paylaşımı
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Destek grupları
                  </div>
                </div>
                <Link href="/posts">
                  <Button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white group-hover:shadow-lg">
                    Topluluğa Katıl
                  </Button>
                </Link>
              </div>
            </div>

            {/* Keşfet Alanı */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Keşfet</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Binlerce sağlık makalesini, uzman görüşlerini ve güncel araştırmaları 
                  kategorilere göre keşfedin.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    10,000+ makale
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Kategorilere göre filtreleme
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Günlük güncellemeler
                  </div>
                </div>
                <Link href="/blogs">
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white group-hover:shadow-lg">
                    Keşfetmeye Başla
                  </Button>
                </Link>
              </div>
            </div>

            {/* Etkinlikler Alanı */}
            <div className="group relative bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  📅
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Etkinlikler</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Sağlık seminerlerine, webinarlara ve uzman buluşmalarına katılın, 
                  bilginizi artırın.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Haftalık webinarlar
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Uzman buluşmaları
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Sertifika programları
                  </div>
                </div>
                <Link href="/events">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:shadow-lg">
                    Etkinlikleri Görüntüle
                  </Button>
                </Link>
              </div>
            </div>

            {/* Uzmanlar Alanı */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  👨‍⚕️
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Uzmanlar</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Alanında uzman doktorlarımızla tanışın, profillerini inceleyin ve 
                  iletişime geçin.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    500+ uzman doktor
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Tüm branşlar
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Doğrulanmış profiller
                  </div>
                </div>
                <Link href="/uzmanlar">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white group-hover:shadow-lg">
                    Uzmanları İncele
                  </Button>
                </Link>
              </div>
            </div>

            {/* Profil Alanı */}
            <div className="group relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Profilim</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Kişisel sağlık profilinizi oluşturun, ilerlemenizi takip edin ve 
                  özelleştirilmiş öneriler alın.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Kişisel dashboard
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Sağlık takibi
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Özel öneriler
                  </div>
                </div>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white group-hover:shadow-lg">
                    Profili Oluştur
                  </Button>
                </Link>
              </div>
            </div>

      

                        {/* Soru-Cevap Alanı */}
                        <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  ❓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Soru & Cevap</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Sağlık konularındaki sorularınızı uzman doktorlarımıza sorun, 
                  güvenilir ve hızlı cevaplar alın.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    24/7 uzman desteği
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Ücretsiz danışmanlık
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Gizlilik garantisi
                  </div>
                </div>
                <Link href="/posts">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white group-hover:shadow-lg">
                    Soru Sor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Uzman Doktor</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Aktif Kullanıcı</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100K+</div>
              <div className="text-blue-100">Cevaplanmış Soru</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Memnuniyet Oranı</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sağlıklı Yaşama
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> İlk Adımı</span>
            <br />Bugün Atın
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Binlerce kişi sağlık yolculuklarında Sağlık Hep platformunu tercih ediyor. 
            Siz de katılın ve uzmanlarımızdan faydalanın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl">
                <span className="mr-2">🚀</span>
                Ücretsiz Hesap Oluştur
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
              <span className="mr-2">📱</span>
              Mobil Uygulamayı İndir
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

