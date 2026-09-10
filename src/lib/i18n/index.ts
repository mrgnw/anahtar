import type { AuthMessages } from './types.js';
import en from './en.js';

export type { AuthMessages } from './types.js';
export { default as en } from './en.js';

const loaders: Record<string, () => Promise<{ default: AuthMessages }>> = {
	af: () => import('./af.js'),
	ak: () => import('./ak.js'),
	am: () => import('./am.js'),
	ar: () => import('./ar.js'),
	as: () => import('./as.js'),
	az: () => import('./az.js'),
	be: () => import('./be.js'),
	bg: () => import('./bg.js'),
	bn: () => import('./bn.js'),
	ca: () => import('./ca.js'),
	cs: () => import('./cs.js'),
	da: () => import('./da.js'),
	de: () => import('./de.js'),
	el: () => import('./el.js'),
	es: () => import('./es.js'),
	fa: () => import('./fa.js'),
	ff: () => import('./ff.js'),
	fi: () => import('./fi.js'),
	fil: () => import('./fil.js'),
	fr: () => import('./fr.js'),
	gu: () => import('./gu.js'),
	ha: () => import('./ha.js'),
	he: () => import('./he.js'),
	hi: () => import('./hi.js'),
	hr: () => import('./hr.js'),
	ht: () => import('./ht.js'),
	hu: () => import('./hu.js'),
	hy: () => import('./hy.js'),
	id: () => import('./id.js'),
	ig: () => import('./ig.js'),
	it: () => import('./it.js'),
	ja: () => import('./ja.js'),
	jv: () => import('./jv.js'),
	kk: () => import('./kk.js'),
	km: () => import('./km.js'),
	kn: () => import('./kn.js'),
	ko: () => import('./ko.js'),
	ku: () => import('./ku.js'),
	ln: () => import('./ln.js'),
	lo: () => import('./lo.js'),
	mg: () => import('./mg.js'),
	ml: () => import('./ml.js'),
	mn: () => import('./mn.js'),
	mr: () => import('./mr.js'),
	ms: () => import('./ms.js'),
	my: () => import('./my.js'),
	ne: () => import('./ne.js'),
	nl: () => import('./nl.js'),
	no: () => import('./no.js'),
	ny: () => import('./ny.js'),
	om: () => import('./om.js'),
	or: () => import('./or.js'),
	pa: () => import('./pa.js'),
	pl: () => import('./pl.js'),
	ps: () => import('./ps.js'),
	pt: () => import('./pt.js'),
	rn: () => import('./rn.js'),
	ro: () => import('./ro.js'),
	ru: () => import('./ru.js'),
	rw: () => import('./rw.js'),
	sd: () => import('./sd.js'),
	si: () => import('./si.js'),
	sk: () => import('./sk.js'),
	so: () => import('./so.js'),
	sq: () => import('./sq.js'),
	sr: () => import('./sr.js'),
	st: () => import('./st.js'),
	su: () => import('./su.js'),
	sv: () => import('./sv.js'),
	sw: () => import('./sw.js'),
	ta: () => import('./ta.js'),
	te: () => import('./te.js'),
	tg: () => import('./tg.js'),
	th: () => import('./th.js'),
	ti: () => import('./ti.js'),
	tk: () => import('./tk.js'),
	tr: () => import('./tr.js'),
	ts: () => import('./ts.js'),
	tt: () => import('./tt.js'),
	ug: () => import('./ug.js'),
	uk: () => import('./uk.js'),
	ur: () => import('./ur.js'),
	uz: () => import('./uz.js'),
	vi: () => import('./vi.js'),
	yo: () => import('./yo.js'),
	zh: () => import('./zh.js'),
	zu: () => import('./zu.js'),
};

export const localeCodes: string[] = ['en', ...Object.keys(loaders)].sort();

const loaded: Record<string, AuthMessages> = { en };

export function pick(
	table: Record<string, AuthMessages>,
	locale?: string,
	overrides?: Partial<AuthMessages>,
): AuthMessages {
	const lang = locale?.split('-')[0]?.toLowerCase();
	const base = lang && Object.hasOwn(table, lang) ? table[lang]! : en;
	return overrides ? { ...base, ...overrides } : base;
}

export function resolveMessages(
	locale?: string,
	overrides?: Partial<AuthMessages>,
): AuthMessages {
	return pick(loaded, locale, overrides);
}

export async function loadMessages(
	locale?: string,
	overrides?: Partial<AuthMessages>,
): Promise<AuthMessages> {
	const lang = locale?.split('-')[0]?.toLowerCase();
	if (lang && !Object.hasOwn(loaded, lang) && Object.hasOwn(loaders, lang)) {
		loaded[lang] = (await loaders[lang]!()).default;
	}
	return pick(loaded, locale, overrides);
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
