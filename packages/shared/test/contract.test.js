const { test } = require('node:test');
const assert = require('node:assert');
const shared = require('../dist');

test('có đủ 5 trạng thái và 5 độ ưu tiên', () => {
  assert.strictEqual(shared.STATUSES.length, 5);
  assert.strictEqual(shared.PRIORITIES.length, 5);
});

test('createIssueSchema điền mặc định status/priority/labelIds', () => {
  const r = shared.createIssueSchema.parse({ title: '  Fix login ', projectId: 'p1' });
  assert.deepStrictEqual(r, {
    title: 'Fix login',
    projectId: 'p1',
    status: 'BACKLOG',
    priority: 'NO_PRIORITY',
    labelIds: [],
  });
});

test('createIssueSchema từ chối tiêu đề rỗng và status sai', () => {
  assert.ok(!shared.createIssueSchema.safeParse({ title: ' ', projectId: 'p1' }).success);
  assert.ok(!shared.createIssueSchema.safeParse({ title: 'a', projectId: 'p1', status: 'X' }).success);
});

test('registerSchema chuẩn hóa email, yêu cầu mật khẩu ≥ 8 ký tự', () => {
  const r = shared.registerSchema.parse({ name: 'An', email: ' A@B.COM ', password: '12345678' });
  assert.strictEqual(r.email, 'a@b.com');
  assert.ok(!shared.registerSchema.safeParse({ name: 'An', email: 'a@b.com', password: '123' }).success);
});
