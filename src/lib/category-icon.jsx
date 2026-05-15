import * as LucideIcons from "lucide-react";
import { Store } from "lucide-react";

/** Lucide PascalCase adından bileşen (örn. UtensilsCrossed) */
export function getLucideIconByName(name) {
    if (!name || typeof name !== "string") return null;
    const key = name.trim();
    if (!key || key.startsWith("http")) return null;
    if (/[\u{1F300}-\u{1FAFF}]/u.test(key)) return null;
    const Icon = LucideIcons[key];
    return Icon && typeof Icon === "function" ? Icon : null;
}

export function isIconUrl(value) {
    if (!value || typeof value !== "string") return false;
    const v = value.trim();
    return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/");
}

export function isEmojiIcon(value) {
    if (!value || typeof value !== "string") return false;
    const v = value.trim();
    if (v.length > 4) return false;
    return /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(v);
}

/**
 * Kategori ikon kutusu: Lucide adı → ikon; URL → img; yoksa imageUrl → img; son çare emoji.
 */
export function CategoryIconVisual({
    icon,
    imageUrl,
    emoji = "🏪",
    className = "h-8 w-8",
    imageClassName = "h-full w-full object-cover",
    accent,
}) {
    const LucideIcon = getLucideIconByName(icon);

    if (LucideIcon) {
        return (
            <LucideIcon
                className={className}
                style={accent ? { color: accent } : undefined}
                strokeWidth={2.25}
                aria-hidden
            />
        );
    }

    if (isIconUrl(icon)) {
        return (
            <img
                src={icon.trim()}
                alt=""
                className={imageClassName}
            />
        );
    }

    if (isEmojiIcon(icon)) {
        return <span className="text-3xl leading-none">{icon.trim()}</span>;
    }

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt=""
                className={imageClassName}
            />
        );
    }

    return <span className="text-3xl leading-none">{emoji}</span>;
}

export function CategoryIconVisualWithFallback({ icon, imageUrl, emoji, ...rest }) {
    const hasLucide = Boolean(getLucideIconByName(icon));
    const hasImg = isIconUrl(icon) || imageUrl;
    if (!hasLucide && !hasImg && !isEmojiIcon(icon)) {
        return (
            <Store
                className={rest.className || "h-8 w-8 text-slate-400"}
                strokeWidth={2}
                aria-hidden
            />
        );
    }
    return (
        <CategoryIconVisual
            icon={icon}
            imageUrl={imageUrl}
            emoji={emoji}
            {...rest}
        />
    );
}
