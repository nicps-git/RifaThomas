// ULTRA-DEBUG: Função que força botões com logs extremos
function createActionButtons(purchase) {
    console.log('🚨🚨🚨 ULTRA-DEBUG INÍCIO 🚨🚨🚨');
    console.log('Purchase recebida:', purchase);
    console.log('Purchase ID:', purchase?.id);
    console.log('Purchase Type:', purchase?.type);
    console.log('Purchase Status:', purchase?.status);
    console.log('Purchase Payment Method:', purchase?.paymentMethod);
    
    // FORÇA ABSOLUTA - Botões sempre aparecem
    const forceButtons = `
        <div class="action-buttons-force" style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="btn-edit-force" data-id="${purchase?.id || 'no-id'}" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ✏️ Editar
            </button>
            <button class="btn-debug-force" data-id="${purchase?.id || 'no-id'}" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                🔍 Debug
            </button>
            <button class="btn-confirm-force" data-id="${purchase?.id || 'no-id'}" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ✅ Confirmar
            </button>
            <button class="btn-reject-force" data-id="${purchase?.id || 'no-id'}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ❌ Rejeitar
            </button>
        </div>
    `;
    
    console.log('🚨 ULTRA-DEBUG: Botões HTML criado:', forceButtons);
    console.log('🚨 ULTRA-DEBUG: Tamanho do HTML:', forceButtons.length);
    console.log('🚨🚨🚨 ULTRA-DEBUG FIM 🚨🚨🚨');
    
    return forceButtons;
}

console.log('✅ ULTRA-DEBUG: Função createActionButtons redefinida com força absoluta!');
