// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const vi: AuthMessages = {
	emailPlaceholder: 'ban@example.com',
	continue: 'Tiếp tục',

	codeSentTo: 'Mã đã được gửi tới',
	verifying: 'Đang xác minh...',
	resend: 'Chưa nhận được? Gửi lại',
	differentEmail: 'Dùng email khác',

	passkeyCreating: 'Đang tạo passkey cho bạn',
	passkeySubtitle: 'để đăng nhập dễ hơn',
	passkeySkip: 'Bỏ qua',
	passkeySetup: 'Thiết lập passkey?',
	passkeyAdd: 'Thêm passkey',
	passkeyMaybeLater: 'Để sau',
	passkeySuccess: 'Bạn đã có passkey!',

	errorInvalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ.',
	errorGeneric: 'Đã xảy ra lỗi. Vui lòng thử lại.',
	errorResendFailed: 'Gửi lại mã thất bại.',
	errorInvalidCode: 'Mã không hợp lệ. Vui lòng thử lại.',
	errorCodeExpired: 'Mã đã hết hạn. Vui lòng yêu cầu mã mới.',
	errorTooManyAttempts: 'Quá nhiều lần thử. Vui lòng yêu cầu mã mới.',
	errorInvalidInput: 'Dữ liệu không hợp lệ',
	errorNotAuthenticated: 'Chưa xác thực',
	errorNotFound: 'Không tìm thấy',
	errorAuthFailed: 'Xác thực thất bại',
	errorPasskeyRegFailed: 'Đăng ký passkey thất bại',
	errorPasskeyNotFound: 'Không tìm thấy passkey',
};

export default vi;
