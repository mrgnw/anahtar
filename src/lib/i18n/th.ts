// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const th: AuthMessages = {
	emailPlaceholder: 'you@example.co.th',
	continue: 'ดำเนินการต่อ',

	codeSentTo: 'เราส่งรหัสไปที่',
	verifying: 'กำลังตรวจสอบ...',
	resend: 'ไม่ได้รับ? ส่งอีกครั้ง',
	differentEmail: 'ใช้อีเมลอื่น',

	passkeyCreating: 'กำลังสร้าง passkey',
	passkeySubtitle: 'สำหรับการเข้าสู่ระบบที่เร็ว ง่าย และปลอดภัยยิ่งขึ้น',
	passkeyAdd: 'เพิ่ม passkey ตอนนี้',
	passkeyMaybeLater: 'ไว้ทีหลัง',
	passkeySuccess: 'สร้าง passkey เรียบร้อยแล้ว!',

	errorInvalidEmail: 'กรุณากรอกอีเมลที่ถูกต้อง',
	errorGeneric: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
	errorResendFailed: 'ส่งรหัสอีกครั้งไม่สำเร็จ',
	errorInvalidCode: 'รหัสไม่ถูกต้อง กรุณาลองอีกครั้ง',
	errorCodeExpired: 'รหัสหมดอายุ กรุณาขอรหัสใหม่',
	errorTooManyAttempts: 'ลองหลายครั้งเกินไป กรุณาขอรหัสใหม่',
	errorInvalidInput: 'ข้อมูลไม่ถูกต้อง',
	errorNotAuthenticated: 'ยังไม่ได้เข้าสู่ระบบ',
	errorNotFound: 'ไม่พบข้อมูล',
	errorAuthFailed: 'การยืนยันตัวตนล้มเหลว',
	errorPasskeyRegFailed: 'การลงทะเบียน passkey ล้มเหลว',
	errorPasskeyNotFound: 'ไม่พบ passkey',
};

export default th;
