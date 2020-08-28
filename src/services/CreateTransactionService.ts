import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (title === '' || title === undefined) {
      throw new AppError(
        'Invalid title entry. Fill some transaction description in title.',
        400,
      );
    }

    if (typeof value !== 'number' || value === undefined) {
      throw new AppError('Invalid value entry. Value must be numeric.', 400);
    }

    if ((type !== 'income' && type !== 'outcome') || type === undefined) {
      throw new AppError(
        'Invalid type entry. Type must be income or outcome.',
        400,
      );
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError(
          `Sorry, but the amount requested is greater than your bank balance. $${total}.`,
          400,
        );
      }
    }

    if (category === '' || category === undefined) {
      throw new AppError(
        'Invalid category entry. Fill some category description in category.',
        400,
      );
    }

    const categoriesRepository = getRepository(Category);

    // Check if the category had been inserted in database
    let categoryFound = await categoriesRepository.findOne({
      where: { title: category },
    });

    // If not inserted previously
    if (!categoryFound) {
      // Create a new category
      const newCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(newCategory);
      categoryFound = newCategory;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categoryFound.id,
    });

    // Commit changes
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
