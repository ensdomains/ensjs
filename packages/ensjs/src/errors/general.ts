import { NameType } from '../types'
import { BaseError } from './base'

export class AdditionalParameterSpecifiedError extends BaseError {
  parameter: string

  allowedParameters: string[]

  override name = 'AdditionalParameterSpecifiedError'

  constructor({
    parameter,
    allowedParameters,
    details,
  }: {
    parameter: string
    allowedParameters: string[]
    details?: string
  }) {
    super(`Additional parameter specified: ${parameter}`, {
      metaMessages: [`- Allowed parameters: ${allowedParameters.join(', ')}`],
      details,
    })
    this.parameter = parameter
    this.allowedParameters = allowedParameters
  }
}

export class ParameterNotSpecifiedError extends BaseError {
  override name = 'ParameterNotSpecifiedError'
}

export class UnsupportedNameTypeError extends BaseError {
  nameType: NameType

  supportedTypes: NameType[]

  override name = 'UnsupportedNameTypeError'

  constructor({
    nameType,
    supportedNameTypes,
    details,
  }: {
    nameType: NameType
    supportedNameTypes: NameType[]
    details?: string
  }) {
    super(`Unsupported name type: ${nameType}`, {
      metaMessages: [
        `- Supported name types: ${supportedNameTypes.join(', ')}`,
      ],
      details,
    })
    this.nameType = nameType
    this.supportedTypes = supportedNameTypes
  }
}
