import { createSequelizeInstance } from '../../../../shared/config/database.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carregar .env centralizado da pasta server/
dotenv.config({ path: path.join(__dirname, '../../../../.env') })

export const sequelize = createSequelizeInstance('timesheet-service')
