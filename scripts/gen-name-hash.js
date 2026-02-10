#!/usr/bin/env node
/**
 * 生成姓名 SHA-256 哈希，用于 config/provinces.js 的 allowedNameHashes
 * 用法: node scripts/gen-name-hash.js 姓名
 * 将输出的 hex 填入对应省份的 allowedNameHashes 数组
 */
const crypto = require('crypto')
const name = process.argv[2]
if (!name) {
  console.error('用法: node scripts/gen-name-hash.js 姓名')
  process.exit(1)
}
const hash = crypto.createHash('sha256').update(name).digest('hex')
console.log(hash)
