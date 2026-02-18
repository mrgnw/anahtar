export function guessDeviceName(ua?: string): string {
	const s = ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
	if (!s) return 'Passkey';

	const browser = /Edg\//i.test(s)
		? 'Edge'
		: /OPR\//i.test(s)
			? 'Opera'
			: /Chrome\//i.test(s)
				? 'Chrome'
				: /Safari\//i.test(s) && !/Chrome/i.test(s)
					? 'Safari'
					: /Firefox\//i.test(s)
						? 'Firefox'
						: null;

	const os = /Windows/i.test(s)
		? 'Windows'
		: /Mac OS|Macintosh/i.test(s)
			? 'macOS'
			: /Android/i.test(s)
				? 'Android'
				: /iPhone|iPad|iPod/i.test(s)
					? 'iOS'
					: /Linux/i.test(s)
						? 'Linux'
						: /CrOS/i.test(s)
							? 'ChromeOS'
							: null;

	if (browser && os) return `${browser} on ${os}`;
	if (browser) return browser;
	if (os) return os;
	return 'Passkey';
}
