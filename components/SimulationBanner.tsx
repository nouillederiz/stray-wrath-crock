
import React from 'react';

export const SimulationBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 sticky top-0 z-50 font-bold uppercase tracking-widest shadow-lg">
      <i className="fas fa-exclamation-triangle mr-2"></i>
      Environnement de Test Pédagogique - Toutes les données sont fictives
      <i className="fas fa-exclamation-triangle ml-2"></i>
    </div>
  );
};
