// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const lo: AuthMessages = {
	emailPlaceholder: 'you@example.la',
	continue: 'ດຳເນີນຕໍ່',

	codeSentTo: 'ພວກເຮົາໄດ້ສົ່ງລະຫັດໄປຫາ',
	verifying: 'ກຳລັງກວດສອບ...',
	resend: 'ບໍ່ໄດ້ຮັບບໍ? ສົ່ງໃໝ່',
	differentEmail: 'ໃຊ້ອີເມວອື່ນ',

	passkeyCreating: 'ກຳລັງສ້າງ passkey ໃຫ້ທ່ານ',
	passkeySubtitle: 'ເພື່ອເຂົ້າລະບົບງ່າຍຂຶ້ນ',
	passkeySkip: 'ຂ້າມ',
	passkeySetup: 'ຕັ້ງຄ່າ passkey ບໍ?',
	passkeyAdd: 'ເພີ່ມ passkey',
	passkeyMaybeLater: 'ໄວ້ທີຫຼັງ',
	passkeySuccess: 'ທ່ານມີ passkey ແລ້ວ!',

	errorInvalidEmail: 'ກະລຸນາປ້ອນທີ່ຢູ່ອີເມວທີ່ຖືກຕ້ອງ.',
	errorGeneric: 'ມີບາງຢ່າງຜິດພາດ. ກະລຸນາລອງໃໝ່.',
	errorResendFailed: 'ສົ່ງລະຫັດໃໝ່ບໍ່ສຳເລັດ.',
	errorInvalidCode: 'ລະຫັດບໍ່ຖືກຕ້ອງ. ກະລຸນາລອງໃໝ່.',
	errorCodeExpired: 'ລະຫັດໝົດອາຍຸແລ້ວ. ກະລຸນາຂໍລະຫັດໃໝ່.',
	errorTooManyAttempts: 'ລອງຫຼາຍເກີນໄປ. ກະລຸນາຂໍລະຫັດໃໝ່.',
	errorInvalidInput: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ',
	errorNotAuthenticated: 'ຍັງບໍ່ໄດ້ຢືນຢັນຕົວຕົນ',
	errorNotFound: 'ບໍ່ພົບ',
	errorAuthFailed: 'ການຢືນຢັນຕົວຕົນລົ້ມເຫຼວ',
	errorPasskeyRegFailed: 'ການລົງທະບຽນ passkey ລົ້ມເຫຼວ',
	errorPasskeyNotFound: 'ບໍ່ພົບ passkey',
};

export default lo;
