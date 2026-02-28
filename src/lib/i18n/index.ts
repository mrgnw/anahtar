import type { AuthMessages } from './types.js';
import en from './en.js';
import ar from './ar.js';
import de from './de.js';
import es from './es.js';
import fr from './fr.js';
import ja from './ja.js';
import ko from './ko.js';
import pt from './pt.js';
import tr from './tr.js';
import zh from './zh.js';
import bn from './bn.js';
import hi from './hi.js';
import id from './id.js';
import ru from './ru.js';
import vi from './vi.js';
import it from './it.js';
import ms from './ms.js';
import nl from './nl.js';
import pl from './pl.js';
import sv from './sv.js';
import th from './th.js';
import uk from './uk.js';
import fi from './fi.js';
import fil from './fil.js';
import ur from './ur.js';
import ta from './ta.js';
import af from './af.js';
import ca from './ca.js';
import sr from './sr.js';
import sw from './sw.js';
import cs from './cs.js';
import fa from './fa.js';
import he from './he.js';
import ro from './ro.js';
import da from './da.js';
import el from './el.js';
import hu from './hu.js';
import no from './no.js';
import bg from './bg.js';
import hr from './hr.js';
import sk from './sk.js';
import te from './te.js';

export type { AuthMessages } from './types.js';
export { default as en } from './en.js';

export const locales: Record<string, AuthMessages> = {
	af,
	ar,
	bg,
	bn,
	ca,
	cs,
	da,
	de,
	el,
	en,
	es,
	fa,
	fi,
	fil,
	fr,
	he,
	hi,
	hr,
	hu,
	id,
	it,
	ja,
	ko,
	ms,
	nl,
	no,
	pl,
	pt,
	ro,
	ru,
	sk,
	sr,
	sv,
	sw,
	ta,
	te,
	th,
	tr,
	uk,
	ur,
	vi,
	zh,
};

export function resolveMessages(
	locale?: string,
	overrides?: Partial<AuthMessages>,
): AuthMessages {
	const lang = locale?.split('-')[0]?.toLowerCase();
	const base = (lang && locales[lang]) || en;
	return overrides ? { ...base, ...overrides } : base;
}

export function detectLocaleClient(): string {
	if (typeof navigator !== 'undefined') {
		return navigator.language?.split('-')[0] ?? 'en';
	}
	return 'en';
}

export function detectLocaleServer(request: Request): string {
	const header = request.headers.get('accept-language');
	if (!header) return 'en';
	const first = header.split(',')[0];
	return first?.split('-')[0]?.trim() ?? 'en';
}
