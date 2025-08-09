import Settings from "#models/Settings";
let settingsCache = null;

export const loadSettings = async () => {
    const { defaults } = {
        _id: "app",
    };

    const result = await Settings.findByIdAndUpdate(
        "app",
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    settingsCache = result;
    return settingsCache;
};

export const getSettings = () => {
    return settingsCache;
};

export const updateSetting = async (key, value) => {
    if (!settingsCache) throw new Error("Settings not loaded");

    settingsCache[key] = value;

    await settingsCache.save();
};
