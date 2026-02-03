import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

interface PSCompanyConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  triggerDelay?: number;
  triggerMessage?: string;
  welcomeMessage?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    userBubble?: string;
    botBubble?: string;
  };
  companyName?: string;
  companyLogo?: string;
}

declare global {
  interface Window {
    PSCompanyChat?: {
      init: (config: PSCompanyConfig) => void;
      destroy: () => void;
    };
    pscompanyChatConfig?: PSCompanyConfig;
  }
}

const DEFAULT_API_URL = 'https://api.pscompany.cloud';
let widgetRoot: ReturnType<typeof createRoot> | null = null;
let widgetContainer: HTMLElement | null = null;

function init(config: PSCompanyConfig): void {
  if (!config.apiKey) {
    console.error('[PSCompany Chat] API key is required');
    return;
  }

  destroy();

  widgetContainer = document.createElement('div');
  widgetContainer.id = 'pscompany-chat-widget';
  document.body.appendChild(widgetContainer);

  widgetRoot = createRoot(widgetContainer);
  widgetRoot.render(
    <ChatWidget
      apiKey={config.apiKey}
      apiUrl={DEFAULT_API_URL}
      position={config.position}
      triggerDelay={config.triggerDelay}
      triggerMessage={config.triggerMessage}
      welcomeMessage={config.welcomeMessage}
      colors={config.colors}
      companyName={config.companyName}
      companyLogo={config.companyLogo}
    />
  );
}

function destroy(): void {
  if (widgetRoot) {
    widgetRoot.unmount();
    widgetRoot = null;
  }
  if (widgetContainer?.parentNode) {
    widgetContainer.parentNode.removeChild(widgetContainer);
    widgetContainer = null;
  }
}

window.PSCompanyChat = { init, destroy };

if (window.pscompanyChatConfig) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(window.pscompanyChatConfig!));
  } else {
    init(window.pscompanyChatConfig);
  }
}

export { init, destroy };
