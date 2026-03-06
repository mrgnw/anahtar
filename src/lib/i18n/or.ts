// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const or: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'ଜାରି ରଖନ୍ତୁ',

	codeSentTo: 'ଆମେ ଏକ କୋଡ୍ ପଠାଇଛୁ',
	verifying: 'ଯାଞ୍ଚ ହେଉଛି...',
	resend: 'ପାଇନାହାନ୍ତି? ପୁଣି ପଠାନ୍ତୁ',
	differentEmail: 'ଅନ୍ୟ ଇମେଲ୍ ବ୍ୟବହାର କରନ୍ତୁ',

	passkeyCreating: 'ଆପଣଙ୍କ ପାଇଁ passkey ତିଆରି ହେଉଛି',
	passkeySubtitle: 'ଦ୍ରୁତ, ସହଜ, ନିରାପଦ ଲଗଇନ ପାଇଁ',
	passkeyAdd: 'ବର୍ତ୍ତମାନ ପାସକି ଯୋଡନ୍ତୁ',
	passkeyMaybeLater: 'ପରେ ହୋଇପାରେ',
	passkeySuccess: 'ଆପଣଙ୍କର passkey ପ୍ରସ୍ତୁତ!',

	errorInvalidEmail: 'ଦୟାକରି ଏକ ସଠିକ୍ ଇମେଲ୍ ଠିକଣା ଦିଅନ୍ତୁ।',
	errorGeneric: 'କିଛି ଭୁଲ ହୋଇଗଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
	errorResendFailed: 'କୋଡ୍ ପୁଣି ପଠାଯାଇ ପାରିଲା ନାହିଁ।',
	errorInvalidCode: 'ଭୁଲ୍ କୋଡ୍। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
	errorCodeExpired: 'କୋଡ୍ ସମୟ ସରିଗଲା। ଦୟାକରି ନୂଆ କୋଡ୍ ଅନୁରୋଧ କରନ୍ତୁ।',
	errorTooManyAttempts: 'ବହୁତ ଚେଷ୍ଟା ହୋଇଗଲା। ଦୟାକରି ନୂଆ କୋଡ୍ ଅନୁରୋଧ କରନ୍ତୁ।',
	errorInvalidInput: 'ଅବୈଧ ଇନପୁଟ୍',
	errorNotAuthenticated: 'ପ୍ରମାଣୀକୃତ ନୁହଁନ୍ତି',
	errorNotFound: 'ମିଳିଲା ନାହିଁ',
	errorAuthFailed: 'ପ୍ରମାଣୀକରଣ ବିଫଳ',
	errorPasskeyRegFailed: 'Passkey ପଞ୍ଜୀକରଣ ବିଫଳ',
	errorPasskeyNotFound: 'Passkey ମିଳିଲା ନାହିଁ',
};

export default or;
