// AI Utility Functions

import { aiResponses, aiSuggestions, aiQuickReplies, aiContextMap, aiPersonality } from "./mock-data/ai";

/**
 * Mevcut sayfanın context'ini algılar
 * @param {string} pathname - Mevcut sayfa path'i
 * @returns {string} Context tipi (dashboard, customers, products, vb.)
 */
export function detectContext(pathname) {
  // Exact match kontrolü
  if (aiContextMap[pathname]) {
    return aiContextMap[pathname];
  }

  // Path'e göre eşleştirme
  for (const [path, context] of Object.entries(aiContextMap)) {
    if (pathname.startsWith(path)) {
      return context;
    }
  }

  return "general";
}

/**
 * Soruyu analiz eder ve kategori belirler
 * @param {string} query - Kullanıcı sorusu
 * @returns {string} Kategori (satış, müşteri, stok, finans, performans)
 */
function analyzeQuestion(query) {
  const lowerQuery = query.toLowerCase();

  const keywords = {
    satış: ["satış", "sipariş", "gelir", "kazanç", "ciro", "satmak", "satıyor"],
    müşteri: ["müşteri", "customer", "client", "müşteriler", "churn", "segment"],
    stok: ["stok", "inventory", "ürün", "malzeme", "tedarik", "depo"],
    finans: ["finans", "nakit", "para", "bütçe", "ödeme", "gelir", "gider", "cash"],
    performans: ["performans", "başarı", "sonuç", "metrik", "analiz", "rapor"],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerQuery.includes(word))) {
      return category;
    }
  }

  return null;
}

/**
 * Context'e göre AI yanıtı döndürür
 * @param {string} context - Context tipi
 * @param {string} query - Kullanıcı sorusu (opsiyonel)
 * @returns {string} AI yanıtı
 */
