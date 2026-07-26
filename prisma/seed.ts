import "dotenv/config";
import { PrismaClient, AvailabilityStatus, MessageStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Kameraz seed başlayır...");

  const email = (process.env.ADMIN_EMAIL || "admin@kameraz.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "KamerazAdmin2026!";
  const name = process.env.ADMIN_NAME || "Kameraz Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN" },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`✓ Admin: ${admin.email}`);

  const categoryDefs = [
    { name: "Fotoaparatlar", slug: "fotoaparatlar", description: "Peşəkar foto və hybrid kameralar", icon: "Camera", sortOrder: 1 },
    { name: "Linzalar", slug: "linzalar", description: "Prime və zoom obyektivlər", icon: "Aperture", sortOrder: 2 },
    { name: "İşıqlar", slug: "isiqlar", description: "LED və continuous işıq sistemləri", icon: "Lamp", sortOrder: 3 },
    { name: "Stabilizatorlar", slug: "stabilizatorlar", description: "Gimbal və stabilizasiya", icon: "Move3d", sortOrder: 4 },
    { name: "Aksesuarlar", slug: "aksesuarlar", description: "Tripod, monitor, batareya və digər", icon: "Box", sortOrder: 5 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, sortOrder: c.sortOrder, isVisible: true, showInNav: true },
      create: { ...c, isVisible: true, showInNav: true },
    });
    categories[c.slug] = row.id;
  }
  console.log("✓ Kateqoriyalar");

  const brandNames = ["Canon", "Sony", "Nikon", "DJI", "Blackmagic", "Sigma", "Tamron", "Godox", "Aputure"];
  const brands: Record<string, string> = {};
  for (const b of brandNames) {
    const slug = slugify(b);
    const row = await prisma.brand.upsert({
      where: { slug },
      update: { name: b, isActive: true },
      create: { name: b, slug, isActive: true },
    });
    brands[b] = row.id;
  }
  console.log("✓ Markalar");

  type SeedProduct = {
    name: string;
    category: string;
    brand: string;
    daily: number;
    weekly: number;
    monthly?: number;
    deposit: number;
    featured?: boolean;
    isNew?: boolean;
    short: string;
    long: string;
    specs: { label: string; value: string }[];
    included: string[];
  };

  const products: SeedProduct[] = [
    {
      name: "Canon EOS R5",
      category: "fotoaparatlar",
      brand: "Canon",
      daily: 50,
      weekly: 280,
      monthly: 900,
      deposit: 500,
      featured: true,
      isNew: true,
      short: "45MP full-frame mirrorless. 8K video və peşəkar foto.",
      long: "Canon EOS R5 yüksək rezolyusiya və cinematic video imkanlarını birləşdirən flaqman kameradır. Studio, reklam və event çəkilişləri üçün ideal seçimdir.",
      specs: [
        { label: "Sensor", value: "Full Frame 45MP" },
        { label: "Video", value: "8K RAW / 4K 120p" },
        { label: "Mount", value: "RF" },
        { label: "Çəki", value: "738 qram" },
      ],
      included: ["Kamera gövdəsi", "2x batareya", "Şarj cihazı", "Kəmər", "Çanta"],
    },
    {
      name: "Sony A7S III",
      category: "fotoaparatlar",
      brand: "Sony",
      daily: 55,
      weekly: 300,
      monthly: 950,
      deposit: 550,
      featured: true,
      short: "Low-light kralı. 4K 120p və exceptional ISO performansı.",
      long: "Sony A7S III film və content creator-lar üçün low-light və dinamik diapazon baxımından ən güclü seçimlərdən biridir.",
      specs: [
        { label: "Sensor", value: "Full Frame 12.1MP" },
        { label: "Video", value: "4K 120p 10-bit" },
        { label: "Mount", value: "E-mount" },
        { label: "ISO", value: "80–409600" },
      ],
      included: ["Kamera gövdəsi", "2x batareya", "Şarj", "USB-C kabel"],
    },
    {
      name: "Sony FX3",
      category: "fotoaparatlar",
      brand: "Sony",
      daily: 70,
      weekly: 380,
      monthly: 1200,
      deposit: 700,
      featured: true,
      short: "Cinema Line kompakt kamera. S-Cinetone və active cooling.",
      long: "Sony FX3 peşəkar cinema workflow üçün yaradılmış kompakt kamera. Rig ilə və ya gimbal üzərində mükəmməl işləyir.",
      specs: [
        { label: "Sensor", value: "Full Frame" },
        { label: "Video", value: "4K 120p" },
        { label: "Mount", value: "E-mount" },
        { label: "Kod", value: "XAVC S-I" },
      ],
      included: ["FX3 gövdə", "XLR handle", "2x batareya", "Şarj"],
    },
    {
      name: "Blackmagic Pocket Cinema Camera 6K Pro",
      category: "fotoaparatlar",
      brand: "Blackmagic",
      daily: 65,
      weekly: 350,
      monthly: 1100,
      deposit: 650,
      featured: true,
      short: "6K BRAW, ND filterlər və peşəkar monitoring.",
      long: "BMPCC 6K Pro film look və Blackmagic RAW ilə yüksək səviyyəli prodaksiya üçün nəzərdə tutulub.",
      specs: [
        { label: "Sensor", value: "Super 35 6K" },
        { label: "Video", value: "Blackmagic RAW" },
        { label: "Mount", value: "EF" },
        { label: "ND", value: "Built-in 2/4/6 stop" },
      ],
      included: ["Kamera", "Batteries", "Charger", "Sunhood"],
    },
    {
      name: "Canon RF 24-70mm f/2.8",
      category: "linzalar",
      brand: "Canon",
      daily: 35,
      weekly: 180,
      deposit: 300,
      featured: true,
      short: "Peşəkar standard zoom. kəskinlik və sürət.",
      long: "RF 24-70mm f/2.8 L IS USM studio və event üçün əsas işçi linzadır.",
      specs: [
        { label: "Fokal", value: "24-70mm" },
        { label: "Diafraqma", value: "f/2.8" },
        { label: "Mount", value: "RF" },
        { label: "Stabilizasiya", value: "İS" },
      ],
      included: ["Linza", "Kapaklar", "Hood", "Çanta"],
    },
    {
      name: "Canon RF 70-200mm f/2.8",
      category: "linzalar",
      brand: "Canon",
      daily: 40,
      weekly: 200,
      deposit: 350,
      short: "Kompakt tele zoom. Sport və portret üçün.",
      long: "RF 70-200mm f/2.8 peşəkar telefoto zoom — kiçik forma amma böyük performans.",
      specs: [
        { label: "Fokal", value: "70-200mm" },
        { label: "Diafraqma", value: "f/2.8" },
        { label: "Mount", value: "RF" },
      ],
      included: ["Linza", "Hood", "Tripod collar"],
    },
    {
      name: "Sigma 35mm f/1.4",
      category: "linzalar",
      brand: "Sigma",
      daily: 25,
      weekly: 130,
      deposit: 200,
      isNew: true,
      short: "Art seriyası. Kəskin prime obyektiv.",
      long: "Sigma 35mm f/1.4 Art — cinematic shallow depth və exceptional sharpness.",
      specs: [
        { label: "Fokal", value: "35mm" },
        { label: "Diafraqma", value: "f/1.4" },
        { label: "Seriya", value: "Art" },
      ],
      included: ["Linza", "Kapaklar", "Hood"],
    },
    {
      name: "Sony 24-70mm GM II",
      category: "linzalar",
      brand: "Sony",
      daily: 38,
      weekly: 190,
      deposit: 320,
      featured: true,
      short: "G Master II — daha yüngül, daha sürətli AF.",
      long: "Sony FE 24-70mm F2.8 GM II yeni nəsil standard zoom.",
      specs: [
        { label: "Fokal", value: "24-70mm" },
        { label: "Diafraqma", value: "f/2.8" },
        { label: "Mount", value: "E-mount" },
      ],
      included: ["Linza", "Hood", "Çanta"],
    },
    {
      name: "Godox SL60W",
      category: "isiqlar",
      brand: "Godox",
      daily: 15,
      weekly: 70,
      deposit: 80,
      short: "60W LED continuous işıq. Softbox uyğun.",
      long: "Godox SL60W studio və YouTube çəkilişləri üçün sərfəli continuous işıq.",
      specs: [
        { label: "Güc", value: "60W" },
        { label: "CRT", value: "96+" },
        { label: "Temp", value: "5600K" },
      ],
      included: ["İşıq", "Reflektor", "Softbox", "Stand"],
    },
    {
      name: "Godox VL150",
      category: "isiqlar",
      brand: "Godox",
      daily: 25,
      weekly: 120,
      deposit: 150,
      featured: true,
      short: "150W Bowens LED. Güclü və portativ.",
      long: "VL150 outdoor və studio üçün yüksək çıxışlı LED panel.",
      specs: [
        { label: "Güc", value: "150W" },
        { label: "Mount", value: "Bowens" },
      ],
      included: ["İşıq", "Controller", "Softbox", "Stand"],
    },
    {
      name: "Aputure 300D II",
      category: "isiqlar",
      brand: "Aputure",
      daily: 45,
      weekly: 220,
      deposit: 300,
      featured: true,
      short: "Industry standard 300W LED.",
      long: "Aputure 300D Mark II — peşəkar film setlərinin əsas işığı.",
      specs: [
        { label: "Güc", value: "300W" },
        { label: "CRT", value: "96+" },
        { label: "Mount", value: "Bowens" },
      ],
      included: ["Light head", "Ballast", "Cable", "Softbox"],
    },
    {
      name: "DJI RS 3 Pro",
      category: "stabilizatorlar",
      brand: "DJI",
      daily: 40,
      weekly: 200,
      deposit: 350,
      featured: true,
      isNew: true,
      short: "Peşəkar 3-axis gimbal. LiDAR focus dəstəyi.",
      long: "DJI RS 3 Pro ağır cinema kameralar üçün stabildir və sürətli setup təklif edir.",
      specs: [
        { label: "Payload", value: "4.5 kg" },
        { label: "Axis", value: "3-axis" },
        { label: "Battery", value: "~12 saat" },
      ],
      included: ["Gimbal", "BG30 grip", "Quick release", "Çanta"],
    },
    {
      name: "DJI Ronin-S",
      category: "stabilizatorlar",
      brand: "DJI",
      daily: 25,
      weekly: 120,
      deposit: 200,
      short: "Klassik single-handed gimbal.",
      long: "Ronin-S DSLR və mirrorless üçün etibarlı stabilizasiya.",
      specs: [
        { label: "Payload", value: "3.6 kg" },
        { label: "Axis", value: "3-axis" },
      ],
      included: ["Gimbal", "Tripod", "Charger", "Case"],
    },
    {
      name: "Tripod",
      category: "aksesuarlar",
      brand: "Sony",
      daily: 10,
      weekly: 45,
      deposit: 50,
      short: "Peşəkar video tripod + fluid head.",
      long: "Stabil və hamar pan/tilt üçün peşəkar tripod sistemi.",
      specs: [
        { label: "Max hündürlük", value: "170 sm" },
        { label: "Payload", value: "8 kg" },
      ],
      included: ["Tripod", "Head", "Bag"],
    },
    {
      name: "Wireless mikrofon",
      category: "aksesuarlar",
      brand: "Sony",
      daily: 15,
      weekly: 70,
      deposit: 80,
      short: "2.4GHz wireless lavaliere set.",
      long: "Interview və reels üçün wireless mikrofon dəsti.",
      specs: [
        { label: "Kanallar", value: "2 TX + 1 RX" },
        { label: "Məsafə", value: "100m" },
      ],
      included: ["Transmitter x2", "Receiver", "Lav mics", "Case"],
    },
    {
      name: "Monitor",
      category: "aksesuarlar",
      brand: "Blackmagic",
      daily: 20,
      weekly: 90,
      deposit: 120,
      short: "7\" HDMI field monitor.",
      long: "Focus peaking, false color və waveform ilə field monitor.",
      specs: [
        { label: "Ölçü", value: "7 inch" },
        { label: "Giriş", value: "HDMI" },
      ],
      included: ["Monitor", "Sunhood", "HDMI cable", "Battery plate"],
    },
    {
      name: "Memory card",
      category: "aksesuarlar",
      brand: "Sony",
      daily: 8,
      weekly: 35,
      deposit: 40,
      short: "CFexpress / SD UHS-II yüksək sürətli kart.",
      long: "8K və yüksək bitrate video üçün etibarlı yaddaş kartı.",
      specs: [
        { label: "Tutum", value: "128GB" },
        { label: "Sürət", value: "V90 / CFexpress" },
      ],
      included: ["Kart", "Case"],
    },
    {
      name: "Kamera çantası",
      category: "aksesuarlar",
      brand: "Canon",
      daily: 5,
      weekly: 20,
      deposit: 30,
      short: "Sərt və yumşaq qoruyucu çanta.",
      long: "Avadanlıqların daşınması üçün padded kamera çantası.",
      specs: [{ label: "Tip", value: "Backpack / Shoulder" }],
      included: ["Çanta", "Rain cover"],
    },
    {
      name: "V-Mount batareya",
      category: "aksesuarlar",
      brand: "Sony",
      daily: 12,
      weekly: 55,
      deposit: 100,
      short: "High capacity V-Mount power.",
      long: "Cinema kameralar və işıqlar üçün V-Mount batareya.",
      specs: [
        { label: "Tutum", value: "150Wh" },
        { label: "Çıxış", value: "D-Tap / USB" },
      ],
      included: ["Battery", "Charger"],
    },
  ];

  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    const data = {
      name: p.name,
      slug,
      sku: `KZ-${String(i + 1).padStart(3, "0")}`,
      shortDesc: p.short,
      longDesc: p.long,
      dailyPrice: p.daily,
      weeklyPrice: p.weekly,
      monthlyPrice: p.monthly ?? null,
      deposit: p.deposit,
      showDailyPrice: true,
      showWeeklyPrice: true,
      showMonthlyPrice: !!p.monthly,
      status: AvailabilityStatus.AVAILABLE,
      isFeatured: !!p.featured,
      isNew: !!p.isNew,
      isActive: true,
      sortOrder: i,
      includedItems: p.included,
      usageRules: "Avadanlığı zədələməyin. Gecikmə halında əlavə gün haqqı tutulur. Depozit qaytarılır.",
      seoTitle: `${p.name} kirayə | Kameraz.com`,
      seoDescription: p.short,
      categoryId: categories[p.category],
      brandId: brands[p.brand],
    };

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });

    await prisma.specification.deleteMany({ where: { productId: product.id } });
    await prisma.specification.createMany({
      data: p.specs.map((s, idx) => ({
        productId: product.id,
        label: s.label,
        value: s.value,
        sortOrder: idx,
      })),
    });
  }
  console.log(`✓ ${products.length} məhsul`);

  const settings: Record<string, unknown> = {
    siteName: "Kameraz.com",
    whatsappNumber: "+994501234567",
    whatsappTemplate:
      "Salam. Kameraz.com saytında {name} modelinə baxdım.\n\n{priceType} qiymət: {price}\nİstədiyim tarix: {dates}\nMəhsul linki: {url}\n\nBu avadanlığı kirayə götürmək istəyirəm. Zəhmət olmasa, həmin tarixlərdə boş olub-olmadığını bildirərdiniz.\n{note}",
    phone: "+994501234567",
    email: "info@kameraz.com",
    address: "Bakı, Azərbaycan",
    workingHours: "Hər gün 10:00 – 20:00",
    instagram: "https://instagram.com/kameraz.az",
    tiktok: "https://tiktok.com/@kameraz.az",
    youtube: "https://youtube.com/@kameraz.az",
    footerText: "Kameraz.com — peşəkar çəkiliş avadanlığı kirayəsi.",
    heroTitle: "KAMERAZ",
    heroSlogan: "Çəkilişə hazır avadanlıq. Sən yalnız ideyanı gətir.",
    heroImage: "",
    ctaText: "WhatsApp ilə əlaqə",
    seoTitle: "Kameraz.com — Foto və Video Avadanlıq Kirayəsi Bakı",
    seoDescription:
      "Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.",
    mapsUrl: "https://maps.google.com/?q=Baku",
    announcementBar: "",
    maintenanceMode: false,
    logo: "",
    favicon: "",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }
  console.log("✓ Parametrlər");

  await prisma.navigationItem.deleteMany();
  const nav = [
    { label: "Hamısı", href: "/avadanliqlar", sortOrder: 0 },
    { label: "Fotoaparatlar", href: "/kateqoriya/fotoaparatlar", sortOrder: 1 },
    { label: "Linzalar", href: "/kateqoriya/linzalar", sortOrder: 2 },
    { label: "İşıqlar", href: "/kateqoriya/isiqlar", sortOrder: 3 },
    { label: "Stabilizatorlar", href: "/kateqoriya/stabilizatorlar", sortOrder: 4 },
    { label: "Aksesuarlar", href: "/kateqoriya/aksesuarlar", sortOrder: 5 },
    { label: "Əlaqə", href: "/elaqe", sortOrder: 6 },
  ];
  await prisma.navigationItem.createMany({
    data: nav.map((n) => ({ ...n, isVisible: true })),
  });

  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({
    data: [
      { platform: "Instagram", url: "https://instagram.com/kameraz.az", sortOrder: 0, isVisible: true },
      { platform: "TikTok", url: "https://tiktok.com/@kameraz.az", sortOrder: 1, isVisible: true },
      { platform: "YouTube", url: "https://youtube.com/@kameraz.az", sortOrder: 2, isVisible: true },
    ],
  });

  const r5 = await prisma.product.findUnique({ where: { slug: "canon-eos-r5" } });
  if (r5) {
    await prisma.bookingDate.deleteMany({ where: { productId: r5.id } });
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    await prisma.bookingDate.create({
      data: { productId: r5.id, startDate: start, endDate: end, note: "Nümunə rezervasiya" },
    });
  }

  const msgCount = await prisma.contactMessage.count();
  if (msgCount === 0) {
    await prisma.contactMessage.create({
      data: {
        name: "Elvin Məmmədov",
        email: "elvin@example.com",
        phone: "+994501112233",
        subject: "Canon R5 kirayə",
        message: "Salam, gələn həftə üçün Canon R5 boşdurmu?",
        status: MessageStatus.NEW,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      entity: "System",
      details: { message: "İlkin məlumatlar yükləndi" },
    },
  });

  console.log("\n✅ Seed tamamlandı!");
  console.log(`   Admin: ${email}`);
  console.log(`   Şifrə: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
