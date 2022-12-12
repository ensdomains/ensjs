/* eslint-disable no-var */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Copyright (c) 2019-present, GraphQL Foundation
 *
 * This source code is licensed under the MIT license.
 */

// Private: cached resolved Promise instance
var resolvedPromise: Promise<void> | null = null

// A Function, which when given an Array of keys, returns a Promise of an Array
// of values or Errors.
export type BatchLoadFn<K, V> = (
  keys: ReadonlyArray<K>,
) => Promise<ReadonlyArray<V | Error>>

/**
 * A `DataLoader` creates a public API for loading data from a particular
 * data back-end with unique keys such as the `id` column of a SQL table or
 * document name in a MongoDB database, given a batch loading function.
 *
 * Each `DataLoader` instance contains a unique memoized cache. Use caution when
 * used in long-lived applications or those which serve many users with
 * different access permissions and consider creating a new instance per
 * web request.
 */
class DataLoader<K, V> {
  constructor(batchLoadFn: BatchLoadFn<K, V>) {
    if (typeof batchLoadFn !== 'function') {
      throw new TypeError(
        'DataLoader must be constructed with a function which accepts ' +
          `Array<key> and returns Promise<Array<value>>, but got: ${batchLoadFn}.`,
      )
    }
    this._batchLoadFn = batchLoadFn
    this._maxBatchSize = Infinity
    this._batchScheduleFn = enqueuePostPromiseJob
    this._batch = null
  }

  // Private
  _batchLoadFn: BatchLoadFn<K, V>

  _maxBatchSize: number

  _batchScheduleFn: (fn: () => void) => void

  _batch: Batch<K, V> | null

  /**
   * Loads a key, returning a `Promise` for the value represented by that key.
   */
  load(key: K): Promise<V> {
    if (key === null || key === undefined) {
      throw new TypeError(
        'The loader.load() function must be called with a value, ' +
          `but got: ${String(key)}.`,
      )
    }

    const batch = getCurrentBatch(this)

    // Otherwise, produce a new Promise for this key, and enqueue it to be
    // dispatched along with the current batch.
    batch.keys.push(key)
    const promise = new Promise((resolve, reject) => {
      batch.callbacks.push({ resolve, reject })
    })

    return promise as Promise<V>
  }
}

// Private: Enqueue a Job to be executed after all "PromiseJobs" Jobs.
//
// ES6 JavaScript uses the concepts Job and JobQueue to schedule work to occur
// after the current execution context has completed:
// http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues
//
// Node.js uses the `process.nextTick` mechanism to implement the concept of a
// Job, maintaining a global FIFO JobQueue for all Jobs, which is flushed after
// the current call stack ends.
//
// When calling `then` on a Promise, it enqueues a Job on a specific
// "PromiseJobs" JobQueue which is flushed in Node as a single Job on the
// global JobQueue.
//
// DataLoader batches all loads which occur in a single frame of execution, but
// should include in the batch all loads which occur during the flushing of the
// "PromiseJobs" JobQueue after that same execution frame.
//
// In order to avoid the DataLoader dispatch Job occuring before "PromiseJobs",
// A Promise Job is created with the sole purpose of enqueuing a global Job,
// ensuring that it always occurs after "PromiseJobs" ends.
//
// Node.js's job queue is unique. Browsers do not have an equivalent mechanism
// for enqueuing a job to be performed after promise microtasks and before the
// next macrotask. For browser environments, a macrotask is used (via
// setImmediate or setTimeout) at a potential performance penalty.
const enqueuePostPromiseJob =
  typeof process === 'object' && typeof process.nextTick === 'function'
    ? function (fn: Function) {
        if (!resolvedPromise) {
          resolvedPromise = Promise.resolve()
        }
        resolvedPromise.then(() => {
          process.nextTick(fn)
        })
      }
    : typeof setImmediate === 'function'
    ? function (fn: (...args: any[]) => void) {
        setImmediate(fn)
      }
    : function (fn: Function) {
        setTimeout(fn)
      }

// Private: Describes a batch of requests
type Batch<K, V> = {
  hasDispatched: boolean
  keys: Array<K>
  callbacks: Array<{
    resolve: (value: V) => void
    reject: (error: Error) => void
  }>
}

// Private: Either returns the current batch, or creates and schedules a
// dispatch of a new batch for the given loader.
function getCurrentBatch<K, V>(loader: DataLoader<K, V>): Batch<K, V> {
  // If there is an existing batch which has not yet dispatched and is within
  // the limit of the batch size, then return it.
  const existingBatch = loader._batch
  if (
    existingBatch !== null &&
    !existingBatch.hasDispatched &&
    existingBatch.keys.length < loader._maxBatchSize
  ) {
    return existingBatch
  }

  // Otherwise, create a new batch for this loader.
  const newBatch = { hasDispatched: false, keys: [], callbacks: [] }

  // Store it on the loader so it may be reused.
  loader._batch = newBatch

  // Then schedule a task to dispatch this batch of requests.
  loader._batchScheduleFn(() => {
    dispatchBatch(loader, newBatch)
  })

  return newBatch
}

function dispatchBatch<K, V>(loader: DataLoader<K, V>, batch: Batch<K, V>) {
  // Mark this batch as having been dispatched.
  batch.hasDispatched = true

  // If there's nothing to load, resolve any cache hits and return early.
  if (batch.keys.length === 0) {
    return
  }

  // Call the provided batchLoadFn for this loader with the batch's keys and
  // with the loader as the `this` context.
  const batchPromise = loader._batchLoadFn(batch.keys)

  // Assert the expected response from batchLoadFn
  if (!batchPromise || typeof batchPromise.then !== 'function') {
    return failedDispatch(
      batch,
      new TypeError(
        'DataLoader must be constructed with a function which accepts ' +
          'Array<key> and returns Promise<Array<value>>, but the function did ' +
          `not return a Promise: ${String(batchPromise)}.`,
      ),
    )
  }

  // Await the resolution of the call to batchLoadFn.
  batchPromise
    .then((values) => {
      // Assert the expected resolution from batchLoadFn.
      if (!isArrayLike(values)) {
        throw new TypeError(
          'DataLoader must be constructed with a function which accepts ' +
            'Array<key> and returns Promise<Array<value>>, but the function did ' +
            `not return a Promise of an Array: ${String(values)}.`,
        )
      }
      if (values.length !== batch.keys.length) {
        throw new TypeError(
          'DataLoader must be constructed with a function which accepts ' +
            'Array<key> and returns Promise<Array<value>>, but the function did ' +
            'not return a Promise of an Array of the same length as the Array ' +
            'of keys.' +
            `\n\nKeys:\n${String(batch.keys)}` +
            `\n\nValues:\n${String(values)}`,
        )
      }

      // Step through values, resolving or rejecting each Promise in the batch.
      for (let i = 0; i < batch.callbacks.length; i += 1) {
        const value = values[i]
        if (value instanceof Error) {
          batch.callbacks[i].reject(value)
        } else {
          batch.callbacks[i].resolve(value)
        }
      }
    })
    .catch((error) => {
      failedDispatch(batch, error)
    })
}

// Private: do not cache individual loads if the entire batch dispatch fails,
// but still reject each request so they do not hang.
function failedDispatch<K, V>(batch: Batch<K, V>, error: Error) {
  for (let i = 0; i < batch.keys.length; i += 1) {
    batch.callbacks[i].reject(error)
  }
}

// Private
function isArrayLike(x: any): boolean {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof x.length === 'number' &&
    (x.length === 0 ||
      (x.length > 0 && Object.prototype.hasOwnProperty.call(x, x.length - 1)))
  )
}

export default DataLoader
