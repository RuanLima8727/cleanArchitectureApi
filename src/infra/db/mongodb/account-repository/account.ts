import { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/useCases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    const oResult = await accountCollection.findOne(result.insertedId)
    // console.log(oResult)
    const account = {
      id: oResult._id.toString(),
      name: oResult.name,
      email: oResult.email,
      password: oResult.password
    }
    // const { _id, ...accountWithoutId} = oResult
    // return Object.assign({}, accountWithoutId, {id: _id.toString()})
    return account
  }
}
