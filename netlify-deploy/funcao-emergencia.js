// FUNÇÃO DE EMERGÊNCIA - COLAR NO CONSOLE F12 SE NECESSÁRIO

function createActionButtonsEmergencia(purchase) {
    console.log('🚨 EMERGÊNCIA: Criando botões para', purchase.id);
    
    // Botões mais básicos possível
    return `
        <button style="background: #007bff; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ✏️ Editar
        </button>
        <button style="background: #6c757d; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            🔍 Debug
        </button>
        <button style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ✅ Confirmar
        </button>
        <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer;">
            ❌ Rejeitar
        </button>
    `;
}

// PARA TESTAR NO CONSOLE:
// createActionButtonsEmergencia({id: 'teste'})
