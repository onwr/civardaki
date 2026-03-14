export async function getNeighborhoodPosts(params) {
    const qs = new URLSearchParams();

    qs.set("tab", params.tab);

    if (params.category) qs.set("category", params.category);
    if (params.search) qs.set("search", params.search);
    if (params.city) qs.set("city", params.city);
    if (params.district) qs.set("district", params.district);
    qs.set("page", String(params.page || 1));
    qs.set("limit", String(params.limit || 10));

    const res = await fetch(`/api/neighborhood/posts?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Gönderiler alınamadı");
    }

    return res.json();
}

export async function getNeighborhoodPostById(id) {
    const res = await fetch(`/api/neighborhood/posts/${id}`, {
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Gönderi detayı alınamadı");
    }

    return res.json();
}

export async function toggleNeighborhoodPostLike(postId, payload) {
    const res = await fetch(`/api/neighborhood/posts/${postId}/like`, {
        method: "POST",
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!res.ok) {
        throw new Error("Beğeni işlemi başarısız");
    }

    return res.json();
}