/**
 * @fileoverview Serviço de busca inteligente.
 * Esta implementação simples consulta o Firestore buscando
 * produtos pelo nome dentro do tenant atual.
 */

import { databaseService } from '../firebase/database-service.js';

class SearchService {
    constructor() {
        console.log('✅ Serviço de busca inteligente inicializado');
    }

    /**
     * Procura informações pelo sistema utilizando o nome do produto.
     * @param {string} query Texto de busca digitado pelo usuário
     * @returns {Promise<Object|null>} Produto encontrado ou null
     */
    async searchProductByName(query) {
        if (!query) return null;

        const docs = await databaseService.getDocuments('products', {
            where: [['name', '==', query]],
            limit: 1
        });

        return docs.length ? docs[0] : null;
    }
}

export const searchService = new SearchService();
export default searchService;
