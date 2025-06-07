/**
 * @fileoverview Configuração do Firebase
 * @version 1.0.0
 */

// Configuração do Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyDfWOIAGOmUbzLwIiU5NVFQ_wlUTF2zMtQ",
    authDomain: "cloudcontrol-elite.firebaseapp.com",
    projectId: "cloudcontrol-elite",
    storageBucket: "cloudcontrol-elite.appspot.com",
    messagingSenderId: "1027486327269",
    appId: "1:1027486327269:web:9a1c6c3a7a9e1c1c1c1c1c",
    measurementId: "G-XXXXXXXXXX"
};

// Variável para armazenar a instância do Firebase
let firebaseApp = null;

/**
 * Inicializa o Firebase App
 * @param {Object} config - Configuração do Firebase
 * @returns {Object} Instância do Firebase App
 */
export function getFirebaseApp(config) {
    if (!firebaseApp) {
        firebaseApp = firebase.initializeApp(config);
    }
    return firebaseApp;
}

/**
 * Obtém a instância do Firestore
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Firestore
 */
export function getFirestore(app) {
    return firebase.firestore(app);
}

/**
 * Obtém a instância do Authentication
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Authentication
 */
export function getAuth(app) {
    return firebase.auth(app);
}

/**
 * Obtém a instância do Storage
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Storage
 */
export function getStorage(app) {
    return firebase.storage(app);
}

/**
 * Obtém a instância do Analytics
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Analytics
 */
export function getAnalytics(app) {
    return firebase.analytics(app);
}

/**
 * Obtém um timestamp do servidor
 * @returns {Object} Timestamp do servidor
 */
export function getServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

/**
 * Converte um timestamp do Firestore para um objeto Date
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {Date} Objeto Date
 */
export function timestampToDate(timestamp) {
    if (!timestamp) {
        return null;
    }
    
    if (timestamp instanceof Date) {
        return timestamp;
    }
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    
    return new Date(timestamp);
}

/**
 * Formata um timestamp para exibição
 * @param {Object|Date} timestamp - Timestamp do Firestore ou objeto Date
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export function formatTimestamp(timestamp, options = {}) {
    const date = timestampToDate(timestamp);
    
    if (!date) {
        return '';
    }
    
    const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('pt-BR', formatOptions).format(date);
}

