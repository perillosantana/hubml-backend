/* eslint-disable drizzle/enforce-delete-with-where */

import { descriptions, orders, users } from './schema'
import { db } from './connection'
import chalk from 'chalk'

/**
 * Reset database
 */
await db.delete(users)
await db.delete(descriptions)
await db.delete(orders)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create Users
 */
const userData = [
  {
    login: 'perillooliveira@gmail.com',
    password: await Bun.password.hash('perillo'),
    name: 'Perillo Santana',
    phone: '11958187338',
    active: false,
    balance: 1000,
  },
  {
    login: 'teste@gmail.com',
    password: await Bun.password.hash('perillo'),
    name: 'Teste Santana',
    phone: '11958187338',
    active: false,
    balance: 1000,
  },
]

await db.insert(users).values(userData)

console.log(chalk.yellow('✔ Created users'))

/**
 * Create Descriptions
 */

const descriptionsData = [
  {
    description:
      'A Ceuca Box Preta na cor azul é a escolha perfeita para aqueles que desejam adicionar um toque de modernidade ao seu ambiente. Com seu design elegante e contemporâneo, esta caixa é ideal para armazenar e organizar uma variedade de itens, desde acessórios de escritório até produtos de higiene pessoal.\n\nFeita com materiais de alta qualidade, a Ceuca Box possui uma estrutura resistente e durável, garantindo que seus pertences fiquem seguros e protegidos. Sua cor azul vibrante adiciona um toque de cor e estilo a qualquer espaço, enquanto a caixa preta proporciona um contraste moderno e sofisticado.\n\nAlém de sua funcionalidade prática, a Ceuca Box também é uma peça decorativa versátil. Utilize-a como um elemento de destaque em prateleiras, estantes ou mesas, ou integre-a perfeitamente a um sistema de organização existente. Seja em casa, no escritório ou no banheiro, esta caixa oferece praticidade e beleza em igual medida.',
    value: 100,
    productId: 'MLB3555206153',
    userId: 'perillooliveira@gmail.com',
  },
]

await db.insert(descriptions).values(descriptionsData)

console.log(chalk.yellow('✔ Created descriptions'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
