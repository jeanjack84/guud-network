import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { categories, practitioners, reviews } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const CATEGORIES = [
  { slug: "endometriosis", name: "Endometriosis", emoji: "🌸", description: "Diagnosis, pain management, and surgical care for endometriosis." },
  { slug: "pcos", name: "PCOS", emoji: "🧬", description: "Polycystic ovary syndrome: hormones, metabolism, and fertility." },
  { slug: "fertility", name: "Fertility & IVF", emoji: "🌱", description: "Trying to conceive, fertility testing, IVF and IUI support." },
  { slug: "pregnancy-postpartum", name: "Pregnancy & Postpartum", emoji: "🤰", description: "Prenatal care, birth, and the fourth trimester recovery." },
  { slug: "menopause", name: "Perimenopause & Menopause", emoji: "🔥", description: "Hormone changes, HRT, and symptom relief in midlife." },
  { slug: "menstrual-health", name: "Painful & Irregular Periods", emoji: "🩸", description: "Heavy, painful, or irregular cycles and period care." },
  { slug: "pelvic-floor", name: "Pelvic Floor Health", emoji: "💪", description: "Pelvic pain, prolapse, and pelvic floor rehabilitation." },
  { slug: "sexual-health", name: "Sexual Health", emoji: "💗", description: "Pain during sex, libido, and intimate wellbeing." },
  { slug: "hormones-thyroid", name: "Hormones & Thyroid", emoji: "⚖️", description: "Thyroid, adrenal, and broader hormonal imbalance." },
  { slug: "mental-health", name: "Perinatal & PMDD Mental Health", emoji: "🧠", description: "PMDD, perinatal anxiety and depression, and mood." },
  { slug: "bladder-urogyn", name: "Bladder & Urogynaecology", emoji: "💧", description: "Incontinence, recurrent UTIs, and bladder health." },
  { slug: "lactation", name: "Breastfeeding & Lactation", emoji: "🤱", description: "Latch, supply, and feeding support for new mothers." },
];

// helper to build review objects
type R = { helpedWith: string; authorName: string; rating: number; body: string };

