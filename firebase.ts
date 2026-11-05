// Zero-API-Key Local Pub/Sub and Notification Manager
// Fully open-source, runs 100% locally in-browser without any external keys or subscriptions.

export const initializeFirebase = () => {
  // No external API keys needed - runs entirely on open-source web standards
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return null;
  }
};

export const onForegroundMessage = (_callback: (payload: any) => void) => {
  return () => {};
};

// --- Real-time Chat & Deal Synchronization (No API Key Required) ---

export const sendMessage = (
  dealId: string | number,
  message: { text: string; senderId: 'provider' | 'seeker'; mediaUrl?: string }
) => {
  const timestamp = Date.now();
  const messageObj = {
    id: `msg-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    ...message,
    timestamp
  };

  try {
    const raw = localStorage.getItem(`aido_chat_${dealId}`);
    const existing = raw ? JSON.parse(raw) : [];
    existing.push(messageObj);
    localStorage.setItem(`aido_chat_${dealId}`, JSON.stringify(existing));
    
    // Broadcast locally and to other tabs
    window.dispatchEvent(
      new CustomEvent('aido_new_message', { detail: { dealId, message: messageObj } })
    );
  } catch (e) {
    console.error("Local chat dispatch error:", e);
  }
};

export const onNewMessage = (dealId: string | number, callback: (message: any) => void) => {
  // Deliver existing messages
  try {
    const raw = localStorage.getItem(`aido_chat_${dealId}`);
    const existing = raw ? JSON.parse(raw) : [];
    if (Array.isArray(existing)) {
      existing.forEach((msg) => {
        setTimeout(() => callback(msg), 0);
      });
    }
  } catch {
    // Ignore parse errors
  }

  const handleLocalMsg = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && detail.dealId === dealId && detail.message) {
      callback(detail.message);
    }
  };

  const handleStorageMsg = (e: StorageEvent) => {
    if (e.key === `aido_chat_${dealId}` && e.newValue) {
      try {
        const list = JSON.parse(e.newValue);
        if (Array.isArray(list) && list.length > 0) {
          callback(list[list.length - 1]);
        }
      } catch {
        // Ignore parse errors
      }
    }
  };

  window.addEventListener('aido_new_message', handleLocalMsg);
  window.addEventListener('storage', handleStorageMsg);

  return () => {
    window.removeEventListener('aido_new_message', handleLocalMsg);
    window.removeEventListener('storage', handleStorageMsg);
  };
};