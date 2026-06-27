<div align="center">

# 🏢 WasselERP Enterprise

### أفضل نظام ERP مفتوح المصدر — مجاناً للأبد

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://mongodb.com)

</div>

---

## ✨ المميزات

| الميزة | التفاصيل |
|--------|---------|
| 🏢 متعدد الشركات | كل شركة بيانات ومستخدمين مستقلين |
| 🔐 أمان متقدم | JWT RS256 + RBAC + Audit Trail |
| 🌍 6 لغات | العربية، الإنجليزية، الفرنسية، التركية، الأردية، الإندونيسية |
| 📊 10 وحدات | محاسبة، HR، مشاريع، CRM، مخزون، مشتريات، POS، عقود |
| ⚡ Real-time | إشعارات فورية عبر Socket.io |
| 📱 PWA | يعمل على الجوال بدون إنترنت |
| 🇸🇦 ZATCA | فواتير إلكترونية معتمدة للسعودية |

## 🚀 التشغيل السريع

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 📦 الوحدات

1. **💰 المحاسبة** — دليل الحسابات، قيود يومية، فواتير، ضريبة، ZATCA
2. **👥 الموارد البشرية** — موظفون، عقود، إجازات، رواتب، تقييم أداء
3. **📋 المشاريع** — مهام، Kanban، مراحل، تتبع وقت، ميزانية
4. **🤝 CRM** — عملاء، فرص، عروض أسعار، خط أنابيب المبيعات
5. **📦 المخزون** — منتجات، مستودعات، حركات، تنبيهات الحد الأدنى
6. **🛒 المشتريات** — طلبات عروض، أوامر شراء، موردون، استلام
7. **🏪 نقاط البيع** — كاشير، دفع متعدد، فواتير، تقارير يومية
8. **📄 العقود** — إنشاء، توقيع إلكتروني، تجديد، تنبيهات انتهاء
9. **📊 لوحة التحكم** — KPIs، رسوم بيانية، تنبيهات فورية
10. **⚙️ الإعدادات** — شركة، مستخدمين، أدوار، صلاحيات

## 🛡️ الأمان والامتثال

- JWT مع توقيع RS256
- تشفير كلمات المرور bcrypt (rounds: 14)
- Rate limiting لكل endpoint
- Audit trail لكل عملية
- CORS مُعدّ للإنتاج
- Helmet headers
- Input validation & sanitization

## 📄 الترخيص

MIT License — مجاني للاستخدام التجاري والشخصي
