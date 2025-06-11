// @fileoverview Serviço de busca inteligente
// @version 1.0.0

import { databaseService } from './firebase/database-service.js';
import { authService } from './firebase/auth-service.js';
import { formatCurrency } from '../utils/helpers.js';

/**
 * Classe para consultas de busca simples utilizando Firestore
 */
class SearchService {
    constructor() {
        this.productsCollection = 'products';
    }

    /**
     * Processa uma consulta de busca
     * @param {string} query - Pergunta ou termo de busca
     * @returns {Promise<string>} Resposta formatada
     */
    async search(query) {
        if (!query) return 'Consulta vazia.';

        const tenantId = authService.getCurrentUser()?.tenantId || null;
        const term = query.toLowerCase().trim();

        // Procurar produto pelo nome
        try {
            const products = await databaseService.getDocuments(this.productsCollection, {
                where: tenantId ? [['tenantId', '==', tenantId]] : undefined,
                limit: 50
            });
            const product = products.find(p => (p.name || '').toLowerCase().includes(term));
            if (product) {
                const price = formatCurrency(product.price || 0);
                return `O preço de ${product.name} é ${price}.`;
            }
        } catch (error) {
            console.error('Erro na busca:', error);
        }
        return 'Nenhum resultado encontrado.';
    }
}

export const searchService = new SearchService();
export default searchService;
