import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';
import en from '../i18n/en.js';

describe('PasskeyPrompt', () => {
	it('shows "Add a passkey?" initially', () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });
		expect(screen.getByText('Add a passkey?')).toBeInTheDocument();
		expect(screen.getByText('for faster, easier, safer login')).toBeInTheDocument();
	});

	it('shows the "Maybe later" button initially', () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });
		expect(screen.getByText('Maybe later')).toBeInTheDocument();
	});

	it('calls onSkip when "Maybe later" clicked', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });
		await fireEvent.click(screen.getByText('Maybe later'));
		expect(onSkip).toHaveBeenCalledOnce();
	});

	it('never calls onRegister without a click', async () => {
		vi.useFakeTimers();
		try {
			const onRegister = vi.fn().mockResolvedValue(undefined);
			const onSkip = vi.fn();
			render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });

			await vi.advanceTimersByTimeAsync(30000);
			expect(onRegister).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('calls onRegister when "Add passkey now" clicked', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });

		await fireEvent.click(screen.getByText('Add passkey now'));
		expect(onRegister).toHaveBeenCalledOnce();
	});

	it('calls onRegister when the ring is clicked', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });

		await fireEvent.click(screen.getByTitle('Set up now'));
		expect(onRegister).toHaveBeenCalledOnce();
	});

	it('re-enables the manual buttons when onRegister throws', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });

		await fireEvent.click(screen.getByText('Add passkey now'));

		await vi.waitFor(() => {
			expect(onRegister).toHaveBeenCalledOnce();
			expect(screen.getByText('Add passkey now')).not.toBeDisabled();
		});
		expect(screen.getByText('Maybe later')).toBeInTheDocument();
	});

	it('calls onSkip when "Maybe later" clicked in failed state', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });

		await fireEvent.click(screen.getByText('Add passkey now'));
		await vi.waitFor(() => {
			expect(screen.getByText('Add passkey now')).not.toBeDisabled();
		});

		await fireEvent.click(screen.getByText('Maybe later'));
		expect(onSkip).toHaveBeenCalledOnce();
	});
});
