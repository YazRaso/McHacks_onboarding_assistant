import * as vscode from 'vscode';
import { ChatViewProvider } from './chatViewProvider';
import { BackboardService } from './backboardService';

export function activate(context: vscode.ExtensionContext) {
    console.log('Backboard Assistant is now active!');

    const backboardService = new BackboardService();
    const chatProvider = new ChatViewProvider(context.extensionUri, backboardService);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'backboard.chatView',
            chatProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('backboard.openChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.backboard-sidebar');
            vscode.window.showInformationMessage('Backboard Chat opened! Press Cmd+Shift+B (Mac) or Ctrl+Shift+B (Windows/Linux)');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('backboard.askQuestion', async () => {
            const question = await vscode.window.showInputBox({
                placeHolder: 'Ask your onboarding assistant anything...',
                prompt: 'Type your question or use @source to see source files'
            });

            if (question) {
                chatProvider.sendMessageFromCommand(question);
                vscode.commands.executeCommand('workbench.view.extension.backboard-sidebar');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('backboard.clearChat', () => {
            chatProvider.clearChat();
        })
    );

    vscode.window.showInformationMessage('Backboard Assistant ready! Use Cmd+Shift+B to open chat.');
}

export function deactivate() {}
