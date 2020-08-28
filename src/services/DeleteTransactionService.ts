import { getCustomRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new AppError('It seems your transaction id is incorrect..', 400);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const getTransaction = await transactionsRepository.findOne(id);

    if (!getTransaction) {
      throw new AppError("Sorry, but we couldn't find your transaction.", 400);
    }

    await transactionsRepository.remove(getTransaction);
  }
}

export default DeleteTransactionService;
