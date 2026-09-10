/**
 * ⓪同意画面の多言語文言辞書。
 * 文言は Claude Design モックアップ（scratchpad/nurselink/Consent.dc.html）の英語版を
 * 正としており、他言語はその対訳。
 * 対応言語は frontend/src/types/language.ts の共有定義（LANGUAGES）を使う。
 *
 * 注: en以外はネイティブチェック未実施の機械的な翻訳。実運用前に現地話者の確認が望ましい。
 */

import { LANGUAGES, type LanguageCode } from "@shared/types/language";

export { LANGUAGES };
export type { LanguageCode };

/** 同意カード内の説明項目。tone はアイコンの配色（teal=安心系 / warm=人が確認する系）。 */
export interface ConsentPoint {
  id: "recording" | "anonymous" | "human";
  tone: "teal" | "warm";
  title: string;
  body: string;
}

interface ConsentCopy {
  /** 言語選択チップ群のアクセシブル名 */
  languageLabel: string;
  /** ユイの吹き出し1行目 */
  greeting: string;
  /** 吹き出し2行目（モックアップでは英語見出しの下に日本語を併記する） */
  greetingSub?: string;
  consentTitle: string;
  points: ConsentPoint[];
  consentCheckLabel: string;
  agreeButton: string;
  disagreeButton: string;
  footnote: string;
  submittingLabel: string;
  retryLabel: string;
  errorMessage: string;
  declinedNotice: string;
  reconsiderHint: string;
}

