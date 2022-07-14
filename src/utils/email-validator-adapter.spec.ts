import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

const makeEmailValidatorAdapter = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter()
}

describe('Email Validator Adapter', () => {
  test('Should return false if validator returns false', () => {
    const sut = makeEmailValidatorAdapter()
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid@mail.com')
    expect(isValid).toBe(false)
  })
  test('Should return true if validator returns true', () => {
    const sut = makeEmailValidatorAdapter()
    const isValid = sut.isValid('valid@mail.com')
    expect(isValid).toBe(true)
  })
  test('Should call validator with correct email', () => {
    const sut = makeEmailValidatorAdapter()
    const emailSpy = jest.spyOn(validator, 'isEmail')
    sut.isValid('valid@gmail.com')
    expect(emailSpy).toHaveBeenCalledWith('valid@gmail.com')
  })
})
