# Backend Services for Account and Payment Management

## Overview

This project consists of two backend services: `Account Manager` and `Payment Manager`. These services manage user accounts, transactions, and payment histories, utilizing Node.js with Fastify, PostgreSQL with Prisma ORM, and Supabase for authentication.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Transaction Processing](#transaction-processing)
- [Recurring Payments](#recurring-payments)
- [Docker and Containerization](#docker-and-containerization)
- [API Documentation](#api-documentation)

## Tech Stack

- **Node.js**: Backend runtime environment.
- **Fastify**: Web framework for building APIs.
- **PostgreSQL**: Relational database.
- **Prisma**: ORM for database management.
- **Supabase**: Authentication service.
- **Docker**: Containerization platform.
- **Docker Compose**: Tool for defining and running multi-container Docker applications.

## Setup and Installation

1. **Environment Variables**: Create a .env file in both account-manager and payment-manager directories with the following content:

```bash
SUPABASE_URL="yoursupabaseurl"
SUPABASE_KEY="yoursupabasekey"
DB_PASSWORD="yourdatabasepassword"
DB_USERNAME="yourdatabaseusername"
DB_NAME="yourdatabasename"
DATABASE_URL="yourdatabaseurl"
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup Prisma**:

```bash
npx prisma migrate dev --name init
```

## Database Schema

The database schema is defined using Prisma ORM. Below is a simplified schema for reference:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String?
  accounts PaymentAccount[]
}

model PaymentAccount {
  id       Int      @id @default(autoincrement())
  type     String
  userId   Int
  user     User     @relation(fields: [userId], references: [id])
  history  Transaction[]
}

model Transaction {
  id        Int      @id @default(autoincrement())
  amount    Float
  toAddress String
  currency  String
  status    String
  timestamp DateTime @default(now())
  accountId   Int
  account     PaymentAccount @relation(fields: [accountId], references: [id])
}
```

## Authentication

Authentication is handled using Supabase. Users can register and log in using the /register and /login endpoints. JWT tokens are used for protecting routes and ensuring secure access.

## Transaction Processing

Transactions are processed using a simulated function that introduces a delay to mimic real-world processing times. The processTransaction function updates account balances and logs the transaction upon successful completion.

## Recurring Payments

Recurring payments are implemented using a job scheduler (node-cron). Users can set up recurring payments that automatically execute at specified intervals.

## Docker and Containerization

The project is containerized using Docker. The docker-compose.yml file orchestrates the containers, allowing you to run the entire application with a single command.

## API Documentation

Swagger documentation is available at `/docs` of the project, providing an interactive interface to explore and test the APIs.
