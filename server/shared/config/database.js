import { Sequelize } from 'sequelize'

/**
 * Factory function para criar instância do Sequelize
 * @param {string} serviceName - Nome do serviço para logging
 * @param {object} options - Opções opcionais de override
 * @returns {Sequelize} Instância configurada do Sequelize
 */
export function createSequelizeInstance(serviceName, options = {}) {
  // Validar variáveis de ambiente obrigatórias
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
  const missing = requiredEnvVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `❌ [${serviceName}] Variáveis de ambiente faltando: ${missing.join(', ')}\n` +
      `Configure o arquivo .env com as credenciais do banco de dados.`
    )
  }

  // Configuração padrão do pool
  const defaultPool = {
    max: parseInt(process.env.DB_POOL_MAX) || 5,
    min: parseInt(process.env.DB_POOL_MIN) || 0,
    acquire: 30000,
    idle: 10000
  }

  // Merge pool customizado
  const pool = options.pool ? { ...defaultPool, ...options.pool } : defaultPool

  // Configuração de logging
  const logging = process.env.NODE_ENV === 'development'
    ? (msg) => console.log(`[${serviceName}] ${msg}`)
    : false

  // Criar instância do Sequelize
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      dialect: 'postgres',
      logging: options.logging !== undefined ? options.logging : logging,
      pool,
      dialectOptions: options.dialectOptions || {},
      ...options
    }
  )

  return sequelize
}
