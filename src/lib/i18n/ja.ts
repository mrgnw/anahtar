import type { AuthMessages } from './types.js';

const ja: AuthMessages = {
	emailPlaceholder: 'you@example.co.jp',
	continue: '続ける',

	codeSentTo: '確認コードを送信しました：',
	verifying: '確認中...',
	resend: '届きませんか？再送信',
	differentEmail: '別のメールアドレスを使用',

	passkeyCreating: 'パスキーを作成中',
	passkeySubtitle: 'より速く、簡単で、安全なログインのために',
	passkeyAdd: '今すぐパスキーを追加',
	passkeyMaybeLater: 'あとで',
	passkeySuccess: 'パスキーの準備ができました！',

	errorInvalidEmail: '有効なメールアドレスを入力してください。',
	errorGeneric: 'エラーが発生しました。もう一度お試しください。',
	errorResendFailed: 'コードの再送信に失敗しました。',
	errorInvalidCode: '無効なコードです。もう一度お試しください。',
	errorCodeExpired: 'コードの有効期限が切れました。新しいコードをリクエストしてください。',
	errorTooManyAttempts: '試行回数が多すぎます。新しいコードをリクエストしてください。',
	errorInvalidInput: '無効な入力',
	errorNotAuthenticated: '未認証',
	errorNotFound: '見つかりません',
	errorAuthFailed: '認証に失敗しました',
	errorPasskeyRegFailed: 'パスキーの登録に失敗しました',
	errorPasskeyNotFound: 'パスキーが見つかりません',
};

export default ja;
