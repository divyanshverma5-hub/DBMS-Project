'use strict';

const crypto = require('node:crypto');

/**
 * In-memory Bloom filter for integer/string track identifiers.
 * It is a probabilistic pre-filter only: MySQL remains the source of truth.
 */
class BloomFilter {
  constructor(expectedItems = 1000, falsePositiveRate = 0.01) {
    if (!Number.isInteger(expectedItems) || expectedItems < 1) {
      throw new TypeError('expectedItems must be a positive integer');
    }
    if (!(falsePositiveRate > 0 && falsePositiveRate < 1)) {
      throw new TypeError('falsePositiveRate must be between 0 and 1');
    }

    this.expectedItems = expectedItems;
    this.falsePositiveRate = falsePositiveRate;
    this.bitSize = Math.max(
      64,
      Math.ceil((-expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 ** 2))
    );
    this.hashCount = Math.max(
      1,
      Math.round((this.bitSize / expectedItems) * Math.LN2)
    );
    this.bits = Buffer.alloc(Math.ceil(this.bitSize / 8));
    this.itemCount = 0;
  }

  _positions(value) {
    const digest = crypto.createHash('sha256').update(String(value)).digest();
    const first = digest.readUInt32BE(0);
    const second = digest.readUInt32BE(4) || 0x9e3779b9;
    const positions = [];

    for (let i = 0; i < this.hashCount; i += 1) {
      positions.push((first + (i * second) + (i * i)) % this.bitSize);
    }
    return positions;
  }

  add(value) {
    for (const position of this._positions(value)) {
      this.bits[position >> 3] |= 1 << (position & 7);
    }
    this.itemCount += 1;
    return this;
  }

  has(value) {
    return this._positions(value).every((position) => (
      (this.bits[position >> 3] & (1 << (position & 7))) !== 0
    ));
  }

  getEstimatedFalsePositiveRate() {
    if (this.itemCount === 0) return 0;
    return (1 - Math.exp(
      (-this.hashCount * this.itemCount) / this.bitSize
    )) ** this.hashCount;
  }

  getStats() {
    return {
      expected_items: this.expectedItems,
      inserted_items: this.itemCount,
      bit_size: this.bitSize,
      hash_count: this.hashCount,
      estimated_false_positive_rate: Number(this.getEstimatedFalsePositiveRate().toFixed(6)),
    };
  }
}

module.exports = BloomFilter;