export function getAIResponse(context, query = "") {
  // Greeting kontrolü
  if (!query || query.trim().length === 0) {
    return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
  }

  const lowerQuery = query.toLowerCase().trim();

  // Özel greeting yanıtları
  if (lowerQuery.match(/^(merhaba|selam|hey|hi|hello|günaydın|iyi günler)/i)) {
    return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
  }

  // Soru analizi
  const questionCategory = analyzeQuestion(query);
  if (questionCategory && aiResponses.questions[questionCategory]) {
    const categoryResponses = aiResponses.questions[questionCategory];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  // Context'e göre yanıt
  const responses = aiResponses[context] || aiResponses.general;

  // Query'e göre filtreleme (basit keyword matching)
  if (query) {
    const filtered = responses.filter((response) => {
      const lowerResponse = response.toLowerCase();
      return (
        lowerResponse.includes(lowerQuery) ||
        lowerQuery.split(" ").some((word) => lowerResponse.includes(word))
      );
    });

    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }

  // Genel yardımcı yanıt
  const helpfulResponses = [
    "Bu konuda size yardımcı olabilirim. Daha spesifik bir soru sorarsanız daha detaylı yanıt verebilirim.",
    "Anladım. Bu konuda size yardımcı olmak için hangi bilgiye ihtiyacınız var? Satışlar, müşteriler, stok veya finans konularında sorularınız varsa çekinmeyin.",
    "Bu konu hakkında daha fazla bilgi verebilirim. Hangi alanda yardıma ihtiyacınız var?",
  ];

  return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
}

/**
 * Context'e göre AI önerileri döndürür
 * @param {string} context - Context tipi
 * @returns {Array} AI önerileri
 */
export function getAISuggestions(context) {
  return aiSuggestions[context] || [];
}

/**
 * Context'e göre hızlı yanıtlar döndürür
 * @param {string} context - Context tipi
 * @returns {Array} Hızlı yanıtlar
 */
export function getQuickReplies(context) {
  return aiQuickReplies[context] || aiQuickReplies.dashboard;
}

/**
 * AI yanıtını typing effect ile simüle eder
 * @param {string} text - Gösterilecek metin
 * @param {Function} callback - Her karakter için çağrılacak callback
 * @param {number} speed - Karakter başına milisaniye (varsayılan: 30)
 * @returns {Function} Cancel fonksiyonu
 */
export function simulateTyping(text, callback, speed = 30) {
  let index = 0;
  let cancelled = false;

  const type = () => {
    if (cancelled || index >= text.length) {
      return;
    }

    callback(text.substring(0, index + 1));
    index++;
    setTimeout(type, speed);
  };

  type();

  // Cancel fonksiyonu
  return () => {
    cancelled = true;
  };
}

/**
 * AI yanıtını delay ile döndürür (gerçekçi API simülasyonu)
 * @param {string} context - Context tipi
 * @param {string} query - Kullanıcı sorusu
 * @param {number} delay - Milisaniye cinsinden gecikme (varsayılan: 500-1500ms arası rastgele)
 * @returns {Promise<string>} AI yanıtı
 */
export async function getAIResponseAsync(context, query = "", delay = null) {
  const actualDelay =
    delay != null ? delay : Math.floor(Math.random() * 1000) + 500;

  return new Promise((resolve) => {
    setTimeout(() => {
      const response = getAIResponse(context, query);
      resolve(response);
    }, actualDelay);
  });
}

/**
 * Ürün açıklaması üretir (mock)
 * @param {Object} product - Ürün bilgileri
 * @returns {string} Üretilmiş açıklama
 */
export function generateProductDescription(product) {
  const templates = [
    `${product.name} - ${product.shortDescription || "Kaliteli ve lezzetli ürünümüz."} Geleneksel yöntemlerle hazırlanmış, taze malzemelerle üretilmiştir.`,
    `En taze malzemelerle hazırlanan ${product.name}. ${product.shortDescription || "Müşterilerimizin favori ürünlerinden biri."} Özel tarifimizle sunulmaktadır.`,
    `${product.name} - ${product.shortDescription || "Lezzet garantili ürünümüz."} Günlük olarak taze hazırlanır ve müşterilerimize en iyi kalitede sunulur.`,
  ];

  // Deterministic choice based on product identity to avoid hydration mismatch
  const id = String(product.id || product.name || "0");
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  const index = sum % templates.length;

  return templates[index];
}

/**
 * Fiyat önerisi üretir (mock)
 * @param {Object} product - Ürün bilgileri
 * @returns {Object} Fiyat önerisi
 */
export function generatePriceSuggestion(product) {
  const currentPrice = product.price || 0;
  const costPrice = product.costPrice || currentPrice * 0.6;

  // Basit fiyat optimizasyonu mantığı
  const margin = ((currentPrice - costPrice) / currentPrice) * 100;

  let suggestedPrice = currentPrice;
  let reason = "";
  let expectedIncrease = 0;

  if (margin > 50) {
    // Yüksek kar marjı, fiyatı düşürebiliriz
    suggestedPrice = currentPrice * 0.93; // %7 indirim
    reason = "Yüksek kar marjı nedeniyle rekabetçi fiyatlandırma önerisi";
    expectedIncrease = 15;
  } else if (margin < 30) {
    // Düşük kar marjı, fiyatı artırabiliriz
    suggestedPrice = currentPrice * 1.05; // %5 artış
    reason = "Düşük kar marjı nedeniyle fiyat artışı önerisi";
    expectedIncrease = -5;
  } else {
    // Optimal marj, mevcut fiyat uygun
    suggestedPrice = currentPrice;
    reason = "Mevcut fiyat optimal görünüyor";
    expectedIncrease = 0;
  }

  return {
    currentPrice: currentPrice.toFixed(2),
    suggestedPrice: suggestedPrice.toFixed(2),
    change: ((suggestedPrice - currentPrice) / currentPrice * 100).toFixed(1),
    reason,
    expectedIncrease,
  };
}

/**
 * SEO önerileri üretir (mock)
 * @param {Object} product - Ürün bilgileri
 * @returns {Object} SEO önerileri
 */
export function generateSEORecommendations(product) {
  const keywords = [
    "taze",
    "geleneksel",
    "ev yapımı",
    "organik",
    "lezzetli",
    "kaliteli",
    "doğal",
    "türk mutfağı",
  ];

  const existingKeywords = product.keywords || [];
  const suggestedKeywords = keywords.filter(
    (kw) => !existingKeywords.some((ek) => ek.toLowerCase().includes(kw))
  );

  return {
    title: `${product.name} - ${product.shortDescription || "Kaliteli Ürün"} | Lezzet Durağı`,
    description: `${product.name} hakkında detaylı bilgi. ${product.shortDescription || "En taze malzemelerle hazırlanmış kaliteli ürün."} Sipariş vermek için hemen tıklayın!`,
    keywords: [...existingKeywords, ...suggestedKeywords.slice(0, 3)],
    suggestions: [
      "Ürün başlığına 'taze' kelimesini ekleyin",
      "Açıklamaya 'geleneksel' kelimesini ekleyin",
      "Meta açıklamayı 150-160 karakter arasında tutun",
    ],
  };
}

/**
 * Satış tahmini üretir (mock)
 * @param {Object} data - Geçmiş satış verileri
 * @returns {Object} Tahmin sonuçları
 */
export function generateSalesForecast(data) {
  const avgDailySales = data.averageDailySales || 10;
  const trend = data.trend || "stable";

  let multiplier = 1;
  if (trend === "increasing") multiplier = 1.15;
  if (trend === "decreasing") multiplier = 0.9;

  return {
    nextWeek: Math.round(avgDailySales * 7 * multiplier),
    nextMonth: Math.round(avgDailySales * 30 * multiplier),
    nextQuarter: Math.round(avgDailySales * 90 * multiplier),
    trend,
    confidence: 85,
  };
}

/**
 * Müşteri segmentasyonu analizi (mock)
 * @param {Array} customers - Müşteri listesi
 * @returns {Object} Segmentasyon sonuçları
 */
export function generateCustomerSegmentation(customers) {
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalCustomers = customers.length;

  const vip = customers.filter((c) => c.category === "VIP");
  const regular = customers.filter((c) => c.category === "Regular");
  const newCustomers = customers.filter((c) => c.category === "New");

  const vipRevenue = vip.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const regularRevenue = regular.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const newRevenue = newCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return {
    vip: {
      count: vip.length,
      revenue: totalRevenue > 0 ? ((vipRevenue / totalRevenue) * 100).toFixed(1) : 0,
      avgOrder: vip.length > 0 ? (vipRevenue / vip.length).toFixed(2) : 0,
    },
    regular: {
      count: regular.length,
      revenue: totalRevenue > 0 ? ((regularRevenue / totalRevenue) * 100).toFixed(1) : 0,
      avgOrder: regular.length > 0 ? (regularRevenue / regular.length).toFixed(2) : 0,
    },
    new: {
      count: newCustomers.length,
      revenue: totalRevenue > 0 ? ((newRevenue / totalRevenue) * 100).toFixed(1) : 0,
      avgOrder: newCustomers.length > 0 ? (newRevenue / newCustomers.length).toFixed(2) : 0,
    },
  };
}

/**
 * Churn risk analizi (mock)
 * @param {Array} customers - Müşteri listesi
 * @returns {Array} Riskli müşteriler
 */
export function analyzeChurnRisk(customers) {
  const now = new Date();
  const riskCustomers = customers
    .map((customer) => {
      const lastOrderDate = new Date(customer.lastOrderDate || customer.registeredDate);
      const daysSinceLastOrder = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));

      let risk = "low";
      if (daysSinceLastOrder > 30) risk = "high";
      else if (daysSinceLastOrder > 14) risk = "medium";

      return {
        ...customer,
        daysSinceLastOrder,
        risk,
      };
    })
    .filter((c) => c.risk !== "low")
    .sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);

  return riskCustomers;
}

