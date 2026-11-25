
"use client";

import { useEffect, useState } from "react";
import { createClient } from "./lib/supabase/client";

type Product = {
  id: string;
  name: string;
  name_ne: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  description: string | null;
  description_ne: string | null;
  is_published: boolean;
  availability: string;
  product_images: {
    image_url: string;
    alt_text: string | null;
  }[];
};

const phone = "9779769713777";

const categories = [
  { en: "Sofas", ne: "सोफा", icon: "🛋️" },
  { en: "Beds", ne: "पलङ", icon: "🛏️" },
  { en: "Dining", ne: "डाइनिङ", icon: "🪑" },
  { en: "Wardrobes", ne: "दराज", icon: "🚪" },
  { en: "Doors & Windows", ne: "ढोका तथा झ्याल", icon: "🪵" },
  { en: "Custom Furniture", ne: "अर्डर अनुसार", icon: "🪚" },
];

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const nepali = language === "ne";

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          name_ne,
          category,
          price,
          discount_price,
          description,
          description_ne,
          is_published,
          availability,
          product_images (
            image_url,
            alt_text
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Product loading error:", error);
        setProductError(error.message);
      } else {
        setProducts((data || []) as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const whatsapp = (product?: string) => {
    const message = product
      ? `Namaste! I am interested in ${product}. Please provide more details.`
      : "Namaste! I would like to know more about Langxong Furniture Udhyog.";

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <main className="min-h-screen bg-[#faf7f0] text-[#33251c]">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-[#e8ddce] bg-[#faf7f0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#" className="leading-tight">
            <h1 className="text-xl font-bold tracking-[0.12em] text-[#603c26]">
              LANGXONG
            </h1>
            <p className="text-[10px] tracking-[0.22em]">
              FURNITURE UDHYOG
            </p>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#home">{nepali ? "गृहपृष्ठ" : "Home"}</a>
            <a href="#products">{nepali ? "उत्पादनहरू" : "Products"}</a>
            <a href="#about">{nepali ? "हाम्रो बारेमा" : "About"}</a>
            <a href="#contact">{nepali ? "सम्पर्क" : "Contact"}</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(nepali ? "en" : "ne")}
              className="rounded-full border border-[#b89a7a] px-3 py-2 text-xs font-semibold"
            >
              {nepali ? "EN" : "नेपाली"}
            </button>

            <button
              onClick={() => whatsapp()}
              className="hidden rounded-full bg-[#65432c] px-4 py-2 text-sm text-white sm:block"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="relative flex min-h-[580px] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(35,23,15,.88), rgba(35,23,15,.35)), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1800')",
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="max-w-2xl text-white">
            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-[#e3c49e]">
              Khadbari · Sankhuwasabha
            </p>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              {nepali
                ? "परम्परागत कला, तपाईंको घरका लागि"
                : "Bringing Tradition & Quality to Your Home"}
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#eee2d3]">
              {nepali
                ? "हाम्रो अनुभव र सीपबाट तयार गरिएका गुणस्तरीय फर्निचरले तपाईंको घरलाई अझ सुन्दर बनाउनुहोस्।"
                : "Discover beautifully crafted furniture made with care, quality materials and years of experience."}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#products" className="rounded-full bg-[#d3ad7c] px-7 py-4 font-semibold text-[#302014]">
                {nepali ? "फर्निचर हेर्नुहोस्" : "Explore Furniture"}
              </a>

              <button onClick={() => whatsapp()} className="rounded-full border border-white px-7 py-4 font-semibold text-white">
                {nepali ? "सम्पर्क गर्नुहोस्" : "Contact Us"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="border-b border-[#e9dfd2] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-9 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-[#70482b]">8+</p>
            <p className="mt-2 text-sm text-gray-600">
              {nepali ? "वर्षको अनुभव" : "Years of Experience"}
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-[#70482b]">✦</p>
            <p className="mt-2 text-sm text-gray-600">
              {nepali ? "गुणस्तरीय सामग्री" : "Quality Materials"}
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-[#70482b]">✓</p>
            <p className="mt-2 text-sm text-gray-600">
              {nepali ? "आफ्नो डिजाइन अनुसार" : "Custom-made Furniture"}
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a714c]">
            Explore Our Collection
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {nepali ? "हाम्रा फर्निचरका प्रकारहरू" : "Shop By Category"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(category => (
            <a
              href="#products"
              key={category.en}
              className="rounded-2xl border border-[#e7dac9] bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-4xl">{category.icon}</span>
              <p className="mt-4 text-sm font-semibold">
                {nepali ? category.ne : category.en}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* PRODUCTS FROM SUPABASE */}
      <section id="products" className="bg-[#f0e9de] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a714c]">
              Our Collection
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {nepali ? "हाम्रा फर्निचरहरू" : "Our Furniture Collection"}
            </h2>
          </div>

          {loading ? (
            <p className="py-12 text-center text-gray-600">
              {nepali ? "फर्निचर लोड हुँदैछ..." : "Loading furniture..."}
            </p>
          ) : productError ? (
            <p className="rounded-xl bg-white p-6 text-center text-red-600">
              {productError}
            </p>
          ) : products.length === 0 ? (
            <p className="rounded-xl bg-white p-12 text-center text-gray-600">
              {nepali
                ? "हाल कुनै फर्निचर प्रकाशित गरिएको छैन।"
                : "No furniture has been published yet."}
            </p>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {products.map(product => {
                const firstImage = product.product_images?.[0];

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-64 overflow-hidden bg-[#e6ded2]">
                      {firstImage ? (
                        <img
                          src={firstImage.image_url}
                          alt={firstImage.alt_text || product.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          {nepali ? "तस्बिर उपलब्ध छैन" : "No image available"}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-wider text-[#a27c55]">
                        {product.category.replaceAll("_", " ")}
                      </p>

                      <h3 className="mt-2 text-lg font-bold">
                        {nepali && product.name_ne
                          ? product.name_ne
                          : product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {nepali && product.description_ne
                            ? product.description_ne
                            : product.description}
                        </p>
                      )}

                      <div className="mt-3">
                        {product.discount_price !== null ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xl font-bold text-[#70482b]">
                              Rs. {Number(product.discount_price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              Rs. {Number(product.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xl font-bold text-[#70482b]">
                            Rs. {Number(product.price).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {product.availability === "available"
                          ? (nepali ? "उपलब्ध" : "Available")
                          : product.availability === "out_of_stock"
                            ? (nepali ? "स्टकमा छैन" : "Out of Stock")
                            : (nepali ? "अर्डर अनुसार तयार गरिने" : "Made to Order")}
                      </p>

                      <button
                        onClick={() =>
                          whatsapp(nepali && product.name_ne
                            ? product.name_ne
                            : product.name)
                        }
                        className="mt-5 w-full rounded-full bg-[#65432c] py-3 text-sm font-semibold text-white transition hover:bg-[#3f291a]"
                      >
                        {nepali ? "WhatsApp मा सोध्नुहोस्" : "Inquire on WhatsApp"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000"
            alt="Furniture interior"
            className="h-[420px] w-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a714c]">
            About Our Business
          </p>

          <h2 className="mt-4 text-4xl font-bold leading-tight">
            {nepali ? "हाम्रो परिचय" : "Craftsmanship You Can Trust"}
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            {nepali
              ? "Langxong Furniture Udhyog खाँदबारी, संखुवासभामा रहेको फर्निचर उद्योग हो। करिब ८ वर्षको अनुभवका साथ हामी गुणस्तरीय फर्निचर तथा ग्राहकको आवश्यकता अनुसारका डिजाइनहरू प्रदान गर्ने लक्ष्य राख्छौँ।"
              : "Langxong Furniture Udhyog is based in Khadbari, Sankhuwasabha. With around 8 years of experience, we focus on quality furniture and custom designs to suit our customers' needs."}
          </p>

          <button onClick={() => whatsapp()} className="mt-8 rounded-full bg-[#65432c] px-7 py-4 font-semibold text-white hover:bg-[#3f291a]">
            {nepali ? "हामीसँग कुरा गर्नुहोस्" : "Talk to Us"}
          </button>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#4b3020] px-6 py-20 text-center text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-[#dfc09b]">
          Get In Touch
        </p>

        <h2 className="mt-4 text-3xl font-bold">
          {nepali ? "आफ्नो फर्निचर आजै रोज्नुहोस्" : "Let's Furnish Your Home"}
        </h2>

        <p className="mt-5 text-[#e5d5c5]">
          Khadbari, Sankhuwasabha, Nepal
        </p>

        <p className="mt-2 text-lg">+977 9769713777</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={() => whatsapp()} className="rounded-full bg-[#d3ad7c] px-8 py-4 font-bold text-[#302014] hover:bg-white">
            WhatsApp Us
          </button>

          <a href="tel:+9779769713777" className="rounded-full border border-white px-8 py-4 font-bold hover:bg-white hover:text-[#302014]">
            Call Now
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#302014] px-6 py-8 text-center text-sm text-[#e4d4c2]">
        <h3 className="font-bold tracking-[0.2em]">
          LANGXONG FURNITURE UDHYOG
        </h3>

        <p className="mt-3">Khadbari, Sankhuwasabha, Nepal</p>

        <a
          href="https://www.facebook.com/profile.php?id=61592342863378"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block underline"
        >
          Facebook Page
        </a>
        <a
          href="/login"
          className="mt-6 block w-fit mx-auto rounded-full border border-[#bca995] px-5 py-2 text-xs font-semibold text-[#e4d4c2] transition hover:bg-[#e4d4c2] hover:text-[#302014]"
        >
          Admin Login
        </a>

        <p className="mt-6 text-xs text-[#bca995]">
          © 2026 Langxong Furniture Udhyog. All rights reserved.
        </p>
      </footer>

      {/* FLOATING WHATSAPP */}
      <button
        onClick={() => whatsapp()}
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-xl transition hover:scale-110"
      >
        ☎
      </button>
    </main>
  );
}
