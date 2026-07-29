'use strict';

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.redirectIfNotLoggedIn()) return;

    var currentSessionId = null;
    var sessionsData = [];

    var sessionsList = document.getElementById('chatSessionsList');
    var messagesContainer = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var sendBtn = document.getElementById('sendMessageBtn');
    var newChatBtn = document.getElementById('newChatBtn');

    loadSessions();

    newChatBtn?.addEventListener('click', createNewSession);
    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function loadSessions() {
        try {
            sessionsData = await API.getSessions() || [];
            renderSessionsList();
        } catch (err) {
            UI.showToast('Failed to load conversations.', 'error');
        }
    }

    function renderSessionsList() {
        if (!sessionsList) return;
        if (sessionsData.length === 0) {
            sessionsList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--color-text-muted);font-size:14px">No conversations yet</div>';
            return;
        }
        sessionsList.innerHTML = sessionsData.map(function(session) {
            var isActive = session.id === currentSessionId;
            var title = session.title || 'New Conversation';
            if (title.length > 50) title = title.substring(0, 50) + '...';
            return '<div class="chat-session-item' + (isActive ? ' active' : '') + '" data-id="' + session.id + '">' +
                '<div class="chat-session-title">' + UI.escapeHtml(title) + '</div>' +
                '<div class="chat-session-meta">' + UI.formatDate(session.updated_at || session.created_at) + '</div>' +
                '</div>';
        }).join('');

        sessionsList.querySelectorAll('.chat-session-item').forEach(function(el) {
            el.addEventListener('click', function() {
                var sid = parseInt(this.dataset.id, 10);
                selectSession(sid);
            });
        });
    }

    async function createNewSession() {
        try {
            var session = await API.createSession({ title: 'New Conversation' });
            sessionsData.unshift(session);
            renderSessionsList();
            selectSession(session.id);
            UI.showToast('New conversation started!', 'success');
        } catch (err) {
            UI.showToast('Failed to create session.', 'error');
        }
    }

    async function selectSession(sessionId) {
        currentSessionId = sessionId;
        renderSessionsList();

        if (messagesContainer) {
            messagesContainer.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-text-muted)"><div class="spinner"></div><p>Loading messages...</p></div>';
        }

        try {
            var session = await API.getSessionMessages(sessionId);
            var messages = session.messages || [];
            renderMessages(messages);
        } catch (err) {
            if (messagesContainer) {
                messagesContainer.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-text-muted)"><p>Failed to load messages.</p></div>';
            }
        }
    }

    function renderMessages(messages) {
        if (!messagesContainer) return;
        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML =
                '<div class="chat-message assistant">' +
                '<div class="chat-avatar assistant">AI</div>' +
                '<div class="chat-bubble">Hi! I\'m your AI Art Mentor. Ask me anything about drawing!</div>' +
                '</div>';
            return;
        }

        messagesContainer.innerHTML = messages.map(function(msg) {
            var role = msg.role || 'assistant';
            var avatar = role === 'user' ? 'U' : 'AI';
            return '<div class="chat-message ' + role + '">' +
                '<div class="chat-avatar ' + role + '">' + avatar + '</div>' +
                '<div class="chat-bubble">' + UI.escapeHtml(msg.content) + '</div>' +
                '</div>';
        }).join('');

        scrollToBottom();
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async function sendMessage() {
        if (!chatInput || !currentSessionId) return;
        var text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        if (sendBtn) sendBtn.disabled = true;

        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend',
                '<div class="chat-message user">' +
                '<div class="chat-avatar user">U</div>' +
                '<div class="chat-bubble">' + UI.escapeHtml(text) + '</div>' +
                '</div>');
            messagesContainer.insertAdjacentHTML('beforeend',
                '<div class="chat-message assistant" id="typingIndicator">' +
                '<div class="chat-avatar assistant">AI</div>' +
                '<div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>' +
                '</div>');
            scrollToBottom();
        }

        try {
            var result = await API.sendMessage(currentSessionId, text);
            var typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();

            if (messagesContainer && result && result.assistant_message) {
                messagesContainer.insertAdjacentHTML('beforeend',
                    '<div class="chat-message assistant">' +
                    '<div class="chat-avatar assistant">AI</div>' +
                    '<div class="chat-bubble">' + UI.escapeHtml(result.assistant_message.content) + '</div>' +
                    '</div>');
                scrollToBottom();
                sessionsData = await API.getSessions() || [];
                renderSessionsList();
            }
        } catch (err) {
            var typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();
            UI.showToast('Failed to get AI response.', 'error');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (chatInput) chatInput.focus();
        }
    }
});