# GP101 — مرجع الطبيب العام

موقع ويب احترافي مبني على محتوى Notion الخاص بـ GP101، مع نظام اشتراكات وتحكم في الأجهزة.

---

## ✨ المميزات

- 🔐 نظام تسجيل دخول بـ Email + Password
- 📱 قيود الأجهزة (3 أجهزة لكل مستخدم)
- 🌐 يعمل أوفلاين (Service Worker + Cache)
- 📝 ملاحظات شخصية لكل مستخدم على كل موضوع
- 🛠 لوحة تحكم Admin كاملة
- 📋 291 موضوع طبي منظم

---

## 🚀 التشغيل

### 1. المتطلبات
- Node.js 18+
- PostgreSQL
- حساب Cloudflare (مجاني) لو هترفع على Workers — [التفاصيل تحت](#️-الرفع-على-cloudflare-workers)

### 2. التثبيت

```bash
cd gp101-app
npm install
```

### 3. إعداد البيئة

```bash
cp .env.example .env
```

عدّل `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gp101db"
JWT_SECRET="any-long-random-string-min-32-characters"
```

### 4. قاعدة البيانات

```bash
# إنشاء الجداول
npm run db:push

# إنشاء حساب Admin
npm run db:seed
```

بيانات الـ Admin الافتراضية:
- Email: `admin@gp101.com`
- Password: `admin123`
- **⚠️ غيّر الباسورد من لوحة التحكم!**

### 5. التشغيل

```bash
# تطوير
npm run dev

# إنتاج
npm run build
npm start
```

---

## 📁 هيكل المشروع

```
gp101-app/
├── data/
│   └── content.json          # كل محتوى GP101 (291 موضوع)
├── prisma/
│   ├── schema.prisma         # نموذج قاعدة البيانات
│   └── seed.ts               # إنشاء Admin
├── public/
│   └── sw.js                 # Service Worker للأوفلاين
├── src/
│   ├── middleware.ts         # حماية الصفحات
│   ├── lib/
│   │   ├── auth.ts           # JWT helpers
│   │   ├── db.ts             # Prisma client
│   │   └── content.ts        # قراءة المحتوى
│   ├── app/
│   │   ├── login/            # صفحة الدخول
│   │   ├── content/[slug]/   # صفحة الموضوع
│   │   ├── admin/            # لوحة التحكم
│   │   └── api/              # API routes
│   └── components/
│       ├── Sidebar.tsx       # الشريط الجانبي
│       ├── ContentView.tsx   # عرض المحتوى
│       ├── NotesPanel.tsx    # الملاحظات
│       └── OnlineStatus.tsx  # حالة الاتصال
```

---

## 🗄️ قاعدة البيانات

```sql
User       -- المستخدمون (email, password, isActive, expiresAt)
Device     -- الأجهزة (fingerprint, userAgent) - max 3 per user
Note       -- الملاحظات (userId, topicSlug, content)
```

---

## 👨‍💼 لوحة التحكم

الدخول على `/admin` بحساب Admin:

- **إحصائيات**: عدد المشتركين، النشطون، المنتهية اشتراكاتهم
- **إدارة المستخدمين**: إضافة / إيقاف / حذف / تجديد الاشتراك
- **إدارة الأجهزة**: مشاهدة الأجهزة المسجلة وعمل Reset

---

## ☁️ الرفع على Cloudflare (Workers)

المشروع بقى معتمد على [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — الأداة الرسمية لتشغيل تطبيقات Next.js على Cloudflare Workers.

### 1. التثبيت

```bash
npm install
```

### 2. قاعدة البيانات (Hyperdrive)

Cloudflare Workers مش بيقدر يفتح اتصال TCP مباشر مع PostgreSQL، فلازم تعدّي من خلال **Hyperdrive** (بيتصل بأي Postgres عادي زي Supabase/Neon ويعمل connection pooling):

```bash
npx wrangler login
npx wrangler hyperdrive create gp101-db --connection-string="postgresql://USER:PASSWORD@HOST:5432/gp101db"
```

هياخدك الأمر `id` — حطه في `wrangler.jsonc` مكان `YOUR_HYPERDRIVE_ID`.

### 3. KV Namespace (كاش الـ ISR)

```bash
npx wrangler kv namespace create NEXT_CACHE_WORKERS_KV
```

وحط الـ `id` الناتج في `wrangler.jsonc` مكان `YOUR_KV_NAMESPACE_ID`.

### 4. الأسرار (Secrets)

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put DATABASE_URL
```

(`DATABASE_URL` هنا مطلوب فقط لو محتاج تشغّل `prisma migrate`/`db push` مباشرة على القاعدة، مش لازم للـ Worker نفسه لأنه بيستخدم Hyperdrive).

للتجربة محليًا، انسخ `.dev.vars.example` باسم `.dev.vars` واملأ القيم.

### 5. الرفع

```bash
npm run deploy
```

هيعمل: `next build` → `opennextjs-cloudflare build` → `wrangler deploy`.

للمعاينة محليًا (Workers runtime حقيقي، مش next dev):
```bash
npm run preview
```

**ملاحظة مهمة**: Prisma اتظبط يستخدم `@prisma/adapter-pg` (driver adapters) بدل الـ Query Engine الأصلي، لأن Workers مايقدرش يشغّل الـ binary بتاع Prisma. ده بيتم تلقائيًا من `src/lib/db.ts`.

---

## 🔧 إضافة محتوى جديد

عدّل ملف `data/content.json` مباشرة:

```json
{
  "sections": [
    {
      "name": "Medicine الباطنه",
      "subsections": [
        {
          "name": "ER approach",
          "topics": [
            {
              "title": "موضوع جديد",
              "slug": "new-topic-slug",
              "content": "# محتوى الموضوع بـ Markdown"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📞 الدعم الفني

للمشاكل التقنية، تحقق من:
1. صح الـ `DATABASE_URL`
2. `npm run db:push` شغّالة بدون أخطاء
3. الـ `JWT_SECRET` أطول من 32 حرف
