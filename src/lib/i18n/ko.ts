import type { AuthMessages } from './types.js';

const ko: AuthMessages = {
	emailPlaceholder: 'you@example.co.kr',
	continue: '계속',

	codeSentTo: '인증 코드를 보냈습니다:',
	verifying: '확인 중...',
	resend: '받지 못하셨나요? 다시 보내기',
	differentEmail: '다른 이메일 사용',

	passkeyCreating: '패스키 생성 중',
	passkeySubtitle: '더 쉬운 로그인을 위해',
	passkeySkip: '건너뛰기',
	passkeySetup: '패스키를 설정할까요?',
	passkeyAdd: '패스키 추가',
	passkeyMaybeLater: '나중에',
	passkeySuccess: '패스키가 준비되었습니다!',

	errorInvalidEmail: '유효한 이메일 주소를 입력해주세요.',
	errorGeneric: '문제가 발생했습니다. 다시 시도해주세요.',
	errorResendFailed: '코드 재전송에 실패했습니다.',
	errorInvalidCode: '잘못된 코드입니다. 다시 시도해주세요.',
	errorCodeExpired: '코드가 만료되었습니다. 새 코드를 요청해주세요.',
	errorTooManyAttempts: '시도 횟수가 너무 많습니다. 새 코드를 요청해주세요.',
	errorInvalidInput: '잘못된 입력',
	errorNotAuthenticated: '인증되지 않음',
	errorNotFound: '찾을 수 없음',
	errorAuthFailed: '인증 실패',
	errorPasskeyRegFailed: '패스키 등록 실패',
	errorPasskeyNotFound: '패스키를 찾을 수 없음',
};

export default ko;
