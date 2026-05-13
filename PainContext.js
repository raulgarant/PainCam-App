import React, { createContext, useContext, useState } from 'react';

const PainContext = createContext();

export const PainProvider = ({ children }) => {
  const [painData, setPainData] = useState({
    rangoIntensidad: null,
    numeroIntensidad: null, 
    duracion: null,
    tipo: null,
    localizacion: [],
  });

  const updatePainData = (key, value) => {
    setPainData(prev => ({ ...prev, [key]: value }));
  };

  const resetPainData = () => {
    setPainData({ rangoIntensidad: null, numeroIntensidad: null, duracion: null, tipo: null, localizacion: [] });
  };

  return (
    <PainContext.Provider value={{ painData, updatePainData, resetPainData }}>
      {children}
    </PainContext.Provider>
  );
};

export const usePain = () => useContext(PainContext);