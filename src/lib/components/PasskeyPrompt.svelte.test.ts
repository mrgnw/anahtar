import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';
import en from '../i18n/en.js';

describe('PasskeyPrompt', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows "Making you a passkey" initially', () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip } });
		expect(screen.getByText('Making you a passkey')).toBeInTheDocument();
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

	it('calls onRegister after countdown expires', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip, countdownSeconds: 2 } });

		expect(onRegister).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(2000);
		expect(onRegister).toHaveBeenCalledOnce();
	});

	it('re-enables the manual buttons when onRegister throws', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip, countdownSeconds: 1 } });

		await vi.advanceTimersByTimeAsync(1000);

		await vi.waitFor(() => {
			expect(onRegister).toHaveBeenCalledOnce();
			expect(screen.getByText('Add passkey now')).not.toBeDisabled();
		});
		expect(screen.getByText('Maybe later')).toBeInTheDocument();
	});

	it('calls onSkip when "Maybe later" clicked in failed state', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { m: en, onRegister, onSkip, countdownSeconds: 1 } });

		await vi.advanceTimersByTimeAsync(1000);
		await vi.waitFor(() => {
			expect(screen.getByText('Maybe later')).toBeInTheDocument();
		});

		await fireEvent.click(screen.getByText('Maybe later'));
		expect(onSkip).toHaveBeenCalledOnce();
	});
});
