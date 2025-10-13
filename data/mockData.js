// data/mockData.js

/**
 * @typedef {'receita' | 'despesa'} TransactionType
 */

/**
 * @typedef {object} Category
 * @property {string} id
 * @property {string} name
 * @property {TransactionType} type
 */

/**
 * @typedef {object} Transaction 
 * @property {string} id
 * @property {string} description
 * @property {number} amount
 * @property {TransactionType} type
 * @property {string} category
 * @property {Date} timestamp
**/