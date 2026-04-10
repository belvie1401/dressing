'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-[#F7F5F2] text-[#111]">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        {/* Logo */}
        <div className="mb-16 lg:mb-24">
          <h1 className="text-2xl font-bold tracking-tight">LIEN</h1>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            {/* Heading */}
            <h2 
              className="mb-6 text-5xl lg:text-6xl font-serif leading-tight tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Votre dressing,{' '}
              <span className="block">connecté aux stylistes</span>
            </h2>

            {/* Subheading */}
            <p className="mb-8 text-lg lg:text-xl text-[#555] leading-relaxed max-w-md">
              Ajoutez vos vêtements, échangez avec des stylistes et recevez des looks personnalisés.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              {/* Primary Button */}
              <Link
                href="/register"
                className="px-8 py-4 bg-[#111] text-white text-center font-medium rounded-full hover:bg-[#333] transition-colors duration-200"
              >
                Commencer
              </Link>

              {/* Secondary Button */}
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-[#111] text-center font-medium rounded-full border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors duration-200"
              >
                Voir comment ça marche
              </Link>
            </div>
          </div>

          {/* Right: Image Placeholder */}
          <div className="flex items-center justify-center">
            <div 
              className="w-full aspect-square bg-gradient-to-br from-[#EBE8E3] to-[#D9D5CF] rounded-2xl flex items-center justify-center"
              style={{ maxHeight: '500px' }}
            >
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-[#999]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-[#999] font-medium">Fashion Image</p>
                <p className="text-sm text-[#BBB]">Replace with your image</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}