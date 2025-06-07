/**
 * @fileoverview Serviço de banco de dados do Firebase
 * @version 1.0.0
 */

import { getServerTimestamp, timestampToDate } from './config.js';
import { showNotification } from '../../utils/helpers.js';

/**
 * Classe para gerenciar operações de banco de dados
 */
class DatabaseService {
    constructor() {
        this.db = null;
        this.storage = null;
        this.auth = null;
    }

    /**
     * Inicializa o serviço de banco de dados
     * @param {Object} firestore - Instância do Firestore
     * @param {Object} storage - Instância do Storage
     * @param {Object} auth - Instância do Auth
     */
    init(firestore, storage, auth) {
        if (!firestore) {
            console.error('❌ Firestore não fornecido');
            return;
        }

        this.db = firestore;
        this.storage = storage;
        this.auth = auth;
        
        console.log('✅ Serviço de banco de dados inicializado');
    }

    /**
     * Obtém uma referência para uma coleção
     * @param {string} collectionName - Nome da coleção
     * @returns {Object} Referência da coleção
     */
    collection(collectionName) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        return this.db.collection(collectionName);
    }

    /**
     * Obtém um documento pelo ID
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @returns {Promise<Object>} Documento
     */
    async getDocument(collectionName, docId) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            const docRef = this.db.collection(collectionName).doc(docId);
            const doc = await docRef.get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`❌ Erro ao obter documento ${docId} da coleção ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Obtém todos os documentos de uma coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} options - Opções de consulta
     * @param {Array} options.where - Condições de filtro
     * @param {string} options.orderBy - Campo para ordenação
     * @param {string} options.orderDirection - Direção da ordenação ('asc' ou 'desc')
     * @param {number} options.limit - Limite de documentos
     * @returns {Promise<Array>} Lista de documentos
     */
    async getDocuments(collectionName, options = {}) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            let query = this.db.collection(collectionName);
            
            // Aplicar filtros
            if (options.where && Array.isArray(options.where)) {
                options.where.forEach(condition => {
                    if (condition.length === 3) {
                        query = query.where(condition[0], condition[1], condition[2]);
                    }
                });
            }
            
            // Aplicar ordenação
            if (options.orderBy) {
                const direction = options.orderDirection === 'desc' ? 'desc' : 'asc';
                query = query.orderBy(options.orderBy, direction);
            }
            
            // Aplicar limite
            if (options.limit && typeof options.limit === 'number') {
                query = query.limit(options.limit);
            }
            
            const snapshot = await query.get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`❌ Erro ao obter documentos da coleção ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Adiciona um novo documento
     * @param {string} collectionName - Nome da coleção
     * @param {Object} data - Dados do documento
     * @returns {Promise<Object>} Documento criado
     */
    async addDocument(collectionName, data) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            // Adicionar metadados
            const docData = {
                ...data,
                createdAt: getServerTimestamp(),
                updatedAt: getServerTimestamp(),
                createdBy: this.auth?.currentUser?.uid || null
            };
            
            const docRef = await this.db.collection(collectionName).add(docData);
            
            return {
                id: docRef.id,
                ...docData
            };
        } catch (error) {
            console.error(`❌ Erro ao adicionar documento à coleção ${collectionName}:`, error);
            showNotification('Erro ao salvar dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Atualiza um documento existente
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @param {Object} data - Dados a serem atualizados
     * @returns {Promise<Object>} Documento atualizado
     */
    async updateDocument(collectionName, docId, data) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            // Adicionar metadados
            const docData = {
                ...data,
                updatedAt: getServerTimestamp(),
                updatedBy: this.auth?.currentUser?.uid || null
            };
            
            const docRef = this.db.collection(collectionName).doc(docId);
            await docRef.update(docData);
            
            // Obter documento atualizado
            const updatedDoc = await docRef.get();
            
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            };
        } catch (error) {
            console.error(`❌ Erro ao atualizar documento ${docId} da coleção ${collectionName}:`, error);
            showNotification('Erro ao atualizar dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Exclui um documento
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @returns {Promise<void>}
     */
    async deleteDocument(collectionName, docId) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            await this.db.collection(collectionName).doc(docId).delete();
        } catch (error) {
            console.error(`❌ Erro ao excluir documento ${docId} da coleção ${collectionName}:`, error);
            showNotification('Erro ao excluir dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Realiza uma transação para garantir consistência
     * @param {Function} transactionFn - Função de transação
     * @returns {Promise<*>} Resultado da transação
     */
    async runTransaction(transactionFn) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            return await this.db.runTransaction(transactionFn);
        } catch (error) {
            console.error('❌ Erro na transação:', error);
            showNotification('Erro na operação. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Realiza operações em lote
     * @param {Function} batchFn - Função de lote
     * @returns {Promise<void>}
     */
    async runBatch(batchFn) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            const batch = this.db.batch();
            await batchFn(batch);
            await batch.commit();
        } catch (error) {
            console.error('❌ Erro no lote:', error);
            showNotification('Erro na operação em lote. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Faz upload de um arquivo para o Storage
     * @param {File} file - Arquivo a ser enviado
     * @param {string} path - Caminho no Storage
     * @param {Object} metadata - Metadados do arquivo
     * @returns {Promise<string>} URL do arquivo
     */
    async uploadFile(file, path, metadata = {}) {
        if (!this.storage) {
            throw new Error('Serviço de storage não inicializado');
        }
        
        try {
            const storageRef = this.storage.ref();
            const fileRef = storageRef.child(path);
            
            // Adicionar metadados
            const fileMetadata = {
                ...metadata,
                customMetadata: {
                    ...metadata.customMetadata,
                    uploadedBy: this.auth?.currentUser?.uid || 'anonymous',
                    uploadedAt: new Date().toISOString()
                }
            };
            
            // Fazer upload
            const snapshot = await fileRef.put(file, fileMetadata);
            
            // Obter URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
        } catch (error) {
            console.error('❌ Erro ao fazer upload de arquivo:', error);
            showNotification('Erro ao enviar arquivo. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Exclui um arquivo do Storage
     * @param {string} path - Caminho no Storage
     * @returns {Promise<void>}
     */
    async deleteFile(path) {
        if (!this.storage) {
            throw new Error('Serviço de storage não inicializado');
        }
        
        try {
            const storageRef = this.storage.ref();
            const fileRef = storageRef.child(path);
            
            await fileRef.delete();
        } catch (error) {
            console.error('❌ Erro ao excluir arquivo:', error);
            showNotification('Erro ao excluir arquivo. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Configura um listener para mudanças em um documento
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onDocumentChange(collectionName, docId, callback) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        const unsubscribe = this.db.collection(collectionName).doc(docId)
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback({
                        id: doc.id,
                        ...doc.data()
                    });
                } else {
                    callback(null);
                }
            }, error => {
                console.error(`❌ Erro ao observar documento ${docId}:`, error);
            });
        
        return unsubscribe;
    }

    /**
     * Configura um listener para mudanças em uma coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} options - Opções de consulta
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onCollectionChange(collectionName, options = {}, callback) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        let query = this.db.collection(collectionName);
        
        // Aplicar filtros
        if (options.where && Array.isArray(options.where)) {
            options.where.forEach(condition => {
                if (condition.length === 3) {
                    query = query.where(condition[0], condition[1], condition[2]);
                }
            });
        }
        
        // Aplicar ordenação
        if (options.orderBy) {
            const direction = options.orderDirection === 'desc' ? 'desc' : 'asc';
            query = query.orderBy(options.orderBy, direction);
        }
        
        // Aplicar limite
        if (options.limit && typeof options.limit === 'number') {
            query = query.limit(options.limit);
        }
        
        const unsubscribe = query.onSnapshot(snapshot => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            callback(docs);
        }, error => {
            console.error(`❌ Erro ao observar coleção ${collectionName}:`, error);
        });
        
        return unsubscribe;
    }
}

// Exportar instância única (Singleton)
export const databaseService = new DatabaseService();
export default databaseService;

