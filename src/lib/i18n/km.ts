// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const km: AuthMessages = {
	emailPlaceholder: 'you@example.com.kh',
	continue: 'បន្ត',

	codeSentTo: 'យើងបានផ្ញើកូដទៅ',
	verifying: 'កំពុងផ្ទៀងផ្ទាត់...',
	resend: 'មិនទទួលបាន? ផ្ញើម្ដងទៀត',
	differentEmail: 'ប្រើអ៊ីមែលផ្សេង',

	passkeyCreating: 'កំពុងបង្កើត passkey សម្រាប់អ្នក',
	passkeySubtitle: 'សម្រាប់ការចូលកាន់តែងាយ',
	passkeySkip: 'រំលង',
	passkeySetup: 'បង្កើត passkey មួយ?',
	passkeyAdd: 'បន្ថែម passkey',
	passkeyMaybeLater: 'ពេលក្រោយ',
	passkeySuccess: 'អ្នកមាន passkey ហើយ!',

	errorInvalidEmail: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។',
	errorGeneric: 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្ដងទៀត។',
	errorResendFailed: 'ការផ្ញើកូដម្ដងទៀតបានបរាជ័យ។',
	errorInvalidCode: 'កូដមិនត្រឹមត្រូវ។ សូមព្យាយាមម្ដងទៀត។',
	errorCodeExpired: 'កូដផុតកំណត់ហើយ។ សូមស្នើសុំកូដថ្មី។',
	errorTooManyAttempts: 'ព្យាយាមច្រើនពេក។ សូមស្នើសុំកូដថ្មី។',
	errorInvalidInput: 'ការបញ្ចូលមិនត្រឹមត្រូវ',
	errorNotAuthenticated: 'មិនទាន់ផ្ទៀងផ្ទាត់',
	errorNotFound: 'រកមិនឃើញ',
	errorAuthFailed: 'ការផ្ទៀងផ្ទាត់បានបរាជ័យ',
	errorPasskeyRegFailed: 'ការចុះឈ្មោះ passkey បានបរាជ័យ',
	errorPasskeyNotFound: 'រកមិនឃើញ passkey',
};

export default km;
