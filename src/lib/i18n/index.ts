import type { AuthMessages } from './types.js';
import en from './en.js';
import af from './af.js';
import ak from './ak.js';
import am from './am.js';
import ar from './ar.js';
import assamese from './as.js';
import az from './az.js';
import be from './be.js';
import bg from './bg.js';
import bn from './bn.js';
import ca from './ca.js';
import cs from './cs.js';
import da from './da.js';
import de from './de.js';
import el from './el.js';
import es from './es.js';
import fa from './fa.js';
import ff from './ff.js';
import fi from './fi.js';
import fil from './fil.js';
import fr from './fr.js';
import gu from './gu.js';
import ha from './ha.js';
import he from './he.js';
import hi from './hi.js';
import hr from './hr.js';
import ht from './ht.js';
import hu from './hu.js';
import hy from './hy.js';
import id from './id.js';
import ig from './ig.js';
import it from './it.js';
import ja from './ja.js';
import jv from './jv.js';
import kk from './kk.js';
import km from './km.js';
import kn from './kn.js';
import ko from './ko.js';
import ku from './ku.js';
import ln from './ln.js';
import lo from './lo.js';
import mg from './mg.js';
import ml from './ml.js';
import mn from './mn.js';
import mr from './mr.js';
import ms from './ms.js';
import my from './my.js';
import ne from './ne.js';
import nl from './nl.js';
import no from './no.js';
import ny from './ny.js';
import om from './om.js';
import or_ from './or.js';
import pa from './pa.js';
import pl from './pl.js';
import ps from './ps.js';
import pt from './pt.js';
import rn from './rn.js';
import ro from './ro.js';
import ru from './ru.js';
import rw from './rw.js';
import sd from './sd.js';
import si from './si.js';
import sk from './sk.js';
import so from './so.js';
import sq from './sq.js';
import sr from './sr.js';
import st from './st.js';
import su from './su.js';
import sv from './sv.js';
import sw from './sw.js';
import ta from './ta.js';
import te from './te.js';
import tg from './tg.js';
import th from './th.js';
import ti from './ti.js';
import tk from './tk.js';
import tr from './tr.js';
import ts from './ts.js';
import tt from './tt.js';
import ug from './ug.js';
import uk from './uk.js';
import ur from './ur.js';
import uz from './uz.js';
import vi from './vi.js';
import yo from './yo.js';
import zh from './zh.js';
import zu from './zu.js';

export type { AuthMessages } from './types.js';
export { default as en } from './en.js';

export const locales: Record<string, AuthMessages> = {
	af,
	ak,
	am,
	ar,
	as: assamese,
	az,
	be,
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
	ff,
	fi,
	fil,
	fr,
	gu,
	ha,
	he,
	hi,
	hr,
	ht,
	hu,
	hy,
	id,
	ig,
	it,
	ja,
	jv,
	kk,
	km,
	kn,
	ko,
	ku,
	ln,
	lo,
	mg,
	ml,
	mn,
	mr,
	ms,
	my,
	ne,
	nl,
	no,
	ny,
	om,
	or: or_,
	pa,
	pl,
	ps,
	pt,
	rn,
	ro,
	ru,
	rw,
	sd,
	si,
	sk,
	so,
	sq,
	sr,
	st,
	su,
	sv,
	sw,
	ta,
	te,
	tg,
	th,
	ti,
	tk,
	tr,
	ts,
	tt,
	ug,
	uk,
	ur,
	uz,
	vi,
	yo,
	zh,
	zu,
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
