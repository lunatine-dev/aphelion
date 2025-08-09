const codes = new Map();

export const saveTempCode = (code, payload) => {
    codes.set(code, { ...payload, createdAt: Date.now() });
};

export const useTempCode = (code) => {
    const data = codes.get(code);

    if (!data) return null;
    codes.delete(code);

    return data;
};

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of codes.entries()) {
        if (now - value.createdAt > 60_000) codes.delete(key); // 1 min expiry
    }
}, 30_000);
