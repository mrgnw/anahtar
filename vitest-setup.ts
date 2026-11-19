import '@testing-library/jest-dom/vitest';

const animate = Element.prototype.animate;

Element.prototype.animate = function (...args: Parameters<typeof animate>) {
	const animation = animate.apply(this, args);
	void animation.finished.catch((error: unknown) => {
		if (!(error instanceof DOMException) || error.name !== 'AbortError') throw error;
	});
	return animation;
};
