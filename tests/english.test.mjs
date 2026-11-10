import test from 'node:test';
import assert from 'node:assert/strict';
import { englishError, formatCount } from '../src/english.ts';

test('counts use English compact units', () => {
  for (const [value, expected] of [[undefined, '0'], [0, '0'], [999, '999'], [1000, '1K'], [12500, '12.5K'], [1000000, '1M'], [100000000, '100M'], [1000000000, '1B']]) {
    assert.equal(formatCount(value), expected);
  }
});

test('native errors have actionable English display text', () => {
  assert.match(englishError('HTTP 503 Service Unavailable'), /HTTP 503/);
  assert.match(englishError('请先登录'), /sign in/);
  assert.match(englishError('镜像线路仅供游客浏览；登录\/注册请切换到固定线路'), /guest browsing/);
  assert.match(englishError('请求超时'), /timed out/);
  assert.match(englishError('DNS 解析失败'), /resolve/);
  assert.match(englishError('禁止访问普通内网'), /security policy/);
  assert.match(englishError('未知上游错误'), /debug.log/);
  assert.equal(englishError('Connection refused'), 'Connection refused');
  assert.match(englishError('用户名或密码错误'), /Incorrect username or password/);
  assert.match(englishError('用户名已存在'), /already registered/);
  assert.match(englishError('账号不存在'), /Account not found/);
  assert.match(englishError('登录已过期'), /session has expired/);
  assert.match(englishError('请求过于频繁'), /Too many requests/);
  assert.match(englishError('邮箱格式不正确'), /valid email/);
  assert.match(englishError('密码至少8位'), /length requirements/);
});
