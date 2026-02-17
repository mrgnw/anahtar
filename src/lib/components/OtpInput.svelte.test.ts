import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import OtpInput from './OtpInput.svelte';

describe('OtpInput', () => {
	it('renders 5 inputs by default', () => {
		render(OtpInput);
		const inputs = screen.getAllByRole('textbox');
		expect(inputs).toHaveLength(5);
	});

	it('renders custom number of inputs', () => {
		render(OtpInput, { props: { length: 6 } });
		const inputs = screen.getAllByRole('textbox');
		expect(inputs).toHaveLength(6);
	});

	it('accepts digit input', async () => {
		render(OtpInput);
		const inputs = screen.getAllByRole('textbox');
		await fireEvent.input(inputs[0], { target: { value: '3' } });
		expect(inputs[0]).toHaveValue('3');
	});

	it('ignores non-digit input', async () => {
		render(OtpInput);
		const inputs = screen.getAllByRole('textbox');
		await fireEvent.input(inputs[0], { target: { value: 'a' } });
		expect(inputs[0]).toHaveValue('');
	});

	it('calls onComplete when all digits filled', async () => {
		const onComplete = vi.fn();
		render(OtpInput, { props: { onComplete } });
		const inputs = screen.getAllByRole('textbox');

		for (let i = 0; i < 4; i++) {
			await fireEvent.input(inputs[i], { target: { value: String(i + 1) } });
		}
		expect(onComplete).not.toHaveBeenCalled();

		await fireEvent.input(inputs[4], { target: { value: '5' } });
		expect(onComplete).toHaveBeenCalledWith('12345');
	});

	it('disables all inputs when disabled', () => {
		render(OtpInput, { props: { disabled: true } });
		const inputs = screen.getAllByRole('textbox');
		for (const input of inputs) {
			expect(input).toBeDisabled();
		}
	});

	it('handles paste of full code', async () => {
		const onComplete = vi.fn();
		render(OtpInput, { props: { onComplete } });
		const inputs = screen.getAllByRole('textbox');

		const clipboardData = { getData: () => '67890' };
		await fireEvent.paste(inputs[0], { clipboardData });

		expect(inputs[0]).toHaveValue('6');
		expect(inputs[1]).toHaveValue('7');
		expect(inputs[2]).toHaveValue('8');
		expect(inputs[3]).toHaveValue('9');
		expect(inputs[4]).toHaveValue('0');
		expect(onComplete).toHaveBeenCalledWith('67890');
	});

	it('paste strips non-digits', async () => {
		const onComplete = vi.fn();
		render(OtpInput, { props: { onComplete } });
		const inputs = screen.getAllByRole('textbox');

		const clipboardData = { getData: () => '1-2-3-4-5' };
		await fireEvent.paste(inputs[0], { clipboardData });

		expect(onComplete).toHaveBeenCalledWith('12345');
	});
});
