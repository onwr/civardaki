// Mock data for business requests (CRM)
export const mockRequests = [
    {
        id: "REQ-001",
        customerName: "Ayşe Yılmaz",
        customerAvatar: "https://i.pravatar.cc/150?u=ayse",
        type: "İş Teklifi", // İş Teklifi, Soru, Şikayet, Destek
        subject: "Haftalık Toplu Sipariş Hakkında",
        message: "Merhabalar, ofisimiz için haftalık 20 kişilik toplu döner siparişi vermeyi düşünüyoruz. Kurumsal indiriminiz mevcut mu?",
        status: "new", // new, in-progress, answered, closed
        priority: "high", // high, medium, low
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        messages: [
            {
                id: "msg-1",
                sender: "Ayşe Yılmaz",
                text: "Merhabalar, ofisimiz için haftalık 20 kişilik toplu döner siparişi vermeyi düşünüyoruz. Kurumsal indiriminiz mevcut mu?",
                date: new Date(Date.now() - 1000 * 60 * 30),
                isCustomer: true
            }
        ],
        sentiment: "positive",
        category: "Satış"
    },
    {
        id: "REQ-002",
        customerName: "Mehmet Demir",
        customerAvatar: "https://i.pravatar.cc/150?u=mehmet",
        type: "Soru",
        subject: "Glutensiz Seçenekler",
        message: "Menünüzde glutensiz döner veya yan ürün seçeneği bulunuyor mu? Teşekkürler.",
        status: "answered",
        priority: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        messages: [
            {
                id: "msg-2",
                sender: "Mehmet Demir",
                text: "Menünüzde glutensiz döner veya yan ürün seçeneği bulunuyor mu? Teşekkürler.",
                date: new Date(Date.now() - 1000 * 60 * 60 * 2),
                isCustomer: true
            },
            {
                id: "msg-3",
                sender: "Lezzet Dönercisi",
                text: "Merhaba Mehmet Bey, şu an için döner ekmeklerimiz gluten içermektedir. Ancak porsiyon dönerimizi ekmeksiz olarak tercih edebilirsiniz. Yan ürün olarak salatalarımız uygundur.",
                date: new Date(Date.now() - 1000 * 60 * 60 * 1),
                isCustomer: false
            }
        ],
        sentiment: "neutral",
        category: "Ürün Bilgisi"
    },
    {
        id: "REQ-003",
        customerName: "Caner Öz",
        customerAvatar: "https://i.pravatar.cc/150?u=caner",
        type: "Şikayet",
        subject: "Geç Gelen Sipariş",
        message: "Bugün verdiğim sipariş tam 1 saatte geldi ve ürünler soğuktu. Mağduriyetimin giderilmesini rica ediyorum.",
        status: "in-progress",
        priority: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        messages: [
            {
                id: "msg-4",
                sender: "Caner Öz",
                text: "Bugün verdiğim sipariş tam 1 saatte geldi ve ürünler soğuktu. Mağduriyetimin giderilmesini rica ediyorum.",
                date: new Date(Date.now() - 1000 * 60 * 60 * 5),
                isCustomer: true
            },
            {
                id: "msg-5",
                sender: "Lezzet Dönercisi",
                text: "Caner Bey merhaba, yaşadığınız olumsuzluk için çok özür dileriz. Bölgedeki yoğun yağış nedeniyle kuryelerimiz gecikme yaşadı. Sipariş numaranızı paylaşabilir misiniz?",
                date: new Date(Date.now() - 1000 * 60 * 60 * 4),
                isCustomer: false
            },
            {
                id: "msg-6",
                sender: "Caner Öz",
                text: "Sipariş No: #ORD-5542. Teşekkürler.",
                date: new Date(Date.now() - 1000 * 60 * 60 * 3),
                isCustomer: true
            }
        ],
        sentiment: "negative",
        category: "Lojistik"
    },
    {
        id: "REQ-004",
        customerName: "Selin Ak",
        customerAvatar: "https://i.pravatar.cc/150?u=selin",
        type: "Destek",
        subject: "Kupon Kodu Sorunu",
        message: "CIVARDAKI10 kodunu kullanmaya çalışıyorum ama geçersiz diyor. Yardımcı olur musunuz?",
        status: "new",
        priority: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        messages: [
            {
                id: "msg-7",
                sender: "Selin Ak",
                text: "CIVARDAKI10 kodunu kullanmaya çalışıyorum ama geçersiz diyor. Yardımcı olur musunuz?",
                date: new Date(Date.now() - 1000 * 60 * 60 * 24),
                isCustomer: true
            }
        ],
        sentiment: "neutral",
        category: "Promosyon"
    }
];
