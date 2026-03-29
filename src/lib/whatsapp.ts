/**
 * Opens WhatsApp with a pre-filled message, using web.whatsapp.com on desktop
 * and wa.me on mobile to avoid api.whatsapp.com blocks.
 */
export const openWhatsApp = (phone: string, message: string) => {
  const encoded = encodeURIComponent(message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isMobile
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
  window.open(url, "_blank");
};
