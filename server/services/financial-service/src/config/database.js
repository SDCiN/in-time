import { createSequelizeInstance } from '../../../../shared/config/database.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carregar .env centralizado da pasta server/
dotenv.config({ path: path.join(__dirname, '../../../../.env') })

// Financial service usa pool maior para cálculos EVM
export const sequelize = createSequelizeInstance('financial-service', {
  pool: { max: 10, min: 2 }
})
