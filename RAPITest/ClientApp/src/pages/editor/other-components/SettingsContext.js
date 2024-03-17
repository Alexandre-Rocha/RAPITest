import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        theme: 'light',
        showTips: true,
        showTooltips: true,
        // Add other settings as needed
    });

    const updateSetting = (key, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: value,
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};
