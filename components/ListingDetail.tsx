
import React from 'react';

interface ListingDetailProps {
  onPurchase: () => void;
  amount: string;
  setAmount: (val: string) => void;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ onPurchase, amount, setAmount }) => {
  return (
    <div className="max-w-2xl mx-auto w-full px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3 md:space-x-4 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0866FF] rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm">
              <i className="fas fa-euro-sign text-xl md:text-2xl"></i>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Finaliser votre commande</h1>
              <p className="text-xs md:text-sm text-gray-500">Paiement sécurisé par Facebook Marketplace</p>
            </div>
          </div>
        </div>

        {/* Amount Form Section */}
        <div className="p-4 md:p-8 pt-6 md:pt-10 space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <label className="block text-[11px] md:text-sm font-bold text-gray-700 uppercase tracking-wider">
              Montant total de la transaction
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0866FF] transition-colors">
                <i className="fas fa-euro-sign text-xl md:text-2xl"></i>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 md:py-5 pl-12 pr-4 text-2xl md:text-3xl font-bold text-gray-900 focus:border-[#0866FF] focus:ring-0 outline-none transition-all placeholder-gray-300"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs md:text-sm text-[#65676B]">
              Ce montant inclut les frais de protection acheteur et la livraison Colissimo.
            </p>
          </div>

          <button 
            onClick={onPurchase}
            className="w-full bg-[#0866FF] hover:bg-[#0759e0] text-white font-bold py-3.5 md:py-4 rounded-xl text-base md:text-lg transition transform active:scale-[0.98] shadow-lg flex items-center justify-center space-x-3"
          >
            <i className="fas fa-lock text-sm"></i>
            <span>Procéder au paiement sécurisé</span>
          </button>
        </div>

        {/* Reassurance Sections */}
        <div className="bg-gray-50 p-4 md:p-6 space-y-5 md:space-y-6 border-t border-gray-100">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-[#0866FF]">
              <i className="fas fa-undo-alt text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Remboursement en cas de litige</h3>
              <p className="text-xs md:text-sm text-[#65676B] leading-relaxed mt-1">
                Bénéficiez d'une protection complète. Si l'objet ne correspond pas à la description ou n'est pas livré, nous vous remboursons intégralement.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-600">
              <i className="fas fa-vault text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">L'argent reste bloquée</h3>
              <p className="text-xs md:text-sm text-[#65676B] leading-relaxed mt-1">
                Le vendeur ne reçoit pas l'argent immédiatement. Les fonds sont conservés en toute sécurité par notre partenaire bancaire jusqu'à la confirmation de réception.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center text-purple-600">
              <i className="fas fa-shopping-bag text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Historique des commandes</h3>
              <p className="text-xs md:text-sm text-[#65676B] leading-relaxed mt-1">
                Vous retrouverez vos achats dans la partie <strong>"Achats"</strong> de votre profil Marketplace une fois que vous aurez reçu le colis et validé la transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 opacity-50 px-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 md:h-4" alt="Visa" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 md:h-6" alt="Mastercard" />
        <div className="h-4 w-px bg-gray-400 hidden sm:block"></div>
        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">PCI DSS Compliant</span>
      </div>
    </div>
  );
};
