// Mock data for business reviews and feedback
export const mockReviews = [
    {
        id: "rev-1",
        customerName: "Caner Kürkaya", // The designer :)
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        rating: 5,
        metrics: {
            quality: 3, // 1: bad, 2: good, 3: excellent
            speed: 3,
            packaging: 3
        },
        comment: "Tavuk döner efsaneydi, özellikle sosu çok farklı ve lezzetli. Sıcak geldi, teşekkürler!",
        date: new Date("2024-11-20T14:30:00"),
        orderId: "ord-123",
        status: "replied", // pending, replied, reported
        reply: "Afiyet olsun Caner Bey! Sosumuz kendi tarifimizdir, beğenmenize sevindik. Tekrar bekleriz.",
        likes: 5,
        images: ["https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400"]
    },
    {
        id: "rev-2",
        customerName: "Elif Demir",
        avatar: null,
        rating: 4,
        metrics: {
            quality: 3,
            speed: 2,
            packaging: 3
        },
        comment: "Lezzet harika ama kurye biraz yavaş geldi. Yine de sıcak sayılır.",
        date: new Date("2024-11-19T18:45:00"),
        orderId: "ord-124",
        status: "pending",
        reply: null,
        likes: 2
    },
    {
        id: "rev-3",
        customerName: "Murat Yılmaz",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100",
        rating: 2,
        metrics: {
            quality: 2,
            speed: 1,
            packaging: 1
        },
        comment: "Paketleme çok kötüydü, ayran dökülmüş. Döner de soğuktu. Hayal kırıklığı.",
        date: new Date("2024-11-18T20:15:00"),
        orderId: "ord-125",
        status: "pending",
        reply: null,
        likes: 0
    },
    {
        id: "rev-4",
        customerName: "Selin Ak",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 5,
        metrics: {
            quality: 3,
            speed: 3,
            packaging: 2
        },
        comment: "Kadıköy'ün en iyi dönercisi olabilir. Hızına inanamadım, 15 dakikada kapıdaydı.",
        date: new Date("2024-11-17T12:00:00"),
        orderId: "ord-126",
        status: "replied",
        reply: "Selin Hanım harika yorumunuz için teşekkürler! Ekibimiz her zaman en hızlı hizmeti vermeye çalışıyor.",
        likes: 8
    }
];

export const mockReviewStats = {
    averageRating: 4.7,
    totalReviews: 89,
    ratingDistribution: {
        5: 65,
        4: 15,
        3: 5,
        2: 3,
        1: 1
    },
    metricsAverage: {
        quality: 2.8,
        speed: 2.5,
        packaging: 2.7
    },
    sentiment: {
        positive: 85,
        neutral: 10,
        negative: 5
    }
};
