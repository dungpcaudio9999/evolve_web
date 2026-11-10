// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SAMPLE_LABELS } from '@/lib/sample-data';
import { LabelSelector } from './label-selector';

function Harness() {
  const [value, setValue] = useState<string[]>(['l-bug']);
  return (
    <>
      <LabelSelector value={value} labels={SAMPLE_LABELS} onChange={setValue} />
      <output>{value.join(',')}</output>
    </>
  );
}

describe('LabelSelector', () => {
  it('bật/tắt nhiều nhãn, popover vẫn mở để chọn tiếp', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Nhãn: Bug' }));

    await userEvent.click(screen.getByRole('option', { name: 'Design' }));
    await userEvent.click(screen.getByRole('option', { name: 'Docs' }));
    expect(screen.getByRole('status')).toHaveTextContent('l-bug,l-design,l-docs');
    expect(screen.getByRole('option', { name: 'Docs' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('option', { name: 'Bug' }));
    expect(screen.getByRole('status')).toHaveTextContent('l-design,l-docs');
  });

  it('tìm nhãn theo tên', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: /Nhãn/ }));
    await userEvent.type(screen.getByPlaceholderText('Tìm nhãn…'), 'impr');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Improvement']);
  });
});
