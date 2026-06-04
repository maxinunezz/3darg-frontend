import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBrandBySlug } from "@/lib/brands";
import { resolveMediaUrl } from "@/lib/api";
import type { ProductType, CategoryType } from "@/types/product";
import type { BrandFeature, BrandStat, BrandPageConfig } from "@/types/brands";
import { Instagram, Truck, Star, Zap, Shield, ArrowRight, ChevronRight, Cake, Heart, Gift, Camera, Leaf, Music } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { CommunityAuthCTAs } from "@/components/community-auth-ctas";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} | 3DARG`,
    description: brand.slogan || brand.short_description || brand.description || `Productos de ${brand.name}`,
    openGraph: {
      title: brand.name,
      description: brand.slogan || brand.short_description || "",
      images: brand.cover_image ? [{ url: brand.cover_image }] : [],
    },
  };
}

const API =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000/api";

async function getFeaturedProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_featured=true&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

async function getAllProducts(brandSlug: string): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${API}/products/?brand_slug=${brandSlug}&is_available=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

async function getCategories(brandSlug: string): Promise<CategoryType[]> {
  try {
    const res = await fetch(`${API}/categories/?brand_slug=${brandSlug}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch { return []; }
}

// ─── Icon map (los nombres van en page_config.features[].icon) ──────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  zap:    <Zap    className="w-6 h-6" />,
  star:   <Star   className="w-6 h-6" />,
  truck:  <Truck  className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  cake:   <Cake   className="w-6 h-6" />,
  heart:  <Heart  className="w-6 h-6" />,
  gift:   <Gift   className="w-6 h-6" />,
  camera: <Camera className="w-6 h-6" />,
  leaf:   <Leaf   className="w-6 h-6" />,
  music:  <Music  className="w-6 h-6" />,
};

// ─── Community background variants ──────────────────────────────────────────
function MiniSlamCourtSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Court outline */}
      <rect x="40" y="30" width="1120" height="540" fill="none" stroke="white" strokeWidth="2.5" opacity="0.08"/>
      {/* Half-court line */}
      <line x1="600" y1="30" x2="600" y2="570" stroke="white" strokeWidth="2" opacity="0.08"/>
      {/* Center circle */}
      <circle cx="600" cy="300" r="130" fill="none" stroke="white" strokeWidth="2.5" opacity="0.08"/>
      <circle cx="600" cy="300" r="8"   fill="white" opacity="0.06"/>
      {/* Left three-point arc */}
      <path d="M40,95 L220,95 L220,505 L40,505" fill="none" stroke="white" strokeWidth="2" opacity="0.07"/>
      <path d="M220,95 Q500,300 220,505" fill="none" stroke="white" strokeWidth="2" opacity="0.07"/>
      {/* Left key */}
      <rect x="40" y="195" width="215" height="210" fill="none" stroke="white" strokeWidth="1.8" opacity="0.07"/>
      <circle cx="40" cy="300" r="70" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="8,7" opacity="0.06"/>
      {/* Right three-point arc */}
      <path d="M1160,95 L980,95 L980,505 L1160,505" fill="none" stroke="white" strokeWidth="2" opacity="0.07"/>
      <path d="M980,95 Q700,300 980,505" fill="none" stroke="white" strokeWidth="2" opacity="0.07"/>
      {/* Right key */}
      <rect x="945" y="195" width="215" height="210" fill="none" stroke="white" strokeWidth="1.8" opacity="0.07"/>
      <circle cx="1160" cy="300" r="70" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="8,7" opacity="0.06"/>
    </svg>
  );
}

function PrintGymCommunityBG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Flat-top hex grid, R=25 */}
        <pattern id="hexgrid-pg" x="0" y="0" width="75" height="43.3" patternUnits="userSpaceOnUse">
          <polygon points="25,21.65 12.5,43.3 -12.5,43.3 -25,21.65 -12.5,0 12.5,0"    fill="none" stroke="white" strokeWidth="0.8"/>
          <polygon points="62.5,0 50,21.65 25,21.65 12.5,0 25,-21.65 50,-21.65"        fill="none" stroke="white" strokeWidth="0.8"/>
          <polygon points="62.5,43.3 50,65 25,65 12.5,43.3 25,21.65 50,21.65"          fill="none" stroke="white" strokeWidth="0.8"/>
        </pattern>
      </defs>

      {/* Hex grid full background */}
      <rect width="1200" height="500" fill="url(#hexgrid-pg)" opacity="0.15"/>

      {/* Dumbbell — right side */}
      <g fill="white" opacity="0.08" transform="translate(820, 130)">
        <rect x="0"   y="8"   width="32" height="100" rx="5"/>
        <rect x="4"   y="0"   width="24" height="22"  rx="4"/>
        <rect x="4"   y="102" width="24" height="22"  rx="4"/>
        <rect x="32"  y="52"  width="150" height="20" rx="5"/>
        <rect x="182" y="8"   width="32" height="100" rx="5"/>
        <rect x="186" y="0"   width="24" height="22"  rx="4"/>
        <rect x="186" y="102" width="24" height="22"  rx="4"/>
      </g>

      {/* 3D printer nozzle + print layers — left side */}
      <g fill="white" opacity="0.13">
        {/* Gantry vertical rod */}
        <rect x="117" y="10"  width="4"   height="68" rx="2"/>
        {/* Carriage body */}
        <rect x="100" y="76"  width="40"  height="18" rx="3"/>
        {/* Nozzle tip */}
        <path d="M114,94 L126,94 L122,110 L118,110 Z"/>
        {/* Print layers — pyramid growing outward */}
        <rect x="96"  y="116" width="48"  height="7" rx="2"/>
        <rect x="88"  y="127" width="64"  height="7" rx="2"/>
        <rect x="80"  y="138" width="80"  height="7" rx="2"/>
        <rect x="72"  y="149" width="96"  height="7" rx="2"/>
        <rect x="64"  y="160" width="112" height="7" rx="2"/>
        <rect x="56"  y="171" width="128" height="7" rx="2"/>
        <rect x="48"  y="182" width="144" height="7" rx="2"/>
        <rect x="40"  y="193" width="160" height="7" rx="2"/>
        {/* Print bed */}
        <rect x="28"  y="206" width="184" height="5" rx="2"/>
      </g>
    </svg>
  );
}

