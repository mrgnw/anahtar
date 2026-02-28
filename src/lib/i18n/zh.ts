import type { AuthMessages } from './types.js';

const zh: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: '继续',

	codeSentTo: '验证码已发送至',
	verifying: '验证中...',
	resend: '没收到？重新发送',
	differentEmail: '使用其他邮箱',

	passkeyCreating: '正在创建通行密钥',
	passkeySubtitle: '更便捷的登录方式',
	passkeySkip: '跳过',
	passkeySetup: '设置通行密钥？',
	passkeyAdd: '添加通行密钥',
	passkeyMaybeLater: '以后再说',
	passkeySuccess: '通行密钥已就绪！',

	errorInvalidEmail: '请输入有效的电子邮箱地址。',
	errorGeneric: '出了点问题，请重试。',
	errorResendFailed: '重新发送失败。',
	errorInvalidCode: '验证码无效，请重试。',
	errorCodeExpired: '验证码已过期，请重新获取。',
	errorTooManyAttempts: '尝试次数过多，请重新获取验证码。',
	errorInvalidInput: '输入无效',
	errorNotAuthenticated: '未登录',
	errorNotFound: '未找到',
	errorAuthFailed: '身份验证失败',
	errorPasskeyRegFailed: '通行密钥注册失败',
	errorPasskeyNotFound: '未找到通行密钥',
};

export default zh;
