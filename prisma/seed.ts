import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding database...')

    // Create a test student with hashed password
    const hashedPassword = await bcrypt.hash('Test@123456', 10)
    
    const student = await prisma.student.upsert({
      where: { email: 'test@student.edu' },
      update: {},
      create: {
        email: 'test@student.edu',
        password: hashedPassword,
        name: 'Test Student',
        studentNumber: 'STU001',
        department: 'Computer Science',
        program: 'Software Engineering'
      }
    })

    console.log(`✅ Created/updated student: ${student.email}`)
    console.log('\n📝 Test Credentials:')
    console.log('   Email: test@student.edu')
    console.log('   Password: Test@123456')
    console.log('\n⚠️  Change these credentials in production!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
