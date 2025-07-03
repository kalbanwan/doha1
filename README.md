# دليل النشر على Firebase Hosting

هذا المشروع يتكون من تطبيقين بسيطين لإدارة الحضور باستخدام Firebase.
بيانات دخول المدير الافتراضية هي:
```
اسم المستخدم: admin
كلمة المرور: Admin@Doha
```

## المتطلبات
- حساب Firebase مفعّل.
- تثبيت أداة Firebase CLI.

## خطوات الإعداد
1. سجّل الدخول إلى Firebase عبر الطرفية:
   ```bash
   firebase login
   ```
2. أنشئ مشروعًا جديدًا في Firebase أو استخدم الموجود.
3. داخل هذا المجلد شغّل:
   ```bash
   firebase init hosting
   ```
   - اختر المشروع المطلوب.
   - عيّن `public` كمسار افتراضي ثم أجب بـ **لا** على SPA.
4. بعد إنشاء الملفات افتح `firebase.json` وأضف الاستضافة الفرعية للمسارات:
   ```json
   {
     "hosting": [
       {
         "target": "member",
         "public": "basma-member",
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
       },
       {
         "target": "admin",
         "public": "basma-admin",
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
       }
     ]
   }
   ```
5. لنشر الموقعين شغّل:
   ```bash
   firebase deploy --only hosting
   ```
سيتم إنشاء رابطين فرعيين على الشكل:
- `https://PROJECT_ID.web.app/member`
- `https://PROJECT_ID.web.app/admin`

تأكد من رفع قواعد Firestore المناسبة وتهيئة الحسابات قبل الاستخدام.
