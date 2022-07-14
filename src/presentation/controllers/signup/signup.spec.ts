/* eslint-disable arrow-spacing */
import { AddAccount, AddAccountModel, AccountModel, EmailValidator } from './signup-protocols'
import { InvalidParamError, MissingParamError, ServerError } from '../errors/index'
import { SignUpController } from './signupController'

interface SutTypes {
  emailValidatorStub: EmailValidator
  sut: SignUpController
  addAccountStub: AddAccount
}

const MakeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'anyId',
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass'
      }
      return await new Promise((resolve) => { resolve(fakeAccount) })
    }
  }
  return new AddAccountStub()
}

const MakeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const MakeSut = (): SutTypes => {
  const addAccountStub = MakeAddAccount()
  const emailValidatorStub = MakeEmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return {
    emailValidatorStub,
    sut,
    addAccountStub
  }
}

describe('SignUp Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })
  test('Should return 400 if no email is provided', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
  test('Should return 400 if no password is provided', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })
  test('Should return 400 if no password confirmation is provided', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })
  test('Should return 400 if an invalid email was provided', async () => {
    const { sut, emailValidatorStub } = MakeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })
  test('Should call Email Validator with a correct email', async () => {
    const { sut, emailValidatorStub } = MakeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    await sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any@gmail.com')
  })
  test('Should return 500 if Email Validator throws', async () => {
    const { sut, emailValidatorStub } = MakeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(
      () => {
        throw new Error()
      })
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
  test('Should return 400 if password and passwordConfirmation are not equal', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'wrong_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })
  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = MakeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    await sut.handle(httpRequest)
    expect(addSpy).toBeCalledWith({
      name: 'any_name',
      email: 'any@gmail.com',
      password: 'any_pass'
    })
  })
  test('Should return 500 if add account throws', async () => {
    const { sut, addAccountStub } = MakeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(
      async () => {
        return await new Promise((resolve, reject)=> reject(new Error()))
      })
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
  test('Should return 200 if valid data is provided', async () => {
    const { sut } = MakeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any@gmail.com',
        password: 'any_pass',
        passwordConfirmation: 'any_pass'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'anyId',
      name: 'any_name',
      email: 'any@gmail.com',
      password: 'any_pass'
    })
  })
})
