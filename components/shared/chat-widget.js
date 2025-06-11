// @fileoverview Componente de chat para busca facilitada
// @version 1.0.0

import { searchService } from '../../services/search-service.js';

class ChatWidget {
    constructor() {
        this.containerId = 'chatWidget';
        this.toggleButtonId = 'chatWidgetToggle';
    }

    init() {
        this.createElements();
        this.setupEvents();
    }

    createElements() {
        // Botão flutuante
        this.toggleButton = document.createElement('button');
        this.toggleButton.id = this.toggleButtonId;
        this.toggleButton.className = 'chat-toggle';
        this.toggleButton.innerHTML = '<i class="fas fa-comments"></i>';

        // Container principal
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.className = 'chat-container hidden';
        this.container.innerHTML = `
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-area">
                <input id="chatInput" type="text" placeholder="Pergunte algo..." />
                <button id="chatSend" class="chat-send"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        document.body.appendChild(this.container);
        document.body.appendChild(this.toggleButton);
    }

    setupEvents() {
        this.toggleButton.addEventListener('click', () => {
            this.container.classList.toggle('hidden');
        });

        const input = this.container.querySelector('#chatInput');
        const send = this.container.querySelector('#chatSend');
        send.addEventListener('click', () => this.handleSend());
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    addMessage(from, text) {
        const messages = this.container.querySelector('#chatMessages');
        const item = document.createElement('div');
        item.className = `chat-message ${from}`;
        item.textContent = text;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }

    async handleSend() {
        const input = this.container.querySelector('#chatInput');
        const query = input.value.trim();
        if (!query) return;
        this.addMessage('user', query);
        input.value = '';
        const response = await searchService.search(query);
        this.addMessage('system', response);
    }
}

export const chatWidget = new ChatWidget();
export default chatWidget;
