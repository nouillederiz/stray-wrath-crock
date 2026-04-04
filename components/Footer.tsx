
import React from 'react';

export const Footer: React.FC = () => {
  const languages = [
    'Français (France)', 'English (US)', 'Español', 'Português (Brasil)', 
    'Italiano', 'Deutsch', 'हिन्दी', '中文(简体)', '日本語', 'العربية'
  ];

  const links = [
    'S\'inscrire', 'Se connecter', 'Messenger', 'Facebook Lite', 'Vidéo', 'Lieux', 'Jeux', 
    'Marketplace', 'Meta Pay', 'Meta Store', 'Meta Quest', 'Instagram', 'Threads', 
    'Fonds', 'Services', 'Centre d\'informations sur le vote', 'Politique de confidentialité', 
    'Centre de confidentialité', 'Groupes', 'À propos', 'Créer une publicité', 
    'Créer une Page', 'Développeurs', 'Emplois', 'Cookies', 'Choisir sa pub', 
    'Conditions', 'Aide', 'Importation des contacts et non-utilisateurs'
  ];

  return (
    <footer className="bg-white pt-8 pb-12 px-4 mt-auto">
      <div className="max-w-5xl mx-auto">
        {/* Languages Section */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#8a8d91] mb-2">
          {languages.map((lang, i) => (
            <a key={i} href="#" className="hover:underline transition-none">{lang}</a>
          ))}
          <button className="bg-[#f5f6f7] border border-[#ccd0d5] px-2 py-0.5 rounded-sm hover:bg-[#ebedf0] transition-colors">
            <i className="fas fa-plus text-[10px] text-[#4b4f56]"></i>
          </button>
        </div>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Links Section */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8a8d91] mb-6">
          {links.map((link, i) => (
            <a key={i} href="#" className="hover:underline transition-none">{link}</a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#737373] font-normal">
          Meta © 2026
        </div>
      </div>
    </footer>
  );
};