export const COPY: Record<LanguageCode, ConsentCopy> = {
  en: {
    languageLabel: "Choose your language",
    greeting: "Hello. I'm Yui, your AI nurse.",
    greetingSub: "こんにちは。AI看護師のユイです。",
    consentTitle: "Before we start",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "Your voice is recorded",
        body: "and sent to be translated into Japanese."
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "Kept anonymous",
        body: "No name is used. Deleted after your visit."
      },
      {
        id: "human",
        tone: "warm",
        title: "A human nurse checks it",
        body: "AI never decides anything on its own."
      }
    ],
    consentCheckLabel: "I agree to voice recording and sending.",
    agreeButton: "Agree and start",
    disagreeButton: "I do not agree — call a staff member",
    footnote:
      "Without your agreement we cannot start the interview. A nurse will help you in person instead.",
    submittingLabel: "Please wait…",
    retryLabel: "Try again",
    errorMessage: "Something went wrong while saving your consent. Please check your connection and try again.",
    declinedNotice:
      "We will not start the interview. Please let the front desk know — a nurse will help you in person.",
    reconsiderHint: 'If you change your mind, tick the box above and tap "Agree and start".'
  },
  ja: {
    languageLabel: "言語を選択してください",
    greeting: "こんにちは。AI看護師のユイです。",
    consentTitle: "はじめる前に",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "音声を録音します",
        body: "日本語に翻訳するために送信します。"
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "匿名で扱います",
        body: "お名前は使いません。受診後に削除します。"
      },
      {
        id: "human",
        tone: "warm",
        title: "看護師が必ず確認します",
        body: "AIだけで判断することはありません。"
      }
    ],
    consentCheckLabel: "音声の録音と送信に同意します。",
    agreeButton: "同意して始める",
    disagreeButton: "同意しない — スタッフを呼ぶ",
    footnote: "同意がない場合、問診を開始できません。看護師が対面でご案内します。",
    submittingLabel: "送信中…",
    retryLabel: "もう一度試す",
    errorMessage: "同意の送信中に問題が発生しました。通信環境をご確認のうえ、もう一度お試しください。",
    declinedNotice: "問診は開始しません。受付にお声がけください。看護師が対面でご案内します。",
    reconsiderHint: "気が変わった場合は、上のチェックを入れて「同意して始める」を押してください。"
  },
  "ja-easy": {
    languageLabel: "ことばを えらんでください",
    greeting: "こんにちは。わたしは AIかんごし の ユイです。",
    consentTitle: "はじめる まえに",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "こえを ろくおんします",
        body: "にほんごに ほんやくする ために おくります。"
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "なまえは つかいません",
        body: "びょういんに きたあと、けします。"
      },
      {
        id: "human",
        tone: "warm",
        title: "かんごしが かくにんします",
        body: "AIだけで きめることは ありません。"
      }
    ],
    consentCheckLabel: "こえの ろくおんと そうしんに どういします。",
    agreeButton: "どういして はじめる",
    disagreeButton: "どういしない ー スタッフを よぶ",
    footnote: "どういが ないと、もんしんを はじめられません。かんごしが ちょくせつ あんないします。",
    submittingLabel: "まって ください…",
    retryLabel: "もういちど",
    errorMessage: "どういの そうしんで もんだいが おきました。つうしんを かくにんして、もういちど ためしてください。",
    declinedNotice: "もんしんは はじめません。うけつけに つたえてください。かんごしが ちょくせつ あんないします。",
    reconsiderHint: "きもちが かわったら、うえの チェックを いれて「どういして はじめる」を おしてください。"
  },
  zh: {
    languageLabel: "请选择语言",
    greeting: "您好，我是AI护士Yui。",
    consentTitle: "开始之前",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "将录制您的声音",
        body: "并发送以翻译成日语。"
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "匿名处理",
        body: "不使用姓名。就诊后将被删除。"
      },
      {
        id: "human",
        tone: "warm",
        title: "由护士确认",
        body: "AI不会单独做出任何判断。"
      }
    ],
    consentCheckLabel: "我同意录音并发送。",
    agreeButton: "同意并开始",
    disagreeButton: "不同意 — 呼叫工作人员",
    footnote: "如果您不同意，我们将无法开始问诊。护士会为您提供面对面的帮助。",
    submittingLabel: "请稍候…",
    retryLabel: "重试",
    errorMessage: "保存同意时出现问题。请检查网络连接后重试。",
    declinedNotice: "我们不会开始问诊。请告知前台，护士会为您提供面对面的帮助。",
    reconsiderHint: "如果您改变主意，请勾选上方选项并点击「同意并开始」。"
  },
  vi: {
    languageLabel: "Vui lòng chọn ngôn ngữ",
    greeting: "Xin chào. Tôi là Yui, y tá AI của bạn.",
    consentTitle: "Trước khi bắt đầu",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "Giọng nói của bạn sẽ được ghi âm",
        body: "và gửi đi để dịch sang tiếng Nhật."
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "Được giữ ẩn danh",
        body: "Không sử dụng tên. Sẽ bị xóa sau khi khám."
      },
      {
        id: "human",
        tone: "warm",
        title: "Y tá sẽ kiểm tra",
        body: "AI không tự quyết định bất cứ điều gì."
      }
    ],
    consentCheckLabel: "Tôi đồng ý ghi âm và gửi giọng nói.",
    agreeButton: "Đồng ý và bắt đầu",
    disagreeButton: "Tôi không đồng ý — gọi nhân viên",
    footnote: "Nếu không có sự đồng ý của bạn, chúng tôi không thể bắt đầu hỏi bệnh. Y tá sẽ hỗ trợ bạn trực tiếp.",
    submittingLabel: "Vui lòng đợi…",
    retryLabel: "Thử lại",
    errorMessage: "Đã xảy ra lỗi khi lưu sự đồng ý của bạn. Vui lòng kiểm tra kết nối và thử lại.",
    declinedNotice: "Chúng tôi sẽ không bắt đầu hỏi bệnh. Vui lòng báo cho quầy lễ tân — y tá sẽ hỗ trợ bạn trực tiếp.",
    reconsiderHint: 'Nếu bạn đổi ý, hãy đánh dấu vào ô trên và nhấn "Đồng ý và bắt đầu".'
  },
  ko: {
    languageLabel: "언어를 선택해 주세요",
    greeting: "안녕하세요. AI 간호사 유이입니다.",
    consentTitle: "시작하기 전에",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "음성이 녹음됩니다",
        body: "일본어로 번역하기 위해 전송됩니다."
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "익명으로 처리됩니다",
        body: "이름은 사용하지 않습니다. 진료 후 삭제됩니다."
      },
      {
        id: "human",
        tone: "warm",
        title: "간호사가 반드시 확인합니다",
        body: "AI가 단독으로 판단하지 않습니다."
      }
    ],
    consentCheckLabel: "음성 녹음 및 전송에 동의합니다.",
    agreeButton: "동의하고 시작",
    disagreeButton: "동의하지 않음 — 직원 호출",
    footnote: "동의하지 않으시면 문진을 시작할 수 없습니다. 간호사가 직접 안내해 드립니다.",
    submittingLabel: "잠시만 기다려 주세요…",
    retryLabel: "다시 시도",
    errorMessage: "동의 저장 중 문제가 발생했습니다. 연결 상태를 확인한 후 다시 시도해 주세요.",
    declinedNotice: "문진을 시작하지 않습니다. 프런트에 말씀해 주시면 간호사가 직접 안내해 드립니다.",
    reconsiderHint: '마음이 바뀌시면 위 체크박스를 선택하고 "동의하고 시작"을 눌러주세요.'
  },
  pt: {
    languageLabel: "Selecione o idioma",
    greeting: "Olá. Eu sou a Yui, sua enfermeira de IA.",
    consentTitle: "Antes de começar",
    points: [
      {
        id: "recording",
        tone: "teal",
        title: "Sua voz será gravada",
        body: "e enviada para ser traduzida para o japonês."
      },
      {
        id: "anonymous",
        tone: "teal",
        title: "Mantido anônimo",
        body: "Nenhum nome é usado. Excluído após a consulta."
      },
      {
        id: "human",
        tone: "warm",
        title: "Uma enfermeira humana verifica",
        body: "A IA nunca decide nada sozinha."
      }
    ],
    consentCheckLabel: "Concordo com a gravação e envio da voz.",
    agreeButton: "Concordar e começar",
    disagreeButton: "Não concordo — chamar um funcionário",
    footnote: "Sem o seu consentimento, não podemos iniciar a triagem. Uma enfermeira irá ajudá-lo pessoalmente.",
    submittingLabel: "Aguarde…",
    retryLabel: "Tentar novamente",
    errorMessage: "Ocorreu um problema ao salvar seu consentimento. Verifique sua conexão e tente novamente.",
    declinedNotice: "Não iniciaremos a triagem. Avise a recepção — uma enfermeira irá ajudá-lo pessoalmente.",
    reconsiderHint: 'Se mudar de ideia, marque a caixa acima e toque em "Concordar e começar".'
  }
};
