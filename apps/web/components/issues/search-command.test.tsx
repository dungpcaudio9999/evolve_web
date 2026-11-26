// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { SAMPLE_ISSUES } from '@/lib/sample-data';
import { SearchCommand } from './search-command';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/api-client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api-client')>();
  return { ...mod, api: { ...mod.api, get: vi.fn() } };
});

beforeEach(() => {
  push.mockReset();
  vi.mocked(api.get).mockResolvedValue(SAMPLE_ISSUES);
});

describe('SearchCommand', () => {
  it('Ctrl+K mở, gõ từ khóa lọc, Enter mở trang chi tiết', async () => {
    render(<SearchCommand />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByPlaceholderText(/Tìm issue/);
    const target = SAMPLE_ISSUES[0];
    await screen.findByText(target.identifier);
    await userEvent.type(input, target.identifier);
    await userEvent.keyboard('{Enter}');
    expect(api.get).toHaveBeenCalledWith('/issues');
    expect(push).toHaveBeenCalledWith(`/issues/${target.id}`);
  });
});
