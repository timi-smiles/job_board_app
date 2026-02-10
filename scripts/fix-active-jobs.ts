import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking job listings...')
  
  // Get all jobs
  const jobs = await prisma.jobListing.findMany({
    select: {
      id: true,
      jobTitle: true,
      isActive: true,
    }
  })

  console.log(`\nFound ${jobs.length} jobs:`)
  jobs.forEach(job => {
    console.log(`- ${job.jobTitle}: ${job.isActive ? 'Active' : 'Inactive'}`)
  })

  // Update all jobs to be active
  const result = await prisma.jobListing.updateMany({
    where: {
      isActive: false
    },
    data: {
      isActive: true
    }
  })

  console.log(`\nUpdated ${result.count} jobs to active status.`)
  
  // Verify
  const activeCount = await prisma.jobListing.count({
    where: { isActive: true }
  })
  
  console.log(`Total active jobs: ${activeCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
