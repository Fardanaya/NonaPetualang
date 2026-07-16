'use client'

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { metadataConfig } from "./config";
import Gallery from "@/components/ui/Gallery";
import { Button, Chip } from "@heroui/react";


const heroAssets = [
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070",
    title: "Mendaki",
    subtitle: "Puncak Tertinggi Indonesia",
  },
  {
    src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=2070",
    title: "Berkemah",
    subtitle: "Nikmati Malam di Bawah Bintang",
  },
  {
    src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=2070",
    title: "Menjelajah",
    subtitle: "Keindahan Alam yang Tersembunyi",
  },
];

const galleryItems: Array<{
  id: string;
  title: string;
  image: string;
}> = [
  {
    id: "1",
    title: "Tenda Eiger",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "2",
    title: "Carrier Consina",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "3",
    title: "Cooking Kit",
    image: "https://images.unsplash.com/photo-1534130339164-21b5be0c50b7?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "4",
    title: "Matras",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "5",
    title: "Sleeping Bag",
    image: "https://images.unsplash.com/photo-1517867008703-a3bc57fd4f0d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "6",
    title: "Headlamp",
    image: "https://images.unsplash.com/photo-1521193086911-366579383670?auto=format&fit=crop&q=80&w=400",
  }
];

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex: number) => (prevIndex + 1) % heroAssets.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentAsset = heroAssets[currentIndex];
  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-50">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={currentAsset.src}
                alt={currentAsset.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-8 z-20 flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
             <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13l6.5-13z" />
             </svg>
          </div>
          <span className="text-white text-2xl font-black tracking-tighter uppercase italic">NONA PETUALANG</span>
        </motion.div>

        {/* Hero Content */}
        <div className="container mx-auto px-8 relative z-20">
          <div className="flex flex-col items-start gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start gap-4"
            >
              <div className="flex items-center gap-2 bg-primary text-black font-black italic uppercase tracking-[0.2em] px-4 py-2 text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                PREMIUM OUTDOOR GEAR
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "anticipate" }}
                >
                  <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {currentAsset.title}
                  </h1>
                </motion.div>
              </AnimatePresence>

              <p className="text-lg md:text-2xl font-bold uppercase italic tracking-tight text-white/90 max-w-xl drop-shadow-md">
                {currentAsset.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mt-6">
                <Button
                  as={Link}
                  href="/catalog"
                  size="lg"
                  className="bg-primary text-black font-black italic uppercase tracking-widest px-12 h-16 text-xl rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  LIHAT KOLEKSI
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-4">
          {heroAssets.map((_, idx) => (
            <button
            
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-500 overflow-hidden ${
                idx === currentIndex 
                  ? 'w-16 h-3 bg-primary' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white rounded-full'
              } rounded-full`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* HOW TO RENT SECTION */}
      <section id="how-to-rent" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter italic uppercase">CARA SEWA</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Proses sewa alat yang simpel untuk pendaki yang gak mau ribet.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Pilih Alat",
                desc: "Cari perlengkapan yang kamu butuhkan. Tenda, carrier, nesting, semua ada di sini.",
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                color: "bg-primary"
              },
              {
                step: "02",
                title: "Booking & Bayar",
                desc: "Tentukan tanggal sewa dan lakukan pembayaran melalui transfer atau e-wallet.",
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                color: "bg-primary"
              },
              {
                step: "03",
                title: "Ambil & Berangkat",
                desc: "Ambil alat di basecamp kami atau kami kirim ke tempatmu. Selamat mendaki!",
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ),
                color: "bg-primary"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group p-10 bg-gray-50 rounded-[3rem] border-2 border-transparent hover:border-primary transition-all duration-500 hover:shadow-2xl"
              >
                <div className={`${item.color} w-20 h-20 rounded-3xl flex items-center justify-center text-black mb-8 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-yellow-200`}>
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black mb-4 text-gray-900 italic uppercase tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Link
              href="/catalog"
              className="inline-flex items-center gap-4 bg-black text-white px-12 py-6 rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:scale-105"
            >
              Lihat Katalog
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter italic uppercase">KOLEKSI ALAT</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Hanya alat dengan kualitas terbaik yang kami sewakan untuk keamananmu.
            </p>
          </motion.div>

          <Gallery
            items={galleryItems}
            className="max-w-7xl mx-auto"
          />
        </div>
      </section>
            

      {/* FEATURED BRAND SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black italic tracking-tighter uppercase text-center mb-16 text-gray-900"
          >
            SANG PETUALANG BRAND
          </motion.h2>
          
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-60">
            {["EIGER", "CONSINA", "THE NORTH FACE", "COLUMBIA", "OSPREY", "DEUTER"].map((brand, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-3xl font-black italic tracking-tighter text-gray-800 hover:text-primary transition-colors cursor-pointer uppercase"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR REVIEW SECTION */}
      <section id="our-review" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black italic tracking-tighter uppercase text-center mb-20 text-gray-900"
          >
            KATA PARA PENDAKI
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "ANDI GUNAWAN",
                review: "Alatnya sangat terawat! Tenda yang saya sewa bersih dan semua kelengkapannya lengkap. Carrier juga sangat nyaman dipakai untuk pendakian 3 hari di Semeru.",
                rating: 5
              },
              {
                name: "SITI AISYAH",
                review: "Sangat terbantu dengan Nona Petualang! Proses sewanya mudah, alatnya berkualitas pro, dan harganya masuk akal. Sangat cocok untuk pendaki pemula maupun pro.",
                rating: 5
              },
              {
                name: "BUDI SANTOSO",
                review: "Basecamp rental alat terbaik! Pilihan alatnya banyak banget, kondisi alat selalu prima, dan stafnya sangat paham tentang teknis alat pendakian.",
                rating: 5
              }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed italic uppercase">"{review.review}"</p>
                <p className="font-black text-gray-900 tracking-tighter italic uppercase">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-gray-900 mb-6">TANYA PETUALANG</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Semua yang perlu kamu ketahui sebelum memulai perjalananmu.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "BAGAIMANA CARA MENYEWA ALAT DI NONA PETUALANG?",
                answer: "Pilih alat yang kamu butuhkan dari katalog kami, tentukan tanggal pengambilan dan pengembalian, lalu lakukan reservasi melalui sistem kami."
              },
              {
                question: "BERAPA LAMA DURASI SEWA STANDAR?",
                answer: "Kami menawarkan paket mulai dari 3 hari, 6 hari, hingga mingguan sesuai dengan kebutuhan ekspedisimu."
              },
              {
                question: "APAKAH ALAT YANG DISEWAKAN DIJAMIN KEBERSIHANNYA?",
                answer: "Tentu! Semua alat kami melalui proses pembersihan dan sterilisasi profesional setelah setiap penggunaan untuk menjamin kenyamananmu."
              },
              {
                question: "BAGAIMANA JIKA ALAT MENGALAMI KERUSAKAN DI GUNUNG?",
                answer: "Kami sarankan untuk selalu mengecek alat saat pengambilan. Jika terjadi kerusakan teknis di luar kelalaian penggunaan, kami akan bantu solusinya."
              },
              {
                question: "APAKAH BISA KIRIM ALAT KE LUAR KOTA?",
                answer: "Ya, kami melayani pengiriman alat ke seluruh wilayah Indonesia dengan ekspedisi yang terpercaya."
              }
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-gray-50 rounded-[2rem] overflow-hidden hover:bg-gray-100 transition-all border-none"
              >
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                  <span className="font-black text-gray-900 uppercase italic tracking-tighter text-lg">{faq.question}</span>
                  <span className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center group-open:rotate-45 transition-transform duration-300">
                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="px-8 pb-8 text-gray-500 font-bold uppercase italic text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transform rotate-3">
                  <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13l6.5-13z" />
                  </svg>
                </div>
                <span className="text-xl font-black italic tracking-tighter uppercase">NONA PETUALANG</span>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Penyedia layanan sewa alat outdoor dan pendakian terbaik. Kami mendukung setiap langkah petualanganmu menuju puncak.
              </p>
              <div className="flex gap-4">
                 {/* Social Icons */}
                 <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all cursor-pointer">
                    <span className="font-bold text-xs">IG</span>
                 </div>
                 <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all cursor-pointer">
                    <span className="font-bold text-xs">WA</span>
                 </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-primary italic">Menu Jalur</h4>
              <ul className="space-y-4 text-gray-400 font-bold text-sm">
                <li><Link href="/catalog" className="hover:text-white transition-colors uppercase">Katalog Alat</Link></li>
                <li><a href="#how-to-rent" className="hover:text-white transition-colors uppercase">Cara Sewa</a></li>
                <li><a href="#our-review" className="hover:text-white transition-colors uppercase">Testimoni</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-primary italic">Kategori Utama</h4>
              <ul className="space-y-4 text-gray-400 font-bold text-sm">
                <li className="hover:text-white transition-colors cursor-pointer uppercase">TENDA CAMPING</li>
                <li className="hover:text-white transition-colors cursor-pointer uppercase">CARRIER MOUNTAIN</li>
                <li className="hover:text-white transition-colors cursor-pointer uppercase">ALAT MASAK</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-primary italic">Basecamp Kami</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 text-primary"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/></svg></div>
                  <p className="text-gray-400 text-sm font-bold uppercase italic leading-tight">Sidoarjo, Jawa Timur, Indonesia</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 text-primary"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.455 5.455l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg></div>
                  <p className="text-gray-400 text-sm font-bold uppercase italic leading-tight">+62 851-2345-6789</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">© 2026 NONA PETUALANG. SEMUA HAK DILINDUNGI.</p>
            <div className="flex gap-8">
               <a href="#faq" className="text-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">FAQ</a>
               <a href="#" className="text-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">SYARAT & KETENTUAN</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}