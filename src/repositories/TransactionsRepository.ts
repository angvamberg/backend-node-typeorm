import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const { income, outcome } = transactions.reduce(
      (soma, transaction) => {
        if (transaction.type === 'income') {
          soma.income += Number(transaction.value);
        } else {
          soma.outcome += Number(transaction.value);
        }
        return soma;
      },
      {
        outcome: 0,
        income: 0,
      },
    );

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance as Balance;
  }
}

export default TransactionsRepository;