function LumyPastryIllustration() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="counter" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#FDF6E3"/>
          <stop offset="100%" stopColor="#EFD9A8"/>
        </radialGradient>
        <radialGradient id="cookie1" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#E8A840"/>
          <stop offset="60%" stopColor="#C87020"/>
          <stop offset="100%" stopColor="#9B4E10"/>
        </radialGradient>
        <radialGradient id="cookie2" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#F0B448"/>
          <stop offset="65%" stopColor="#D07828"/>
          <stop offset="100%" stopColor="#A05818"/>
        </radialGradient>
        <radialGradient id="bowl" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#E0D0C0"/>
        </radialGradient>
        <radialGradient id="dough" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF0A0"/>
          <stop offset="100%" stopColor="#E8D070"/>
        </radialGradient>
      </defs>

      {/* ── COUNTER SURFACE ──────────────────────────────────────────── */}
      <rect width="1200" height="600" fill="url(#counter)"/>
      {/* Veta de mármol sutil */}
      <path d="M0,180 Q250,160 480,195 Q700,230 950,175 Q1100,150 1200,190" fill="none" stroke="#E8D4A8" strokeWidth="1.5" opacity="0.5"/>
      <path d="M0,420 Q300,450 550,415 Q800,380 1050,430 Q1150,450 1200,420" fill="none" stroke="#E8D4A8" strokeWidth="1" opacity="0.35"/>

      {/* ── HARINA ESPARCIDA ─────────────────────────────────────────── */}
      <ellipse cx="380" cy="300" rx="160" ry="55" fill="white" opacity="0.55"/>
      <ellipse cx="330" cy="320" rx="100" ry="38" fill="white" opacity="0.45"/>
      <ellipse cx="680" cy="390" rx="70" ry="22" fill="white" opacity="0.4"/>
      {/* Polvillo fino */}
      {[[355,268,9],[400,318,6],[295,255,7],[460,292,5],[270,342,6],[620,365,5],[690,410,4],[510,330,4],[340,280,3],[420,260,5],[300,310,4]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity="0.85"/>
      ))}

      {/* ── BOWL CERÁMICO (izquierda) ────────────────────────────────── */}
      {/* Sombra */}
      <ellipse cx="185" cy="390" rx="140" ry="28" fill="#C0A070" opacity="0.3"/>
      {/* Cuerpo exterior */}
      <path d="M58,258 Q55,395 185,408 Q315,395 312,258 Z" fill="url(#bowl)"/>
      {/* Interior */}
      <path d="M74,265 Q72,385 185,396 Q298,385 296,265 Z" fill="#F8EDD8"/>
      {/* Masa dentro */}
      <ellipse cx="185" cy="340" rx="95" ry="58" fill="url(#dough)"/>
      <ellipse cx="170" cy="325" rx="50" ry="28" fill="#FFF8C0" opacity="0.6"/>
      {/* Borde / rim */}
      <ellipse cx="185" cy="258" rx="127" ry="22" fill="white"/>
      <ellipse cx="185" cy="258" rx="112" ry="16" fill="#F0E4CC"/>
      {/* Línea azul del borde (cerámica) */}
      <path d="M58,258 Q58,238 185,238 Q312,238 312,258" fill="none" stroke="#6AAAD0" strokeWidth="7" strokeLinecap="round"/>
      <path d="M68,255 Q68,242 185,242 Q302,242 302,255" fill="none" stroke="#8FCCE8" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>

      {/* ── CUCHARA DE MADERA ────────────────────────────────────────── */}
      <rect x="238" y="145" width="14" height="175" rx="7" fill="#C07838" transform="rotate(22,245,232)"/>
      <ellipse cx="228" cy="163" rx="20" ry="13" fill="#D4956A" transform="rotate(22,228,163)"/>
      <ellipse cx="226" cy="161" rx="13" ry="8" fill="#C07838" opacity="0.5" transform="rotate(22,226,161)"/>

      {/* ── ROLLING PIN (diagonal, centro) ───────────────────────────── */}
      {/* Sombra */}
      <ellipse cx="600" cy="355" rx="205" ry="16" fill="#B89060" opacity="0.28" transform="rotate(-18,600,355)"/>
      {/* Mango izquierdo */}
      <rect x="372" y="264" width="58" height="26" rx="13" fill="#9B5825" transform="rotate(-18,401,277)"/>
      <rect x="378" y="267" width="46" height="10" rx="5" fill="#B87040" opacity="0.5" transform="rotate(-18,401,272)"/>
      {/* Mango derecho */}
      <rect x="768" y="215" width="58" height="26" rx="13" fill="#9B5825" transform="rotate(-18,797,228)"/>
      <rect x="774" y="218" width="46" height="10" rx="5" fill="#B87040" opacity="0.5" transform="rotate(-18,797,223)"/>
      {/* Cilindro */}
      <rect x="420" y="248" width="360" height="54" rx="27" fill="#D49060" transform="rotate(-18,600,275)"/>
      {/* Brillo */}
      <rect x="428" y="252" width="344" height="18" rx="9" fill="#EAB880" opacity="0.55" transform="rotate(-18,600,261)"/>
      {/* Anillos */}
      {[500,552,604,656,708,760].map((x,i)=>(
        <line key={i} x1={x} y1={254} x2={x-16} y2={296} stroke="#9B5825" strokeWidth="2.5" opacity="0.4" transform="rotate(-18,600,275)"/>
      ))}

      {/* ── CORTANTE ESTRELLA ────────────────────────────────────────── */}
      <path d="M558,432 L571,472 L612,472 L579,496 L592,536 L558,512 L524,536 L537,496 L504,472 L545,472 Z"
            fill="none" stroke="#C8A870" strokeWidth="3.5" strokeLinejoin="round"/>

      {/* ── CORTANTE CORAZÓN ─────────────────────────────────────────── */}
      <path d="M718,415 C718,400 737,388 748,400 C759,388 778,400 778,415 C778,436 748,462 748,462 C748,462 718,436 718,415 Z"
            fill="none" stroke="#C8A870" strokeWidth="3.5"/>

      {/* ── MASA EXTENDIDA (círculos sin hornear) ────────────────────── */}
      <ellipse cx="500" cy="388" rx="36" ry="9" fill="#F4E090" opacity="0.75"/>
      <ellipse cx="572" cy="368" rx="33" ry="8" fill="#EED880" opacity="0.7"/>
      <ellipse cx="640" cy="400" rx="32" ry="8" fill="#F0E088" opacity="0.68"/>

      {/* ── BANDEJA + COOKIES HORNEADAS ──────────────────────────────── */}
      {/* Bandeja de horno */}
      <rect x="782" y="255" width="340" height="238" rx="14" fill="#B89878" opacity="0.55"/>
      <rect x="794" y="267" width="316" height="214" rx="9" fill="#C8A888" opacity="0.4"/>
      {/* Papel mantequilla */}
      <rect x="800" y="272" width="305" height="204" rx="5" fill="#FFF8E8" opacity="0.6"/>

      {/* Cookie A */}
      <circle cx="862" cy="328" r="42" fill="#A05010" opacity="0.35"/>
      <circle cx="858" cy="324" r="42" fill="url(#cookie1)"/>
      <circle cx="843" cy="312" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="864" cy="326" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="847" cy="340" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="870" cy="310" r="5" fill="#5C2A08" opacity="0.8"/>
      <circle cx="836" cy="330" r="5" fill="#5C2A08" opacity="0.8"/>
      <circle cx="860" cy="344" r="5" fill="#5C2A08" opacity="0.75"/>

      {/* Cookie B */}
      <circle cx="960" cy="322" r="42" fill="#A05010" opacity="0.3"/>
      <circle cx="956" cy="318" r="42" fill="url(#cookie2)"/>
      <circle cx="941" cy="306" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="963" cy="320" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="946" cy="335" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="968" cy="304" r="5" fill="#5C2A08" opacity="0.8"/>
      <circle cx="936" cy="326" r="5" fill="#5C2A08" opacity="0.8"/>

      {/* Cookie C */}
      <circle cx="1064" cy="328" r="42" fill="#A05010" opacity="0.3"/>
      <circle cx="1060" cy="324" r="42" fill="url(#cookie1)"/>
      <circle cx="1045" cy="312" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="1067" cy="326" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="1050" cy="340" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="1073" cy="310" r="5" fill="#5C2A08" opacity="0.8"/>

      {/* Cookie D */}
      <circle cx="862" cy="428" r="42" fill="#A05010" opacity="0.3"/>
      <circle cx="858" cy="424" r="42" fill="url(#cookie2)"/>
      <circle cx="843" cy="412" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="865" cy="426" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="848" cy="440" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="870" cy="410" r="5" fill="#5C2A08" opacity="0.8"/>

      {/* Cookie E */}
      <circle cx="960" cy="428" r="42" fill="#A05010" opacity="0.3"/>
      <circle cx="956" cy="424" r="42" fill="url(#cookie1)"/>
      <circle cx="941" cy="412" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="963" cy="427" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="946" cy="440" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="968" cy="411" r="5" fill="#5C2A08" opacity="0.8"/>
      <circle cx="937" cy="432" r="5" fill="#5C2A08" opacity="0.75"/>

      {/* Cookie F */}
      <circle cx="1064" cy="428" r="42" fill="#A05010" opacity="0.3"/>
      <circle cx="1060" cy="424" r="42" fill="url(#cookie2)"/>
      <circle cx="1045" cy="412" r="7" fill="#5C2A08" opacity="0.9"/>
      <circle cx="1067" cy="426" r="6" fill="#5C2A08" opacity="0.9"/>
      <circle cx="1050" cy="439" r="7" fill="#5C2A08" opacity="0.9"/>

      {/* ── MACARONS (derecha abajo) ──────────────────────────────────── */}
      {/* Macaron rosa */}
      <ellipse cx="1100" cy="506" rx="44" ry="17" fill="#F09AB0"/>
      <rect x="1056" y="487" width="88" height="20" fill="#F09AB0"/>
      <rect x="1056" y="484" width="88" height="10" rx="3" fill="#FFF4EC"/>
      <ellipse cx="1100" cy="485" rx="44" ry="17" fill="#F09AB0"/>
      <ellipse cx="1100" cy="479" rx="40" ry="11" fill="#F8B8CC"/>
      {/* Macaron verde */}
      <ellipse cx="1155" cy="530" rx="40" ry="15" fill="#A8D498"/>
      <rect x="1115" y="513" width="80" height="18" fill="#A8D498"/>
      <rect x="1115" y="510" width="80" height="9" rx="3" fill="#FFF4EC"/>
      <ellipse cx="1155" cy="511" rx="40" ry="15" fill="#A8D498"/>
      <ellipse cx="1155" cy="506" rx="36" ry="10" fill="#C0E4B0"/>

      {/* ── MANGA PASTELERA ──────────────────────────────────────────── */}
      <path d="M1060,140 L1108,248 L1096,254 L1048,146 Z" fill="#F0E8D8"/>
      <path d="M1048,146 L1096,254 L1090,257 L1042,149 Z" fill="#E0D0B8"/>
      {/* Boquilla */}
      <path d="M1093,257 L1105,282 L1088,278 Z" fill="#C8B090"/>
      {/* Crema */}
      <path d="M1097,280 Q1098,298 1094,315 Q1092,325 1096,332" fill="none" stroke="#FFF5E0" strokeWidth="9" strokeLinecap="round" opacity="0.9"/>
      {/* Cierre manga */}
      <path d="M1048,146 Q1044,134 1056,126 Q1068,118 1074,130" fill="#C8B090"/>
      <line x1="1048" y1="146" x2="1060" y2="140" stroke="#D4C0A0" strokeWidth="5"/>

      {/* ── HUEVOS ───────────────────────────────────────────────────── */}
      <ellipse cx="148" cy="440" rx="28" ry="36" fill="#FFF8E8"/>
      <ellipse cx="141" cy="432" rx="11" ry="14" fill="white" opacity="0.5"/>
      <ellipse cx="208" cy="452" rx="26" ry="33" fill="#FFF8E8" transform="rotate(18,208,452)"/>
      <ellipse cx="202" cy="444" rx="10" ry="13" fill="white" opacity="0.5" transform="rotate(18,202,444)"/>

      {/* ── MANTEQUILLA ──────────────────────────────────────────────── */}
      <rect x="115" y="490" width="96" height="38" rx="6" fill="#FFE870"/>
      <rect x="118" y="493" width="90" height="8" rx="3" fill="#FFF498" opacity="0.65"/>
      <line x1="115" y1="509" x2="211" y2="509" stroke="#E8D030" strokeWidth="1" opacity="0.4"/>

      {/* ── SPRINKLES ────────────────────────────────────────────────── */}
      {[
        [670,448,"#F09AB0"],[692,468,"#98C8F8"],[652,476,"#FFE060"],
        [712,442,"#B8E898"],[736,470,"#F09AB0"],[678,486,"#FFE060"],
        [1025,288,"#F09AB0"],[1040,308,"#B8E898"],[1010,303,"#FFE060"],
        [1020,322,"#98C8F8"],[1048,292,"#F09AB0"],[1030,316,"#B8E898"],
      ].map(([cx,cy,fill],i)=>(
        <rect key={i} x={Number(cx)-3.5} y={Number(cy)-1.5} width="7" height="3" rx="1.5"
              fill={String(fill)} opacity="0.92"
              transform={`rotate(${i*28+10},${cx},${cy})`}/>
      ))}
    </svg>
  );
}

