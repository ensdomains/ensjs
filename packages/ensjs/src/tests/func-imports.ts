import batch from '../functions/batch'
import {
  multicallWrapper,
  resolverMulticallWrapper,
  universalWrapper,
} from '../functions/batchWrappers'
import burnFuses from '../functions/burnFuses'
import commitName from '../functions/commitName'
import createSubname from '../functions/createSubname'
import deleteSubname from '../functions/deleteSubname'
import getAvailable from '../functions/getAvailable'
import getDNSOwner from '../functions/getDNSOwner'
import getExpiry from '../functions/getExpiry'
import { getHistory } from '../functions/getHistory'
import getName from '../functions/getName'
import getNames from '../functions/getNames'
import getOwner from '../functions/getOwner'
import getPrice from '../functions/getPrice'
import getProfile from '../functions/getProfile'
import getRecords from '../functions/getRecords'
import getResolver from '../functions/getResolver'
import {
  getABI,
  getAddr,
  getContentHash,
  getText,
  _getABI,
  _getAddr,
  _getContentHash,
  _getText,
} from '../functions/getSpecificRecord'
import getSubnames from '../functions/getSubnames'
import getWrapperData from '../functions/getWrapperData'
import importDNSSECName from '../functions/importDNSSECName'
import registerName from '../functions/registerName'
import {
  // eslint-disable-next-line import/no-named-default
  default as renewNames,
  renewNameWithData,
} from '../functions/renewNames'
import setName from '../functions/setName'
import setRecord from '../functions/setRecord'
import setRecords from '../functions/setRecords'
import setResolver from '../functions/setResolver'
import supportsTLD from '../functions/supportsTLD'
import transferController from '../functions/transferController'
import transferName from '../functions/transferName'
import transferSubname from '../functions/transferSubname'
import unwrapName from '../functions/unwrapName'
import wrapName from '../functions/wrapName'

export default {
  batch,
  multicallWrapper,
  resolverMulticallWrapper,
  universalWrapper,
  burnFuses,
  commitName,
  createSubname,
  deleteSubname,
  getAvailable,
  getDNSOwner,
  getExpiry,
  getHistory,
  getName,
  getNames,
  getOwner,
  getPrice,
  getProfile,
  getRecords,
  getResolver,
  getAddr,
  getContentHash,
  getText,
  getABI,
  _getAddr,
  _getContentHash,
  _getText,
  _getABI,
  getSubnames,
  getWrapperData,
  importDNSSECName,
  registerName,
  renewNames,
  renewNameWithData,
  setName,
  setRecord,
  setRecords,
  setResolver,
  supportsTLD,
  transferController,
  transferName,
  transferSubname,
  unwrapName,
  wrapName,
}
