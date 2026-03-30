# Migration drift (Prisma "reset" istiyor) — ne oluyor?

Veritabanınızda tablolar **zaten var**, ama Prisma `_prisma_migrations` tablosundaki kayıtlar, bu tabloların **migration dosyalarıyla sırayla** oluşturulduğunu göstermiyor. Bu yüzden Prisma “beklediğim şema ile gerçek şema uyuşmuyor” deyip **`migrate reset`** (tüm veriyi silme) öneriyor.

---

## A) Veriyi KORUYARAK — sadece müşteri tablosu (önerilen)

Müşteriler sayfası için yeterli olan: **`business_customer` tablosunu elle eklemek.**

1. MySQL’e bağlan (Workbench, DBeaver, phpMyAdmin vb.).
2. `civardaki` veritabanını seç.
3. Şu dosyanın **tamamını** çalıştır:

   `prisma/migrations/20260318120000_add_business_customer/migration.sql`

4. Tablo zaten varsa hata alırsın (`Table already exists`) — o zaman ekstra bir şey yapmana gerek yok.

Bu adımdan sonra müşteri API’si çalışır. `npx prisma migrate dev` drift yüzünden yine şikayet edebilir; geliştirmede şema değişikliği için geçici olarak **`npx prisma db push`** kullanabilirsin (dikkat: prod’da riskleri oku).

---

## B) Geliştirme veritabanı SİLİNEBİLİRSE

Yerel `civardaki` DB’sinde önemli veri yoksa:

```bash
npx prisma migrate reset
```

Tüm tablolar yeniden oluşturulur, migration geçmişi temizlenir. **Tüm veri gider.**

---

## C) İleride `migrate dev`’in düzgün çalışması (baseline)

Mevcut dolu veritabanı + migration klasörü için resmi yol:  
[Prisma — Baseline an existing database](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining)

Özet: yedek al, `_prisma_migrations` ile gerçek şemayı uzun vadede hizala. Tek seferlik iş.

---

## Hızlı kontrol: eksik tablo mu?

```bash
npx prisma migrate diff --from-url "%DATABASE_URL%" --to-schema-datamodel prisma/schema.prisma --script
```

Çıkan SQL’de çoğunlukla sadece `business_customer` oluşturma görürsen, onu DB’de çalıştırman yeterli olabilir.

*(PowerShell’de `DATABASE_URL` yerine `.env` içindeki bağlantıyı tırnak içinde kullan.)*
