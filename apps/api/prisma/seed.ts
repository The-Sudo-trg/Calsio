/**
 * CALSIO seed — 8 flagship products (§10), demo reviews.
 * Run: npm run db:seed -w apps/api  (after db:migrate)
 * Product photos are royalty-free placeholders, flagged for replacement before launch.
 */

import { PrismaClient, Category, Gender } from '@prisma/client';

const db = new PrismaClient();

const PLACEHOLDER_IMG = (slug: string, n: number) =>
  `https://placehold.co/800x800/F7F1E8/C4552D?text=CALSIO+${slug.replace(/-/g, '+')}+${n}`;

type SeedProduct = {
  slug: string;
  name: string;
  mrp: number;
  price: number;
  category: Category;
  gender: Gender;
  description: string;
  descriptionHi: string;
  craftStory: string;
  material: string;
  occasion: string;
  colorway: string;
  isCodEnabled: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: 'stepone-court-sneaker-ivory',
    name: 'Calsio StepOne Court Sneaker (Ivory)',
    mrp: 3499, price: 2499, category: 'SNEAKERS', gender: 'UNISEX',
    description: 'Court-cut canvas sneaker in ivory with a memory-foam insole. Daily-wear king: 12-hour comfort, no break-in period, stitched not glued where it matters.',
    descriptionHi: 'आइवरी कोर्ट-कट कैनवास स्नीकर, मेमरी-फोम इनसोल के साथ। 12 घंटे आराम, बिना दर्द, करीगरी से सिला हुआ।',
    craftStory: 'Lasted by hand in Agra’s central workshops — the same benches that have shaped court shoes since the 1960s.',
    material: 'Canvas upper, TPR cup sole, memory-foam insole',
    occasion: 'casual', colorway: 'Ivory', isCodEnabled: true,
  },
  {
    slug: 'regal-loafer-tan',
    name: 'Calsio Regal Loafer (Tan)',
    mrp: 3699, price: 2799, category: 'LOAFERS', gender: 'MEN',
    description: 'Tan vegan-leather penny loafer with a hand-burnished finish. Dress-up, stay-comfortable — office to mehendi without changing shoes.',
    descriptionHi: 'टैन वेगन-लेदर पेनी लोफ़र, हाथ से पॉलिश किया। ऑफिस से मेहंदी तक — जूते बदलने का झंझट नहीं।',
    craftStory: 'The tan shade is burnished in two passes by veteran karigars of Hupkai Gali, the shoemakers’ street of Agra.',
    material: 'Vegan leather, leather-lined footbed, TPR sole',
    occasion: 'office', colorway: 'Tan', isCodEnabled: true,
  },
  {
    slug: 'agrabad-sandal-raag-brown',
    name: 'Calsio Agrabad Sandal (Raag Brown)',
    mrp: 2199, price: 1499, category: 'SANDALS', gender: 'MEN',
    description: 'Two-band leather sandal in warm Raag brown. Cork-blend footbed molds to your foot in a week. The Agra everyday classic, honest price.',
    descriptionHi: 'राग ब्राउन में चमड़े की दो पट्टी सैंडल। कॉर्क फुटबेड एक हफ्ते में आपके पैर की शक्ल ले लेता है।',
    craftStory: 'Cut from full-grain leather sourced through Agra’s own tanneries — traceable to the neighbourhood.',
    material: 'Full-grain leather, cork-blend footbed',
    occasion: 'casual', colorway: 'Raag Brown', isCodEnabled: true,
  },
  {
    slug: 'metro-formal-oxford-onyx',
    name: 'Calsio Metro Formal Oxford (Onyx)',
    mrp: 5999, price: 4499, category: 'FORMAL', gender: 'MEN',
    description: 'Genuine leather cap-toe oxford in onyx black. Goodyear-welted sole, 40+ resoleable. Interview-grade shine, commode-grade comfort — pun intended.',
    descriptionHi: 'असली चमड़े का कैप-टो ऑक्सफोर्ड, गूडयियर-वेल्ट सोल। इंटरव्यू-ग्रेड चमक, सोल 40 रिपेयर हो सकता है।',
    craftStory: 'Goodyear welting is shrinking art — Agra has one of India’s last clusters of welt-carigars. This pair keeps them employed.',
    material: 'Genuine leather, Goodyear-welt, leather outsole',
    occasion: 'office', colorway: 'Onyx', isCodEnabled: false,
  },
  {
    slug: 'ghoomar-strap-sandal-maroon',
    name: 'Calsio Ghoomar Strap Sandal (Maroon)',
    mrp: 2399, price: 1799, category: 'SANDALS', gender: 'WOMEN',
    description: 'Ankle-strap flat sandal in maroon with a braided leather detail. Feather arch support in a traditional silhouette — mandir to mall.',
    descriptionHi: 'मैरून रंग की एंकल-स्ट्रैप सैंडल, ब्रेडेड लेदर गहना। मंदिर से मॉल तक, आराम के साथ।',
    craftStory: 'The braid is woven by hand — 45 minutes of karigari per pair, no shortcuts.',
    material: 'Genuine leather, padded arch, anti-skid sole',
    occasion: 'casual', colorway: 'Maroon', isCodEnabled: true,
  },
  {
    slug: 'tara-runner-blush',
    name: 'Calsio Tara Runner (Blush)',
    mrp: 2999, price: 2199, category: 'SNEAKERS', gender: 'WOMEN',
    description: 'Everyday runner in blush with a knit upper that breathes through Indian summers. 219 grams of nothing — you will forget you are wearing shoes.',
    descriptionHi: 'ब्लश रंग का रनर, कनिट अपर गर्मियों में सांस लेता है। मात्र 219 ग्राम।',
    craftStory: 'Knit from recycled yarns, cut and assembled in Agra with dual-density EVA poured locally.',
    material: 'Recycled knit upper, dual-density EVA',
    occasion: 'casual', colorway: 'Blush', isCodEnabled: true,
  },
  {
    slug: 'durbar-monk-strap-black',
    name: 'Calsio Durbar Monk Strap (Black)',
    mrp: 5499, price: 4499, category: 'FORMAL', gender: 'MEN',
    description: 'Double-monk strap in black with hand-set buckle hardware. The shaadi shoe that outlives the wedding — wear it to every function after.',
    descriptionHi: 'डबल-मोंक स्ट्रैप, काले रंग में, हाथ से जड़े बकल के साथ। शादी के जूते जो शादी से लंबे चलें।',
    craftStory: 'Buckles are brass-cast in Agra’s old town and hand-set. Each strap punched to your last at order time.',
    material: 'Full-grain leather, brass hardware, leather lining',
    occasion: 'party', colorway: 'Onyx Black', isCodEnabled: true,
  },
  {
    slug: 'nawabi-slide-olive',
    name: 'Calsio Nawabi Slide (Olive)',
    mrp: 1899, price: 1299, category: 'SANDALS', gender: 'UNISEX',
    description: 'Olive leather slide with a wide quilted strap. The reach-for-it daily pair — chai run, angan, chhutti.',
    descriptionHi: 'ऑलिव लेदर स्लाइड, चौड़ी किल्टेड पट्टी। चाय वाली दौड़ और घर-घर के काम के लिए।',
    craftStory: 'Quilting done on century-old post-bed machines in Agra — the uneven stitch rhythm only hand-guided quilting leaves behind.',
    material: 'Genuine leather, quilted strap, molded footbed',
    occasion: 'casual', colorway: 'Olive', isCodEnabled: true,
  },
];

