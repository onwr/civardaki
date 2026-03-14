// Mock authentication data for static demo
export const mockSession = {
  user: {
    id: "mock-user-id",
    name: "Ahmet Yılmaz",
    email: "ahmet@yilmaz.com",
    userType: "USER",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  },
};

export const useMockSession = () => {
  return {
    data: mockSession,
    status: "authenticated",
  };
};
