import { AccountModel } from '../../../domain/models/account'
import { AddAccountRepository, Encrypter, AddAccount, AddAccountModel } from './add-account-protocols'

export class DbAddAccount implements AddAccount {
  private readonly encrypter: Encrypter
  private readonly addAccountRepository: AddAccountRepository
  constructor (encrypter: Encrypter, addAccountRepository: AddAccountRepository) {
    this.encrypter = encrypter
    this.addAccountRepository = addAccountRepository
  }

  async add (account: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.encrypter.encrypt(account.password)
    const accountSuccess = await this.addAccountRepository.add(Object.assign({}, account, { password: hashedPassword }))
    return accountSuccess
  }
}
