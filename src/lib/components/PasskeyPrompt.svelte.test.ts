import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';

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
		render(PasskeyPrompt, { props: { onRegister, onSkip } });
		expect(screen.getByText('Making you a passkey')).toBeInTheDocument();
		expect(screen.getByText('for easier login')).toBeInTheDocument();
	});

	it('shows Skip button initially', () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { onRegister, onSkip } });
		expect(screen.getByText('Skip')).toBeInTheDocument();
	});

	it('calls onSkip when Skip clicked', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { onRegister, onSkip } });
		await fireEvent.click(screen.getByText('Skip'));
		expect(onSkip).toHaveBeenCalledOnce();
	});

	it('calls onRegister after countdown expires', async () => {
		const onRegister = vi.fn().mockResolvedValue(undefined);
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { onRegister, onSkip, countdownSeconds: 2 } });

		expect(onRegister).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(2000);
		expect(onRegister).toHaveBeenCalledOnce();
	});

	it('shows failed state when onRegister throws', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { onRegister, onSkip, countdownSeconds: 1 } });

		await vi.advanceTimersByTimeAsync(1000);

		// Wait for the rejected promise to settle
		await vi.waitFor(() => {
			expect(screen.getByText('Set up a passkey?')).toBeInTheDocument();
		});
		expect(screen.getByText('Add passkey')).toBeInTheDocument();
		expect(screen.getByText('Maybe later')).toBeInTheDocument();
	});

	it('calls onSkip when "Maybe later" clicked in failed state', async () => {
		const onRegister = vi.fn().mockRejectedValue(new Error('fail'));
		const onSkip = vi.fn();
		render(PasskeyPrompt, { props: { onRegister, onSkip, countdownSeconds: 1 } });

		await vi.advanceTimersByTimeAsync(1000);
		await vi.waitFor(() => {
			expect(screen.getByText('Maybe later')).toBeInTheDocument();
		});

		await fireEvent.click(screen.getByText('Maybe later'));
		expect(onSkip).toHaveBeenCalledOnce();
	});
});
