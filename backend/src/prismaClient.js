// src/prismaClient.js
// Instância única do Prisma para ser usada em todo o projeto

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
