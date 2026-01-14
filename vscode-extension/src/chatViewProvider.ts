import * as vscode from 'vscode';
import { BackboardService, ChatMessage } from './backboardService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private messages: ChatMessage[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly backboardService: BackboardService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleUserMessage(data.message);
                    break;
                case 'openFile':
                    this.openFileAtLine(data.path, data.line);
                    break;
            }
        });

        this.sendWelcomeMessage();
    }

    private async handleUserMessage(message: string) {
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: Date.now()
        };

        this.messages.push(userMessage);
        this._view?.webview.postMessage({
            type: 'addMessage',
            message: userMessage
        });

        this._view?.webview.postMessage({ type: 'showTyping' });

        try {
            const response = await this.backboardService.sendMessage(message);
            this.messages.push(response);
            this._view?.webview.postMessage({ type: 'hideTyping' });
            this._view?.webview.postMessage({
                type: 'addMessage',
                message: response
            });
        } catch (error) {
            this._view?.webview.postMessage({ type: 'hideTyping' });
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please check your connection and try again.',
                timestamp: Date.now()
            };
            this.messages.push(errorMessage);
            this._view?.webview.postMessage({
                type: 'addMessage',
                message: errorMessage
            });
        }
    }

    private sendWelcomeMessage() {
        const welcomeMessage: ChatMessage = {
            role: 'assistant',
            content: `Welcome to Backboard Assistant! 👋

I can help you explore your team's knowledge from:
• 📄 Google Drive documents
• 🔀 Git history and commits
• 💬 Telegram conversations

**Quick tips:**
• Type @source to see exact source files
• Use Cmd+Shift+A for quick questions
• Ask about meetings, code changes, or team discussions

How can I help you today?`,
            timestamp: Date.now()
        };

        this.messages.push(welcomeMessage);
        this._view?.webview.postMessage({
            type: 'addMessage',
            message: welcomeMessage
        });
    }

    public sendMessageFromCommand(message: string) {
        if (this._view) {
            this._view.show?.(true);
            this._view.webview.postMessage({
                type: 'setInput',
                message: message
            });
        }
    }

    public clearChat() {
        this.messages = [];
        this._view?.webview.postMessage({ type: 'clearChat' });
        this.sendWelcomeMessage();
        vscode.window.showInformationMessage('Chat history cleared!');
    }

    private openFileAtLine(filePath: string, line?: number) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
        vscode.window.showTextDocument(uri, {
            selection: line ? new vscode.Range(line - 1, 0, line - 1, 0) : undefined
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backboard Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            display: flex;
            flex-direction: column;
            gap: 6px;
            animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message.user {
            align-items: flex-end;
        }

        .message.assistant {
            align-items: flex-start;
        }

        .message-header {
            font-size: 11px;
            opacity: 0.7;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .message-content {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message.user .message-content {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-bottom-right-radius: 4px;
        }

        .message.assistant .message-content {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-bottom-left-radius: 4px;
        }

        .source-files {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .source-file {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .source-file:hover {
            background-color: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
            transform: translateX(4px);
        }

        .source-file-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 6px;
        }

        .source-file-icon {
            opacity: 0.7;
        }

        .source-file-lines {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 2px;
        }

        .source-file-code {
            margin-top: 8px;
            padding: 8px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
            overflow-x: auto;
            white-space: pre;
            line-height: 1.4;
        }

        #typing-indicator {
            display: none;
            align-items: center;
            gap: 6px;
            padding: 10px 14px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 12px;
            width: fit-content;
        }

        #typing-indicator.show {
            display: flex;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--vscode-editor-foreground);
            opacity: 0.4;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                opacity: 0.4;
                transform: scale(1);
            }
            30% {
                opacity: 1;
                transform: scale(1.2);
            }
        }

        #input-container {
            padding: 12px;
            background-color: var(--vscode-editor-background);
            border-top: 1px solid var(--vscode-panel-border);
            display: flex;
            gap: 8px;
        }

        #message-input {
            flex: 1;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            padding: 10px 12px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            resize: none;
            outline: none;
            max-height: 120px;
        }

        #message-input:focus {
            border-color: var(--vscode-focusBorder);
        }

        #send-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 8px;
            padding: 0 16px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
        }

        #send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        #send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .shortcut-hint {
            font-size: 10px;
            opacity: 0.5;
            text-align: center;
            padding: 8px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
        }

        strong {
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="shortcut-hint">
        💡 Tip: Press Cmd+Shift+A for quick questions | Type @source to see source files
    </div>
    <div id="chat-container"></div>
    <div id="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    </div>
    <div id="input-container">
        <textarea 
            id="message-input" 
            placeholder="Ask about meetings, commits, or team discussions..."
            rows="1"
        ></textarea>
        <button id="send-button">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const typingIndicator = document.getElementById('typing-indicator');

        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendButton.addEventListener('click', sendMessage);

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });

            messageInput.value = '';
            messageInput.style.height = 'auto';
        }

        function addMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;

            const header = document.createElement('div');
            header.className = 'message-header';
            header.textContent = message.role === 'user' ? 'You' : 'Backboard';
            messageDiv.appendChild(header);

            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = formatMessage(message.content);
            messageDiv.appendChild(content);

            if (message.sources && message.sources.length > 0) {
                const sourcesContainer = document.createElement('div');
                sourcesContainer.className = 'source-files';
                
                message.sources.forEach(source => {
                    const sourceDiv = document.createElement('div');
                    sourceDiv.className = 'source-file';
                    sourceDiv.onclick = () => {
                        vscode.postMessage({
                            type: 'openFile',
                            path: source.path,
                            line: source.lineStart
                        });
                    };

                    const sourceHeader = document.createElement('div');
                    sourceHeader.className = 'source-file-header';
                    sourceHeader.innerHTML = \`
                        <span class="source-file-icon">📄</span>
                        <span>\${source.path}</span>
                    \`;
                    sourceDiv.appendChild(sourceHeader);

                    if (source.lineStart) {
                        const lines = document.createElement('div');
                        lines.className = 'source-file-lines';
                        lines.textContent = \`Lines \${source.lineStart}-\${source.lineEnd || source.lineStart}\`;
                        sourceDiv.appendChild(lines);
                    }

                    if (source.content) {
                        const code = document.createElement('div');
                        code.className = 'source-file-code';
                        code.textContent = source.content;
                        sourceDiv.appendChild(code);
                    }

                    sourcesContainer.appendChild(sourceDiv);
                });

                content.appendChild(sourcesContainer);
            }

            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function formatMessage(text) {
            text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\`(.+?)\`/g, '<code>$1</code>');
            text = text.replace(/\n/g, '<br>');
            return text;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'addMessage':
                    addMessage(message.message);
                    break;
                case 'showTyping':
                    typingIndicator.classList.add('show');
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    break;
                case 'hideTyping':
                    typingIndicator.classList.remove('show');
                    break;
                case 'setInput':
                    messageInput.value = message.message;
                    messageInput.focus();
                    break;
                case 'clearChat':
                    chatContainer.innerHTML = '';
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
