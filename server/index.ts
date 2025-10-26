import cors from 'cors'
import express from 'express'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BudgetInput, BudgetRecord, Transaction, TransactionInput } from '../src/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = resolve(__dirname, '../data/db.json')
const PORT = Number(process.env.PORT ?? 4000)

interface DatabaseSchema {
  transactions: Transaction[]
  budgets: BudgetRecord[]
  metadata: {
    currency: string
    createdAt: string
  }
}

const defaultDatabase: DatabaseSchema = {
  transactions: [],
  budgets: [],
  metadata: {
    currency: 'IRR',
    createdAt: new Date().toISOString(),
  },
}

async function readDatabase(): Promise<DatabaseSchema> {
  try {
    const contents = await readFile(DB_PATH, 'utf-8')
    return JSON.parse(contents) as DatabaseSchema
  } catch (error) {
    console.error('Failed to read database, using fallback', error)
    return defaultDatabase
  }
}

let writeQueue: Promise<DatabaseSchema> = Promise.resolve(defaultDatabase)

class NotFoundError extends Error {}

function queueWrite(
  update: (current: DatabaseSchema) => DatabaseSchema | void,
): Promise<DatabaseSchema> {
  writeQueue = writeQueue.then(async () => {
    const current = await readDatabase()
    const next = (update(current) ?? current) as DatabaseSchema
    await writeFile(DB_PATH, JSON.stringify(next, null, 2), 'utf-8')
    return next
  })

  return writeQueue
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/transactions', async (_req, res) => {
  const db = await readDatabase()
  const transactions = [...db.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  res.json(transactions)
})

app.post('/api/transactions', async (req, res) => {
  const payload = req.body as TransactionInput | undefined

  if (!payload) {
    return res.status(400).json({ message: 'Missing request body' })
  }

  const { amount, category, date, description, type } = payload

  if (!category || !type || !date || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Invalid transaction payload' })
  }

  const createdAt = new Date().toISOString()

  let created: Transaction | null = null

  try {
    await queueWrite((db) => {
      const lastId = db.transactions.reduce((max, transaction) => Math.max(max, transaction.id), 0)
      created = {
        id: lastId + 1,
        category,
        amount,
        type,
        description,
        date: new Date(date).toISOString(),
        createdAt,
        updatedAt: createdAt,
      }

      db.transactions.unshift(created)
    })
  } catch (error) {
    console.error('Unable to create transaction', error)
    return res.status(500).json({ message: 'Unable to create transaction' })
  }

  if (!created) {
    return res.status(500).json({ message: 'Unable to create transaction' })
  }

  res.status(201).json(created)
})

app.get('/api/budgets', async (_req, res) => {
  const db = await readDatabase()
  const budgets = [...db.budgets].sort((a, b) => (a.month > b.month ? -1 : 1))
  res.json(budgets)
})

app.post('/api/budgets', async (req, res) => {
  const payload = req.body as BudgetInput | undefined

  if (!payload) {
    return res.status(400).json({ message: 'Missing request body' })
  }

  const { amount, month, alertsEnabled, category } = payload

  if (!month || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Invalid budget payload' })
  }

  const timestamp = new Date().toISOString()
  let created: BudgetRecord | null = null

  try {
    await queueWrite((db) => {
      const lastId = db.budgets.reduce((max, item) => Math.max(max, item.id), 0)
      created = {
        id: lastId + 1,
        month,
        amount,
        alertsEnabled: Boolean(alertsEnabled),
        category,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      db.budgets.unshift(created)
    })
  } catch (error) {
    console.error('Unable to create budget', error)
    return res.status(500).json({ message: 'Unable to create budget' })
  }

  if (!created) {
    return res.status(500).json({ message: 'Unable to create budget' })
  }

  res.status(201).json(created)
})

app.patch('/api/budgets/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid budget id' })
  }

  const payload = req.body as Partial<BudgetInput> | undefined
  if (!payload) {
    return res.status(400).json({ message: 'Missing request body' })
  }

  let updatedItem: BudgetRecord | null = null

  try {
    await queueWrite((db) => {
      const index = db.budgets.findIndex((budget) => budget.id === id)
      if (index === -1) {
        throw new NotFoundError('Budget not found')
      }

      const target = db.budgets[index]
      const updated: BudgetRecord = {
        ...target,
        ...payload,
        amount:
          payload.amount !== undefined ? Number(payload.amount) : target.amount,
        alertsEnabled:
          payload.alertsEnabled !== undefined
            ? Boolean(payload.alertsEnabled)
            : target.alertsEnabled,
        updatedAt: new Date().toISOString(),
      }

      db.budgets[index] = updated
      updatedItem = updated
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message })
    }
    console.error('Unable to update budget', error)
    return res.status(500).json({ message: 'Unable to update budget' })
  }

  if (!updatedItem) {
    return res.status(500).json({ message: 'Unable to update budget' })
  }

  res.json(updatedItem)
})

app.delete('/api/budgets/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid budget id' })
  }

  let removed = false

  try {
    await queueWrite((db) => {
      const initialLength = db.budgets.length
      db.budgets = db.budgets.filter((budget) => budget.id !== id)
      removed = db.budgets.length < initialLength
      if (!removed) {
        throw new NotFoundError('Budget not found')
      }
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message })
    }
    console.error('Unable to delete budget', error)
    return res.status(500).json({ message: 'Unable to delete budget' })
  }

  res.status(204).end()
})

app.get('/api/metadata', async (_req, res) => {
  const db = await readDatabase()
  res.json(db.metadata)
})

app.listen(PORT, () => {
  console.log(`Wallet backend listening on http://localhost:${PORT}`)
})