const REVIEW_SEEDS = [
  { name: 'Priya S.', city: 'Lucknow', rating: 5, text: 'StepOne 10 din se roz pehna hai — alte pehne se bhi pair pe dard nahi. Packaging dekh ke maa khush ho gayi!' },
  { name: 'Rohit K.', city: 'Jaipur', rating: 5, text: 'Size Oracle ne bilkul sahi size bataya. Pehli baar online joote order kiye, return ki tension khatam.' },
  { name: 'Faisal A.', city: 'Hyderabad', rating: 4, text: 'Tan loafer shaadi me pehna. Log kahan se liya puch rahe the. Itni finishing franchise brand me nahi milti.' },
  { name: 'Meenakshi R.', city: 'Madurai', rating: 5, text: 'Ghoomar sandal mandir me 2 ghante pehna — pair pe ek nishan nahi. Agra ki smaak to alag hi hai.' },
];

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];

async function main() {
  for (const p of PRODUCTS) {
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });

    for (const [i, size] of SIZES.entries()) {
      const sku = `${p.slug}-${size.replace(/\s/g, '')}`.toUpperCase();
      await db.variant.upsert({
        where: { sku },
        update: { stock: 18 - ((i % 4) * 4) },
        create: { productId: product.id, sku, size, colorName: p.colorway, stock: 18 - ((i % 4) * 4) },
      });
    }

    for (let n = 1; n <= 3; n++) {
      await db.image.create({
        data: { productId: product.id, url: PLACEHOLDER_IMG(p.slug, n), alt: `${p.name} view ${n}`, sortOrder: n },
      });
    }
  }

  // demo customer + verified reviews
  const demo = await db.customer.upsert({
    where: { phone: '+919999900000' },
    update: { name: 'Demo Customer' },
    create: { phone: '+919999900000', name: 'Demo Customer' },
  });

  const bySlug = await db.product.findMany({ where: { slug: { in: PRODUCTS.map((p) => p.slug) } } });
  for (let i = 0; i < REVIEW_SEEDS.length; i++) {
    const r = REVIEW_SEEDS[i];
    const product = bySlug[i % bySlug.length];
    await db.review.create({
      data: {
        productId: product.id,
        customerId: demo.id,
        rating: r.rating,
        text: `${r.text} — ${r.name}, ${r.city}`,
        verifiedPurchase: true,
        isPublished: true,
      },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} products, ${PRODUCTS.length * SIZES.length} variants, ${REVIEW_SEEDS.length} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