const PRACTITIONERS: Array<{
  slug: string;
  name: string;
  title: string;
  specialties: string[];
  city: string;
  country: string;
  bio: string;
  telehealth: boolean;
  acceptingNew: boolean;
  languages: string[];
  reviews: R[];
}> = [
  {
    slug: "dr-amara-okonkwo",
    name: "Dr. Amara Okonkwo",
    title: "Gynaecologist & Endometriosis Specialist",
    specialties: ["endometriosis", "menstrual-health", "pelvic-floor"],
    city: "Amsterdam",
    country: "Netherlands",
    bio: "Consultant gynaecologist with a sub-specialty in excision surgery for deep endometriosis. Known for listening first and never dismissing pain.",
    telehealth: true,
    acceptingNew: true,
    languages: ["English", "Dutch"],
    reviews: [
      { helpedWith: "endometriosis", authorName: "Lieke", rating: 5, body: "After seven years of being told my pain was 'normal', Dr. Okonkwo took one look at my history and ordered the right scans. Excision surgery changed my life. She believed me." },
      { helpedWith: "endometriosis", authorName: "Sara", rating: 5, body: "She explained every option without rushing. I finally understood my own body. The follow-up care was just as thorough as the surgery." },
      { helpedWith: "menstrual-health", authorName: "Noor", rating: 5, body: "My periods used to put me in bed for three days. We built a plan together and I have my months back. She treats you like a partner, not a patient." },
      { helpedWith: "pelvic-floor", authorName: "Emma", rating: 4, body: "Very knowledgeable and kind. The wait for a first appointment was a few weeks but completely worth it." },
    ],
  },
  {
    slug: "dr-fatima-haddad",
    name: "Dr. Fatima Haddad",
    title: "Reproductive Endocrinologist (PCOS & Fertility)",
    specialties: ["pcos", "fertility", "hormones-thyroid"],
    city: "Rotterdam",
    country: "Netherlands",
    bio: "Reproductive endocrinologist focused on PCOS and the metabolic side of fertility. Combines medical treatment with practical lifestyle coaching.",
    telehealth: true,
    acceptingNew: true,
    languages: ["English", "Dutch", "Arabic"],
    reviews: [
      { helpedWith: "pcos", authorName: "Yasmin", rating: 5, body: "First doctor to actually explain WHY my cycles were irregular instead of just handing me the pill. We addressed insulin resistance and everything shifted." },
      { helpedWith: "fertility", authorName: "Anouk", rating: 5, body: "Walked us through fertility options with so much warmth. We're pregnant now. I cried in the good way reading her message." },
      { helpedWith: "pcos", authorName: "Priya", rating: 5, body: "She never made me feel like my weight was my fault. Compassionate, evidence-based, and genuinely on your side." },
    ],
  },
  {
    slug: "marta-jansen",
    name: "Marta Jansen",
    title: "Pelvic Floor Physiotherapist",
    specialties: ["pelvic-floor", "pregnancy-postpartum", "bladder-urogyn"],
    city: "Utrecht",
    country: "Netherlands",
    bio: "Specialised pelvic physiotherapist for postpartum recovery, prolapse, and pelvic pain. Gentle, hands-on, and deeply reassuring.",
    telehealth: false,
    acceptingNew: true,
    languages: ["Dutch", "English"],
    reviews: [
      { helpedWith: "pregnancy-postpartum", authorName: "Sanne", rating: 5, body: "Six weeks after birth I felt broken. Marta rebuilt my confidence and my core. I can run again without leaking. Forever grateful." },
      { helpedWith: "pelvic-floor", authorName: "Iris", rating: 5, body: "Years of pelvic pain and no one connected the dots. Marta did, in one session. Patient and incredibly skilled." },
      { helpedWith: "bladder-urogyn", authorName: "Hannah", rating: 4, body: "Really helped with my bladder urgency. Practical exercises that actually fit into real life." },
    ],
  },
  {
    slug: "dr-claire-dubois",
    name: "Dr. Claire Dubois",
    title: "Menopause Specialist & GP",
    specialties: ["menopause", "hormones-thyroid", "mental-health"],
    city: "Brussels",
    country: "Belgium",
    bio: "GP with advanced menopause certification. Champions individualised HRT and takes brain fog and mood symptoms seriously.",
    telehealth: true,
    acceptingNew: true,
    languages: ["French", "English", "Dutch"],
    reviews: [
      { helpedWith: "menopause", authorName: "Veerle", rating: 5, body: "I thought I was losing my mind. Dr. Dubois named it: perimenopause. The right HRT gave me my energy and my marriage back." },
      { helpedWith: "menopause", authorName: "Catherine", rating: 5, body: "She spent a full hour with me. No symptom was 'too small'. I left with a plan and, for the first time in two years, hope." },
      { helpedWith: "hormones-thyroid", authorName: "Martine", rating: 4, body: "Finally a doctor who reads the latest research. Adjusted my thyroid and HRT together instead of in isolation." },
    ],
  },
  {
    slug: "dr-sofia-rossi",
    name: "Dr. Sofia Rossi",
    title: "Fertility Specialist (IVF/IUI)",
    specialties: ["fertility", "pcos", "pregnancy-postpartum"],
    city: "Antwerp",
    country: "Belgium",
    bio: "Fertility consultant running personalised IVF and IUI pathways. Famous for honest odds and emotional honesty.",
    telehealth: true,
    acceptingNew: false,
    languages: ["Dutch", "English", "Italian"],
    reviews: [
      { helpedWith: "fertility", authorName: "Lotte", rating: 5, body: "After two failed rounds elsewhere, Dr. Rossi changed the protocol and held our hands the whole way. Our daughter is six months old." },
      { helpedWith: "fertility", authorName: "Maya", rating: 5, body: "Honest about our chances, never sold us false hope, but never gave up either. That balance is rare and precious." },
      { helpedWith: "pregnancy-postpartum", authorName: "Julie", rating: 5, body: "Her aftercare once I was pregnant was extraordinary. I felt held, not handed off." },
    ],
  },
  {
    slug: "dr-hannah-berg",
    name: "Dr. Hannah Berg",
    title: "Perinatal Psychiatrist",
    specialties: ["mental-health", "pregnancy-postpartum", "menstrual-health"],
    city: "Berlin",
    country: "Germany",
    bio: "Psychiatrist specialising in PMDD, perinatal anxiety, and postpartum depression. Calm, validating, and pragmatic about medication and therapy.",
    telehealth: true,
    acceptingNew: true,
    languages: ["German", "English"],
    reviews: [
      { helpedWith: "mental-health", authorName: "Lena", rating: 5, body: "PMDD nearly cost me my job and relationship. Dr. Berg recognised it immediately. I finally feel like myself three weeks a month, then supported the fourth." },
      { helpedWith: "pregnancy-postpartum", authorName: "Mira", rating: 5, body: "Postpartum anxiety was eating me alive. She was the first person who didn't tell me to 'enjoy every moment'. She helped me recover." },
      { helpedWith: "mental-health", authorName: "Sophie", rating: 4, body: "Thoughtful and never rushed to medicate. We tried therapy first and added support only when I needed it." },
    ],
  },
  {
    slug: "amelia-novak",
    name: "Amelia Novak",
    title: "Women's Health Dietitian",
    specialties: ["pcos", "hormones-thyroid", "menstrual-health"],
    city: "London",
    country: "United Kingdom",
    bio: "Registered dietitian specialising in PCOS, hormonal health, and the gut-hormone connection. No fad diets, ever.",
    telehealth: true,
    acceptingNew: true,
    languages: ["English"],
    reviews: [
      { helpedWith: "pcos", authorName: "Chloe", rating: 5, body: "Amelia gave me a way of eating that calmed my PCOS without obsessing over food. My cycle returned after 14 months." },
      { helpedWith: "hormones-thyroid", authorName: "Grace", rating: 5, body: "She translated confusing bloodwork into a simple plan. Zero judgement, all practical. My energy is back." },
      { helpedWith: "menstrual-health", authorName: "Ruby", rating: 4, body: "Helped my PMS more than anything else I've tried. Wish I'd found her years ago." },
    ],
  },
  {
    slug: "dr-priya-sharma",
    name: "Dr. Priya Sharma",
    title: "Urogynaecologist",
    specialties: ["bladder-urogyn", "pelvic-floor", "menopause"],
    city: "London",
    country: "United Kingdom",
    bio: "Urogynaecology consultant for incontinence, prolapse, and recurrent UTIs. Surgical and non-surgical, always least-invasive first.",
    telehealth: false,
    acceptingNew: true,
    languages: ["English", "Hindi"],
    reviews: [
      { helpedWith: "bladder-urogyn", authorName: "Olivia", rating: 5, body: "Recurrent UTIs ruled my life for years. Dr. Sharma found the cause and broke the cycle. I'd given up hope on regular doctors." },
      { helpedWith: "bladder-urogyn", authorName: "Eleanor", rating: 5, body: "She offered me options before surgery and respected my choice. Dignified care for something I was too embarrassed to discuss." },
      { helpedWith: "pelvic-floor", authorName: "Freya", rating: 4, body: "Prolapse after my second baby felt taboo. She normalised it and fixed it. Wish more women knew help exists." },
    ],
  },
  {
    slug: "tessa-de-vries",
    name: "Tessa de Vries",
    title: "IBCLC Lactation Consultant",
    specialties: ["lactation", "pregnancy-postpartum"],
    city: "The Hague",
    country: "Netherlands",
    bio: "Board-certified lactation consultant doing home and online visits. Saves the 3am feeding panic with calm, expert help.",
    telehealth: true,
    acceptingNew: true,
    languages: ["Dutch", "English"],
    reviews: [
      { helpedWith: "lactation", authorName: "Roos", rating: 5, body: "I was ready to give up on day four. Tessa came that evening, fixed the latch, and stayed until I cried happy tears. A lifeline." },
      { helpedWith: "lactation", authorName: "Floor", rating: 5, body: "Calm, kind, and so knowledgeable. She supported the feeding choice that was right for ME, no pressure either way." },
      { helpedWith: "pregnancy-postpartum", authorName: "Demi", rating: 5, body: "Her postpartum visits were the support the system forgot to give me." },
    ],
  },
  {
    slug: "dr-ingrid-larsen",
    name: "Dr. Ingrid Larsen",
    title: "Gynaecologist (Sexual Health & Pain)",
    specialties: ["sexual-health", "menopause", "pelvic-floor"],
    city: "Copenhagen",
    country: "Denmark",
    bio: "Gynaecologist focused on painful sex, vaginismus, and intimate health through every life stage. Frank, warm, and shame-free.",
    telehealth: true,
    acceptingNew: true,
    languages: ["Danish", "English"],
    reviews: [
      { helpedWith: "sexual-health", authorName: "Astrid", rating: 5, body: "Pain during sex had quietly broken my confidence. Dr. Larsen treated it like the medical issue it is. I have my intimacy back." },
      { helpedWith: "menopause", authorName: "Karen", rating: 5, body: "Vaginal dryness in menopause is barely talked about. She gave me real solutions and zero awkwardness." },
      { helpedWith: "sexual-health", authorName: "Nadia", rating: 4, body: "Vaginismus felt impossible to discuss. She made it easy and the treatment plan is working." },
    ],
  },
  {
    slug: "dr-mei-tan",
    name: "Dr. Mei Tan",
    title: "Endocrinologist (Thyroid & Hormones)",
    specialties: ["hormones-thyroid", "pcos", "menopause"],
    city: "Amsterdam",
    country: "Netherlands",
    bio: "Endocrinologist untangling thyroid, adrenal, and reproductive hormones. Detail-obsessed and a brilliant explainer.",
    telehealth: true,
    acceptingNew: true,
    languages: ["English", "Dutch", "Mandarin"],
    reviews: [
      { helpedWith: "hormones-thyroid", authorName: "Saskia", rating: 5, body: "My thyroid had been 'borderline' for years while I felt terrible. Dr. Tan treated the person, not just the number. Night and day." },
      { helpedWith: "hormones-thyroid", authorName: "Wenjia", rating: 5, body: "She drew diagrams until I understood my own hormones. I've never felt so respected by a specialist." },
      { helpedWith: "pcos", authorName: "Bo", rating: 4, body: "Coordinated my PCOS care with my GP beautifully. Felt like a real team." },
    ],
  },
  {
    slug: "laura-bianchi",
    name: "Laura Bianchi",
    title: "Endometriosis & Chronic Pain Coach",
    specialties: ["endometriosis", "menstrual-health", "mental-health"],
    city: "Milan",
    country: "Italy",
    bio: "Health coach (and endo warrior) helping women navigate diagnosis, advocate in appointments, and live well with chronic pelvic pain.",
    telehealth: true,
    acceptingNew: true,
    languages: ["Italian", "English"],
    reviews: [
      { helpedWith: "endometriosis", authorName: "Giulia", rating: 5, body: "Laura taught me how to be heard by doctors. She's been there. The appointment scripts alone changed my care." },
      { helpedWith: "mental-health", authorName: "Elena", rating: 5, body: "Living with chronic pain is lonely. Laura made me feel understood and gave me tools, not platitudes." },
      { helpedWith: "menstrual-health", authorName: "Bea", rating: 4, body: "Practical help tracking symptoms so my specialist could finally see the pattern." },
    ],
  },
];

async function main() {
  console.log("Seeding The Guud Network...");

  // Clean slate (order matters for FK).
  await db.delete(reviews);
  await db.delete(practitioners);
  await db.delete(categories);

  await db.insert(categories).values(CATEGORIES);
  console.log(`  ${CATEGORIES.length} categories`);

  let reviewCount = 0;
  for (const p of PRACTITIONERS) {
    const [inserted] = await db
      .insert(practitioners)
      .values({
        slug: p.slug,
        name: p.name,
        title: p.title,
        specialties: p.specialties,
        city: p.city,
        country: p.country,
        bio: p.bio,
        telehealth: p.telehealth,
        acceptingNew: p.acceptingNew,
        languages: p.languages,
        source: "curated",
      })
      .returning({ id: practitioners.id });

    for (const r of p.reviews) {
      await db.insert(reviews).values({
        practitionerId: inserted.id,
        helpedWith: r.helpedWith,
        authorName: r.authorName,
        rating: r.rating,
        body: r.body,
        status: "approved",
        verified: true,
      });
      reviewCount++;
    }
  }
  console.log(`  ${PRACTITIONERS.length} practitioners`);
  console.log(`  ${reviewCount} reviews`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
