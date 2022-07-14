/* eslint-disable @typescript-eslint/return-await */
import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return new Promise(resolve => resolve('hash'))
  }
})
)
const salt = 12

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  test('Should call Bcrypt with a correct value', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.encrypt('any_password')
    expect(hashSpy).toHaveBeenCalledWith('any_password', salt)
  })
  test('Should return a hash on success', async () => {
    const sut = makeSut()
    const hashPass = await sut.encrypt('any_password')
    expect(hashPass).toBe('hash')
  })
  test('Should throw if bcrypt throws', async () => {
    const sut = makeSut()
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce((): never => {
      throw new Error()
    })
    const promise = sut.encrypt('any_password')
    await expect(promise).rejects.toThrow()
  })
})
