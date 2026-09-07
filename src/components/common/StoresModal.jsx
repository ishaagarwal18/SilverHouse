import React from 'react';
import { X, MapPin, Phone, Clock, Navigation, Sparkles } from 'lucide-react';

export default function StoresModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const STORES = [
    {
      city: "New Delhi (Flagship)",
      name: "SilverHouse Heritage Flagship",
      address: "F-42, South Extension Part-1, Ring Road, New Delhi 110049",
      phone: "+91 (011) 4567-8900",
      hours: "10:30 AM – 8:30 PM (Open All 7 Days)",
      featured: "Full 999 Murti Sanctum & Custom Locket Studio"
    },
    {
      city: "Mumbai",
      name: "SilverHouse Kala Ghoda Boutique",
      address: "12/B, Ropewalk Lane, Kala Ghoda, Fort, Mumbai 400001",
      phone: "+91 (022) 2288-4321",
      hours: "11:00 AM – 9:00 PM (Mon – Sun)",
      featured: "Designer Sterling Jewellery & Bullion Counter"
    },
    {
      city: "Bengaluru",
      name: "SilverHouse Indiranagar Experience Centre",
      address: "548, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
      phone: "+91 (080) 4125-6789",
      hours: "10:30 AM – 8:30 PM (Open All Days)",
      featured: "Bridal Silver & Newborn Nazariya Studio"
    },
    {
      city: "Jaipur",
      name: "SilverHouse Johari Bazar Artisanal Vault",
      address: "Shop 104, Johari Bazar, Pink City, Jaipur 302003",
      phone: "+91 (0141) 256-7890",
      hours: "10:00 AM – 8:00 PM (Tue – Sun)",
      featured: "Master Silversmith Live Workshop & Assay Lab"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#EAE2D5] rounded-3xl shadow-2xl border border-[#C5B299] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#071526] via-[#0B2545] to-[#143A66] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                SilverHouse Flagship Stores
              </h3>
              <p className="text-xs text-white/80 font-sans">
                Experience authentic silver artistry in person across India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stores List */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#DFD4C0]">
          {STORES.map((st, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#F8F4EC] rounded-2xl border border-[#C5B299] shadow-xs hover:border-[#9A650C] hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#C5B299]/40 gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-[#9A650C] tracking-wider uppercase bg-[#9A650C]/15 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-[#9A650C]/30">
                    {st.city}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#071526]">
                    {st.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-[#0B2545] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#9A650C]" />
                  <span>{st.featured}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4E6073]">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#0B2545] shrink-0 mt-0.5" />
                  <span>{st.address}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#0B2545] shrink-0" />
                    <span>{st.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#0B2545] shrink-0" />
                    <span>{st.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#EAE2D5] border-t border-[#C5B299] flex items-center justify-between text-xs text-[#4E6073]">
          <span>Complimentary BIS Hallmarking certificate check available at all stores.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0B2545] hover:bg-[#143A66] text-[#F8E6C8] font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
