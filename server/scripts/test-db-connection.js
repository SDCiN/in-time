import { createSequelizeInstance } from '../shared/config/database.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carregar .env centralizado da pasta server/
dotenv.config({ path: path.join(__dirname, '../.env') })

async function testConnection() {
  console.log('🔍 Testando conexão com PostgreSQL...\n')

  console.log('Configuração:')
  console.log(`  Host: ${process.env.DB_HOST}`)
  console.log(`  Port: ${process.env.DB_PORT}`)
  console.log(`  Database: ${process.env.DB_NAME}`)
  console.log(`  User: ${process.env.DB_USER}`)
  console.log(`  Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}\n`)

  let sequelize

  try {
    sequelize = createSequelizeInstance('test-script')

    console.log('⏳ Conectando...')
    await sequelize.authenticate()
    console.log('✅ Conexão estabelecida com sucesso!\n')

    // Testar query simples
    const [results] = await sequelize.query('SELECT version()')
    console.log('📊 PostgreSQL version:', results[0].version)

    // Listar bancos
    const [databases] = await sequelize.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false"
    )
    console.log('\n📚 Bancos disponíveis:')
    databases.forEach(db => console.log(`  - ${db.datname}`))

    await sequelize.close()
    console.log('\n✅ Teste concluído com sucesso!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Erro na conexão:')
    console.error(`  ${error.message}`)

    if (error.parent) {
      console.error(`\n💡 Detalhes: ${error.parent.message}`)
    }

    console.error('\n🔧 Possíveis soluções:')
    console.error('  1. Verificar se o PostgreSQL está rodando: docker ps')
    console.error('  2. Verificar IP da VM no .env (DB_HOST)')
    console.error('  3. Verificar credenciais (DB_USER, DB_PASSWORD)')
    console.error('  4. Verificar se o banco existe: docker exec -it worklocation-db psql -U postgres -l')
    console.error('  5. Verificar firewall/rede entre sua máquina e a VM')

    if (sequelize) await sequelize.close()
    process.exit(1)
  }
}

testConnection()
