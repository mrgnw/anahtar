import type { AuthLocals } from './lib/types.js';

declare global {
	namespace App {
		interface Locals extends AuthLocals {}
	}
}

export {};
