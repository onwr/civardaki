"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const MultiCartContext = createContext();

export function MultiCartProvider({ children }) {
    const [carts, setCarts] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("civardaki_multi_cart");
            if (stored) {
                setCarts(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load cart from local storage", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("civardaki_multi_cart", JSON.stringify(carts));
        }
    }, [carts, isLoaded]);

    const addToCart = useCallback((slug, item) => {
        setCarts(prev => {
            const currentCart = prev[slug] || [];
            return {
                ...prev,
                [slug]: [...currentCart, item]
            };
        });
    }, []);

    const removeFromCart = useCallback((slug, uniqueId) => {
        setCarts(prev => {
            const currentCart = prev[slug] || [];
            return {
                ...prev,
                [slug]: currentCart.filter(item => item.uniqueId !== uniqueId)
            };
        });
    }, []);

    const clearCart = useCallback((slug) => {
        setCarts(prev => {
            const newCarts = { ...prev };
            delete newCarts[slug];
            return newCarts;
        });
    }, []);

    const getCart = useCallback((slug) => {
        return carts[slug] || [];
    }, [carts]);

    const updateCartItem = useCallback((slug, uniqueId, updates) => {
        setCarts(prev => {
            const currentCart = prev[slug] || [];
            const next = currentCart.map(item =>
                item.uniqueId === uniqueId ? { ...item, ...updates } : item
            );
            return { ...prev, [slug]: next };
        });
    }, []);

    return (
        <MultiCartContext.Provider value={{ carts, addToCart, removeFromCart, clearCart, getCart, updateCartItem, isLoaded }}>
            {children}
        </MultiCartContext.Provider>
    );
}

export function useMultiCart() {
    return useContext(MultiCartContext);
}