function CyberWeedCommunityBG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="circuit-cw" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="0"  cy="0"  r="1.5" fill="white"/>
          <circle cx="60" cy="0"  r="1.5" fill="white"/>
          <circle cx="0"  cy="60" r="1.5" fill="white"/>
          <circle cx="60" cy="60" r="1.5" fill="white"/>
          <circle cx="30" cy="30" r="1"   fill="white"/>
          <line x1="0"  y1="0"  x2="30" y2="0"  stroke="white" strokeWidth="0.5"/>
          <line x1="30" y1="0"  x2="30" y2="30" stroke="white" strokeWidth="0.5"/>
          <line x1="30" y1="30" x2="60" y2="30" stroke="white" strokeWidth="0.5"/>
          <line x1="60" y1="30" x2="60" y2="60" stroke="white" strokeWidth="0.5"/>
          <line x1="0"  y1="60" x2="30" y2="60" stroke="white" strokeWidth="0.5"/>
          <line x1="30" y1="30" x2="30" y2="60" stroke="white" strokeWidth="0.5"/>
        </pattern>
      </defs>
      {/* Circuit board grid */}
      <rect width="1200" height="500" fill="url(#circuit-cw)" opacity="0.12"/>
      {/* Large cannabis leaf — right side */}
      <g transform="translate(780, 20) scale(2.0)" opacity="0.055" fill="white">
        <path d="M80,140 C68,118 38,108 44,88 C48,75 64,78 72,88 C70,72 80,60 80,60 C80,60 90,72 88,88 C96,78 112,75 116,88 C122,108 92,118 80,140Z"/>
        <path d="M80,155 C56,148 26,150 18,130 C14,118 26,110 36,116 C28,100 36,88 48,92 C58,108 65,133 80,155Z"/>
        <path d="M80,155 C104,148 134,150 142,130 C146,118 134,110 124,116 C132,100 124,88 112,92 C102,108 95,133 80,155Z"/>
        <path d="M66,172 C44,166 14,168 6,147 C2,134 16,126 28,132 C18,116 28,104 40,108 C52,124 59,150 66,172Z"/>
        <path d="M94,172 C116,166 146,168 154,147 C158,134 144,126 132,132 C142,116 132,104 120,108 C108,124 101,150 94,172Z"/>
        <rect x="78" y="172" width="4" height="40" rx="2"/>
      </g>
      {/* Small leaf — left */}
      <g transform="translate(-20, 110) scale(1.3)" opacity="0.03" fill="white">
        <path d="M80,140 C68,118 38,108 44,88 C48,75 64,78 72,88 C70,72 80,60 80,60 C80,60 90,72 88,88 C96,78 112,75 116,88 C122,108 92,118 80,140Z"/>
        <path d="M80,155 C56,148 26,150 18,130 C14,118 26,110 36,116 C28,100 36,88 48,92 C58,108 65,133 80,155Z"/>
        <path d="M80,155 C104,148 134,150 142,130 C146,118 134,110 124,116 C132,100 124,88 112,92 C102,108 95,133 80,155Z"/>
      </g>
    </svg>
  );
}

