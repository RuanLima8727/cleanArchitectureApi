import { DbAddAccount } from './db-add-account'
import { AddAccountRepository, Encrypter, AddAccountModel, AccountModel } from './add-account-protocols'

interface sutTypes{
  encrypterStub: Encrypter
  sut: DbAddAccount
  addAccountRepositoryStub: AddAccountRepository
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'any_id',
        name: 'any_name',
        email: 'any_email',
        password: 'any_hash'
      }
      return await new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new AddAccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hash_pass'))
    }
  }
  return new EncrypterStub()
}

const makeSut = (): sutTypes => {
  const addAccountRepositoryStub = makeAddAccountRepository()
  const encrypterStub = makeEncrypter()
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)
  return {
    encrypterStub,
    sut,
    addAccountRepositoryStub
  }
}

describe('DbAddAccount useCase', () => {
  test('Should call Encrypter with a correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'valid_pass'
    }
    await sut.add(accountData)
    expect(encryptSpy).toBeCalledWith('valid_pass')
  })
  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const encryptSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    const accountData = {
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'valid_pass'
    }
    await sut.add(accountData)
    expect(encryptSpy).toBeCalledWith({
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'hash_pass'
    })
  })
  test('Should throw if encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = {
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'valid_pass'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })
  test('Should throw if AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
      new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = {
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'valid_pass'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })
  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const accountData = {
      name: 'valid_Name',
      email: 'valid@Mail.com',
      password: 'valid_pass'
    }
    const account = await sut.add(accountData)
    await expect(account).toEqual({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      password: 'any_hash'
    })
  })
})
