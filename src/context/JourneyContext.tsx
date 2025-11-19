import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Journey } from '../core/domain/entities/Journey';

interface JourneyContextData {
  activeJourney: Journey | null;
  setActiveJourney: (journey: Journey | null) => void;
}

const JourneyContext = createContext<JourneyContextData>({} as JourneyContextData);

interface JourneyProviderProps {
  children: ReactNode;
}

export const JourneyProvider: React.FC<JourneyProviderProps> = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

  return (
    <JourneyContext.Provider value={{ activeJourney, setActiveJourney }}>
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney deve ser usado dentro de um JourneyProvider');
  }
  return context;
};