// ─── Defaults por tipo de marca ──────────────────────────────────────────────
const DEFAULT_FEATURES: BrandFeature[] = [
  { icon: "zap",    title: "Impresión 3D de precisión",  desc: "Cada pieza fabricada capa por capa con tecnología de punta." },
  { icon: "star",   title: "Diseño personalizable",      desc: "Tu logo, tus colores. Productos únicos para tu proyecto." },
  { icon: "truck",  title: "Envíos a todo el país",      desc: "Despachamos a cualquier punto de Argentina en 24-72 hs." },
  { icon: "shield", title: "Garantía de calidad",        desc: "Si no quedás conforme, lo rehacemos. Sin preguntas." },
];

const DEFAULT_STATS = (productCount: number): BrandStat[] => [
  { value: productCount > 0 ? `${productCount}+` : "★", label: "Productos disponibles" },
  { value: "24–72 hs", label: "Tiempo de envío" },
  { value: "🇦🇷", label: "Fabricado en Argentina" },
];

const DEFAULT_SECTIONS: NonNullable<BrandPageConfig["sections"]> = [
  "hero", "stats", "featured", "categories", "features", "lifestyle", "about", "community", "social",
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;

  if (slug === (process.env.NEXT_PUBLIC_MAIN_BRAND_SLUG ?? "3darg")) redirect("/");

  const [brand, featured, allProducts, categories] = await Promise.all([
    getBrandBySlug(slug),
    getFeaturedProducts(slug),
    getAllProducts(slug),
    getCategories(slug),
  ]);

  if (!brand) notFound();

  const cfg = brand.page_config ?? {};
  const hasShop = brand.brand_type !== "services";
  const sections = cfg.sections ?? DEFAULT_SECTIONS;
  const show = (s: string) => sections.includes(s as never);

  const brandCategories = categories;

  const features: BrandFeature[] = cfg.features ?? DEFAULT_FEATURES;
  const stats: BrandStat[] = cfg.stats ?? DEFAULT_STATS(allProducts.length);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {show("hero") && (
        <section className="relative overflow-hidden min-h-[92vh] flex items-center justify-center">
          {brand.cover_image ? (
            <Image
              src={resolveMediaUrl(brand.cover_image)!}
              alt={brand.name}
              fill
              className="object-cover scale-105"
              unoptimized
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          <div className="relative z-10 text-center px-4 py-32 text-white max-w-4xl mx-auto">
            {brand.logo ? (
              <Image
                src={resolveMediaUrl(brand.logo)!}
                alt={`${brand.name} logo`}
                width={260}
                height={104}
                className="mx-auto mb-8 object-contain drop-shadow-2xl"
                unoptimized
                priority
              />
            ) : (
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 drop-shadow-lg">
                {brand.name}
              </h1>
            )}
            {brand.slogan && (
              <p className="text-xl md:text-3xl font-light max-w-2xl mx-auto drop-shadow mb-4 leading-snug">
                {brand.slogan}
              </p>
            )}
            {brand.short_description && (
              <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10">
                {brand.short_description}
              </p>
            )}
            {hasShop && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${slug}/shop`}
                  className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all shadow-xl hover:scale-105"
                >
                  Comprar ahora
                </Link>
                {brand.description && (
                  <a
                    href="#sobre-nosotros"
                    className="border-2 border-white/60 text-white px-10 py-4 rounded-full font-semibold text-lg hover:border-white hover:bg-white/10 transition-all"
                  >
                    Conocer más
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-white/60 rounded-full" />
            </div>
          </div>
        </section>
      )}

      {/* ── PANELS (3 columnas verticales) ───────────────────────────────── */}
      {show("panels") && cfg.panels && cfg.panels.length > 0 && (
        <section className="flex flex-col sm:flex-row sm:h-[88vh] min-h-[700px]">
          {cfg.panels.map((panel, i) => {
            const dest = panel.href.startsWith("http") ? panel.href : `/${slug}${panel.href}`;
            return (
              <Link
                key={i}
                href={dest}
                className="relative flex-1 overflow-hidden group cursor-pointer min-h-[260px] sm:min-h-0"
              >
                {/* Background */}
                {panel.image ? (
                  <Image
                    src={resolveMediaUrl(panel.image)!}
                    alt={panel.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-card" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 group-hover:to-black/40 transition-all duration-500" />
                {/* Primary wash on hover */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />

                {/* Divider */}
                {i < cfg.panels!.length - 1 && (
                  <div className="absolute top-0 right-0 w-px h-full bg-white/10 z-10 hidden sm:block" />
                )}

                {/* Giant background number */}
                <div className="absolute top-5 right-6 text-[140px] font-black leading-none text-white/[0.035] select-none pointer-events-none">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Basketball SVG decoration (when no image) */}
                {!panel.image && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 120 120" className="w-52 h-52 opacity-[0.045]" fill="none" stroke="white">
                      <circle cx="60" cy="60" r="55" strokeWidth="3"/>
                      <path d="M60,5 Q95,30 95,60 Q95,90 60,115" strokeWidth="2.5"/>
                      <path d="M60,5 Q25,30 25,60 Q25,90 60,115" strokeWidth="2.5"/>
                      <line x1="5" y1="60" x2="115" y2="60" strokeWidth="2.5"/>
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 z-10">
                  {panel.subtitle && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary mb-3">
                      {panel.subtitle}
                    </p>
                  )}
                  <h3 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mb-5">
                    {panel.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-primary transition-colors duration-300">
                    <span>Ir ahora</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />
              </Link>
            );
          })}
        </section>
      )}

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      {show("stats") && (
        <section className="bg-primary text-primary-foreground py-5">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 divide-x divide-primary-foreground/20">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center px-4 py-1">
                <p className="text-2xl md:text-3xl font-black">{value}</p>
                <p className="text-xs md:text-sm text-primary-foreground/80 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      {show("featured") && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Lo mejor</p>
              <h2 className="text-4xl font-black uppercase tracking-tight">Destacados</h2>
            </div>
            {hasShop && (
              <Link
                href={`/${slug}/shop`}
                className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors group"
              >
                Ver todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/${slug}/product/${product.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images?.[0]?.image ? (
                    <Image
                      src={resolveMediaUrl(product.images[0].image)!}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl text-muted-foreground/20">📦</div>
                  )}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow">Ver producto</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base leading-snug">{product.name}</h3>
                  {product.category && (
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{product.category.name}</p>
                  )}
                  <p className="text-primary font-black text-xl mt-2">
                    $ {Number(product.price).toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      {show("categories") && hasShop && brandCategories.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explorá</p>
              <h2 className="text-4xl font-black uppercase tracking-tight">Comprar por categoría</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${slug}/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 h-32 flex flex-col justify-between hover:border-primary hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-lg leading-tight">{cat.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors font-semibold">
                    Ver productos <ChevronRight className="w-3 h-3" />
                  </span>
                  <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                </Link>
              ))}
              <Link
                href={`/${slug}/shop`}
                className="group rounded-2xl bg-primary text-primary-foreground p-6 h-32 flex flex-col justify-between hover:opacity-90 transition-all"
              >
                <h3 className="font-bold text-lg">Ver todo</h3>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  Todos los productos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES / POR QUÉ NOSOTROS ──────────────────────────────────── */}
      {show("features") && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Nuestro diferencial</p>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              {cfg.features_title ?? "¿Por qué elegirnos?"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {ICON_MAP[icon] ?? ICON_MAP["star"]}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LIFESTYLE BANNER ─────────────────────────────────────────────── */}
      {show("lifestyle") && hasShop && (
        <section className="relative overflow-hidden bg-black text-white py-24 md:py-36">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-4">
              {brand.slogan || brand.name}
            </p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              {cfg.lifestyle_headline ?? "La calidad"}<br />
              <span className="text-primary">
                {cfg.lifestyle_subheadline ?? "que se nota."}
              </span>
            </h2>
            <Link
              href={`/${slug}/shop`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-xl group mt-4"
            >
              {cfg.lifestyle_cta ?? "Ver colección"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      {show("about") && brand.description && (
        <section id="sobre-nosotros" className="py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Nuestra historia</p>
              <h2 className="text-3xl font-bold">Sobre {brand.name}</h2>
            </div>
            <div className="space-y-6">
              {brand.description.split("\n\n").map((para, i) => {
                const isCallout = para.trim().length < 40;
                return isCallout ? (
                  <p key={i} className="text-primary font-black text-2xl md:text-3xl text-center py-2 tracking-tight">
                    {para.trim()}
                  </p>
                ) : (
                  <p key={i} className="text-muted-foreground leading-relaxed text-lg">
                    {para.trim()}
                  </p>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER (legacy, desactivado por defecto) ─────────────── */}
      {show("newsletter") && (
        <section className="bg-muted/40 py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Comunidad</p>
            <h2 className="text-3xl font-bold mb-3">
              {cfg.newsletter_title ?? (
                <>Suscribite y recibí un <span className="text-primary">10% OFF</span></>
              )}
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              {cfg.newsletter_subtitle ?? "Ofertas exclusivas y novedades antes que nadie."}
            </p>
            <NewsletterForm cta={cfg.newsletter_cta} />
            <p className="text-xs text-muted-foreground mt-3">Sin spam. Podés darte de baja cuando quieras.</p>
          </div>
        </section>
      )}

      {/* ── COMMUNITY ────────────────────────────────────────────────────── */}
      {(!cfg.sections || cfg.sections.includes("community")) && (() => {
        const headline   = cfg.community_headline    ?? "UNITE A LA";
        const subline    = cfg.community_subheadline ?? "FAMILIA";
        const description = cfg.community_description ??
          "Creá tu cuenta, guardá tus productos favoritos, seguí tus pedidos en tiempo real y accedé a ofertas exclusivas antes que nadie.";
        const benefits   = cfg.community_benefits ?? [
          { emoji: "❤️", label: "Guardá tus favoritos" },
          { emoji: "📦", label: "Historial de pedidos" },
          { emoji: "⚡", label: "Checkout rápido" },
          { emoji: "🎁", label: "Ofertas exclusivas" },
        ];
        const ctaRegister = cfg.community_cta_register ?? "Crear cuenta gratis";
        const ctaLogin    = cfg.community_cta_login    ?? "Ya tengo cuenta";
        const isPrintGym  = cfg.community_bg_variant === "printgym";
        const isMiniSlam  = cfg.community_bg_variant === "minislam";
        const isCyberWeed = cfg.community_bg_variant === "cyberweed";

        // ── MINI SLAM: layout editorial asimétrico ───────────────────────
        if (isMiniSlam) return (
          <section className="relative overflow-hidden bg-black text-white py-24 md:py-36">
            <MiniSlamCourtSVG />

            {/* Slash diagonal naranja */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-[200%] h-40 bg-primary/8 -rotate-[5deg] top-[38%] -left-1/4" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

              {/* Label con línea */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-[2px] bg-primary shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Comunidad</p>
              </div>

              {/* Grid 2 columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end">

                {/* Izquierda — tipografía gigante */}
                <div>
                  <h2
                    className="font-black uppercase leading-[0.82] tracking-tighter"
                    style={{ fontSize: "clamp(72px, 13vw, 160px)" }}
                  >
                    <span className="block text-white">{headline}</span>
                    <span className="block text-primary">{subline}.</span>
                  </h2>
                </div>

                {/* Derecha — descripción + beneficios + CTAs */}
                <div className="flex flex-col gap-8 pb-2">
                  <p className="text-white/55 text-lg leading-relaxed max-w-sm">
                    {description}
                  </p>

                  {/* Benefit cards — estilo stat card, bordes rectos */}
                  <div className="grid grid-cols-3 gap-2">
                    {benefits.map(({ emoji, label }) => (
                      <div
                        key={label}
                        className="border border-white/10 p-4 flex flex-col gap-2 hover:border-primary transition-colors duration-300 group"
                      >
                        <span className="text-2xl">{emoji}</span>
                        <p className="text-[11px] font-semibold text-white/50 leading-snug group-hover:text-white/80 transition-colors">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTAs — rectangulares, estilo jersey */}
                  <CommunityAuthCTAs
                    slug={slug}
                    ctaRegister={ctaRegister}
                    ctaLogin={ctaLogin}
                    containerClass="flex flex-col sm:flex-row gap-3"
                    registerClass="flex-1 bg-primary text-black text-center py-5 font-black text-xs uppercase tracking-[0.25em] hover:bg-primary/85 transition-colors"
                    loginClass="flex-1 border-2 border-white/15 text-white/70 text-center py-5 font-black text-xs uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors"
                  />
                </div>

              </div>
            </div>
          </section>
        );

        // ── CYBER WEED: lifestyle underground ───────────────────────────────
        if (isCyberWeed) return (
          <section
            className="relative overflow-hidden text-white py-24 md:py-32"
            style={{ backgroundColor: "#060e06" }}
          >
            {/* Radial green ambient glow from bottom center */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 55% at 50% 115%, oklch(0.74 0.22 145 / 0.20) 0%, transparent 70%)",
              }}
            />
            <CyberWeedCommunityBG />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
              {/* Label */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-[2px] bg-primary shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Comunidad</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
                {/* Left — headline con tratamiento outline */}
                <div>
                  <h2
                    className="font-black uppercase leading-[0.85] tracking-tighter"
                    style={{ fontSize: "clamp(56px, 10vw, 130px)" }}
                  >
                    <span className="block text-white">{headline}</span>
                    <span
                      className="block"
                      style={{
                        WebkitTextStroke: "2px var(--primary)",
                        color: "transparent",
                      }}
                    >
                      {subline}.
                    </span>
                  </h2>
                </div>

                {/* Right — descripción + beneficios + CTAs */}
                <div className="flex flex-col gap-8">
                  <p className="text-white/55 text-lg leading-relaxed max-w-sm">
                    {description}
                  </p>

                  {/* Benefits como pills horizontales */}
                  <div className="flex flex-wrap gap-3">
                    {benefits.map(({ emoji, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 border border-primary/25 px-4 py-2.5 rounded-full hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
                      >
                        <span className="text-lg">{emoji}</span>
                        <p className="text-xs font-semibold text-white/55 group-hover:text-white/90 transition-colors tracking-wide">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <CommunityAuthCTAs
                    slug={slug}
                    ctaRegister={ctaRegister}
                    ctaLogin={ctaLogin}
                    containerClass="flex flex-col sm:flex-row gap-4"
                    registerClass="flex-1 bg-primary text-black text-center py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-lg hover:scale-105"
                    loginClass="flex-1 border-2 border-primary/30 text-primary text-center py-4 rounded-full font-semibold text-xs uppercase tracking-[0.3em] hover:border-primary hover:bg-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        );

        // ── PRINT GYM ────────────────────────────────────────────────────────
        if (isPrintGym) return (
          <section className="relative overflow-hidden py-24 bg-black text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/30 pointer-events-none" />
            <PrintGymCommunityBG />
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.4em] mb-5 text-white/40">COMUNIDAD</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                {headline}<br /><span className="text-primary">{subline}</span>
              </h2>
              <p className="text-base md:text-lg max-w-md mx-auto mb-12 leading-relaxed text-white/70">{description}</p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
                {benefits.map(({ emoji, label }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex flex-col items-center gap-3">
                    <span className="text-3xl">{emoji}</span>
                    <p className="text-xs font-semibold leading-snug text-center text-white/80">{label}</p>
                  </div>
                ))}
              </div>
              <CommunityAuthCTAs
                slug={slug}
                ctaRegister={ctaRegister}
                ctaLogin={ctaLogin}
                containerClass="flex flex-col sm:flex-row gap-4 justify-center"
                registerClass="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl hover:scale-105"
                loginClass="border-2 border-white/20 text-white/80 px-10 py-4 rounded-full font-semibold text-sm uppercase tracking-widest hover:border-white/50 hover:bg-white/5 transition-all"
              />
            </div>
          </section>
        );

        // ── DEFAULT (Lumy y otras marcas): ilustración de fondo ─────────────
        return (
          <section className="relative overflow-hidden py-28 md:py-40 text-white">
            {/* Ilustración de pastelería */}
            <LumyPastryIllustration />

            {/* Overlay: color de marca izquierda (texto legible) → transparente derecha (ilustración visible) */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/78 to-primary/52 pointer-events-none" />
            {/* Oscurecimiento suave desde abajo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

              {/* Label */}
              <div className="flex items-center gap-3 mb-14">
                <div className="w-8 h-px bg-white/40" />
                <p className="text-[10px] font-bold uppercase tracking-[0.55em] text-white/50">Comunidad</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-28 items-center">

                {/* Columna izquierda — headline + social proof */}
                <div>
                  <h2
                    className="font-black uppercase tracking-tighter leading-[0.85] mb-8"
                    style={{ fontSize: "clamp(48px, 8vw, 108px)" }}
                  >
                    {headline}
                    <br />
                    <span className="text-white/25">{subline}</span>
                  </h2>

                  {/* Social proof */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex -space-x-2">
                      {["🎂", "🍪", "🧁"].map((e, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center text-base"
                        >
                          {e}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-white/65 leading-snug">
                      <span className="font-bold text-white">+500 familias</span>
                      <br className="hidden sm:block" />ya forman parte
                    </p>
                  </div>

                  <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-md">
                    {description}
                  </p>
                </div>

                {/* Columna derecha — beneficios + CTAs */}
                <div className="flex flex-col gap-4">
                  {/* Benefit cards frosted glass */}
                  {benefits.map(({ emoji, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/15 hover:bg-white/18 hover:border-white/30 transition-all duration-300 group"
                    >
                      <span className="text-2xl shrink-0">{emoji}</span>
                      <p className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors leading-snug">
                        {label}
                      </p>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto shrink-0 group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  ))}

                  {/* CTAs */}
                  <CommunityAuthCTAs
                    slug={slug}
                    ctaRegister={ctaRegister}
                    ctaLogin={ctaLogin}
                    containerClass="flex flex-col sm:flex-row gap-3 mt-2"
                    registerClass="flex-1 bg-white text-primary text-center py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all shadow-2xl hover:scale-105"
                    loginClass="flex-1 border-2 border-white/30 text-white text-center py-4 rounded-full font-semibold text-sm uppercase tracking-widest hover:border-white/60 hover:bg-white/10 transition-all"
                  />
                </div>

              </div>
            </div>
          </section>
        );
      })()}

      {/* ── SOCIAL ───────────────────────────────────────────────────────── */}
      {show("social") && brand.social_links && Object.keys(brand.social_links).length > 0 && (
        <section className="py-14 text-center border-t border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Seguinos</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {brand.social_links.instagram && (
              <a
                href={brand.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </a>
            )}
            {Object.entries(brand.social_links)
              .filter(([k]) => k !== "instagram")
              .map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                  className="capitalize font-semibold hover:text-primary transition-colors">
                  {key}
                </a>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
