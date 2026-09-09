/**
 * ①問診対話画面のUI文言辞書（質問文そのものはバックエンド
 * backend/app/routers/intake.py の QUESTION_TEMPLATES から取得する。ここは
 * ボタンラベル等の画面チrome文言のみ）。対応言語は frontend/src/types/language.ts
 * の共有定義（LANGUAGES）と合わせている。
 *
 * 注: en/ja以外はネイティブチェック未実施の機械的な翻訳。
 */

import type { LanguageCode } from "@/types/language";

export interface IntakeUiCopy {
  preparing: string;
  retry: string;
  goBack: string;
  yuiListening: string;
  yuiSpeaking: string;
  orTapAnswer: string;
  tapAlsoWorks: string;
  japaneseTag: string;
  dismiss: string;
  sending: string;
  sentTranslated: string;
  typeLabel: string;
  skipLabel: string;
  skipTitle: string;
  micAriaLabel: string;
  tapAndType: string;
  placeholderType: string;
  back: string;
  send: string;
  sendingEllipsis: string;
  approxMinutes: string;
  connectionError: string;
}

export const UI_COPY: Record<LanguageCode, IntakeUiCopy> = {
  en: {
    preparing: "Preparing your intake…",
    retry: "Retry",
    goBack: "Go back",
    yuiListening: "Yui is listening",
    yuiSpeaking: "Yui is speaking",
    orTapAnswer: "Or tap an answer",
    tapAlsoWorks: "You can also just tap",
    japaneseTag: "Japanese",
    dismiss: "Dismiss",
    sending: "Sending",
    sentTranslated: "Sent · translated to Japanese",
    typeLabel: "Type",
    skipLabel: "Skip",
    skipTitle: "Skip is not available yet",
    micAriaLabel: "Tap to answer",
    tapAndType: "Tap and type in your language",
    placeholderType: "Type your answer here",
    back: "Back",
    send: "Send",
    sendingEllipsis: "Sending…",
    approxMinutes: "~2 min",
    connectionError: "Connection failed. Please check your network and try again."
  },
  ja: {
    preparing: "問診を準備しています…",
    retry: "再試行",
    goBack: "前の画面に戻る",
    yuiListening: "ユイが聞いています",
    yuiSpeaking: "ユイが話しています",
    orTapAnswer: "選んで回答",
    tapAlsoWorks: "タップでも回答できます",
    japaneseTag: "日本語",
    dismiss: "閉じる",
    sending: "送信中",
    sentTranslated: "送信済み",
    typeLabel: "入力",
    skipLabel: "スキップ",
    skipTitle: "この質問はスキップできません",
    micAriaLabel: "タップして回答する",
    tapAndType: "タップして入力できます",
    placeholderType: "ここに入力してください",
    back: "戻る",
    send: "送信",
    sendingEllipsis: "送信中…",
    approxMinutes: "約2分",
    connectionError: "通信がうまくいきませんでした。電波の良い場所でもう一度お試しください。"
  },
  "ja-easy": {
    preparing: "じゅんびを しています…",
    retry: "もういちど",
    goBack: "まえの がめんに もどる",
    yuiListening: "ユイが きいています",
    yuiSpeaking: "ユイが はなしています",
    orTapAnswer: "えらんで こたえる",
    tapAlsoWorks: "タップしても こたえられます",
    japaneseTag: "にほんご",
    dismiss: "とじる",
    sending: "そうしんちゅう",
    sentTranslated: "そうしんしました",
    typeLabel: "にゅうりょく",
    skipLabel: "とばす",
    skipTitle: "この しつもんは とばせません",
    micAriaLabel: "タップして こたえる",
    tapAndType: "タップして にゅうりょくできます",
    placeholderType: "ここに にゅうりょく してください",
    back: "もどる",
    send: "そうしん",
    sendingEllipsis: "そうしんちゅう…",
    approxMinutes: "やく2ふん",
    connectionError: "つうしんが うまく いきませんでした。でんぱの よい ばしょで もういちど ためしてください。"
  },
  zh: {
    preparing: "正在准备问诊…",
    retry: "重试",
    goBack: "返回上一页",
    yuiListening: "Yui正在倾听",
    yuiSpeaking: "Yui正在说话",
    orTapAnswer: "或点击回答",
    tapAlsoWorks: "也可以直接点击回答",
    japaneseTag: "日语",
    dismiss: "关闭",
    sending: "发送中",
    sentTranslated: "已发送 · 已翻译成日语",
    typeLabel: "输入",
    skipLabel: "跳过",
    skipTitle: "此问题暂不支持跳过",
    micAriaLabel: "点击回答",
    tapAndType: "点击后可用您的语言输入",
    placeholderType: "请在此输入",
    back: "返回",
    send: "发送",
    sendingEllipsis: "发送中…",
    approxMinutes: "约2分钟",
    connectionError: "连接失败。请检查网络后重试。"
  },
  vi: {
    preparing: "Đang chuẩn bị hỏi bệnh…",
    retry: "Thử lại",
    goBack: "Quay lại",
    yuiListening: "Yui đang lắng nghe",
    yuiSpeaking: "Yui đang nói",
    orTapAnswer: "Hoặc chạm để trả lời",
    tapAlsoWorks: "Bạn cũng có thể chạm để trả lời",
    japaneseTag: "Tiếng Nhật",
    dismiss: "Đóng",
    sending: "Đang gửi",
    sentTranslated: "Đã gửi · đã dịch sang tiếng Nhật",
    typeLabel: "Nhập",
    skipLabel: "Bỏ qua",
    skipTitle: "Chưa thể bỏ qua câu hỏi này",
    micAriaLabel: "Chạm để trả lời",
    tapAndType: "Chạm và nhập bằng ngôn ngữ của bạn",
    placeholderType: "Nhập câu trả lời tại đây",
    back: "Quay lại",
    send: "Gửi",
    sendingEllipsis: "Đang gửi…",
    approxMinutes: "~2 phút",
    connectionError: "Kết nối thất bại. Vui lòng kiểm tra mạng và thử lại."
  },
  ko: {
    preparing: "문진을 준비하고 있습니다…",
    retry: "다시 시도",
    goBack: "이전 화면으로",
    yuiListening: "유이가 듣고 있습니다",
    yuiSpeaking: "유이가 말하고 있습니다",
    orTapAnswer: "또는 탭하여 답변",
    tapAlsoWorks: "탭해서 답변할 수도 있습니다",
    japaneseTag: "일본어",
    dismiss: "닫기",
    sending: "전송 중",
    sentTranslated: "전송됨 · 일본어로 번역됨",
    typeLabel: "입력",
    skipLabel: "건너뛰기",
    skipTitle: "이 질문은 아직 건너뛸 수 없습니다",
    micAriaLabel: "탭하여 답변하기",
    tapAndType: "탭해서 원하는 언어로 입력할 수 있습니다",
    placeholderType: "여기에 입력해 주세요",
    back: "뒤로",
    send: "전송",
    sendingEllipsis: "전송 중…",
    approxMinutes: "약 2분",
    connectionError: "연결에 실패했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요."
  },
  pt: {
    preparing: "Preparando sua triagem…",
    retry: "Tentar novamente",
    goBack: "Voltar",
    yuiListening: "Yui está ouvindo",
    yuiSpeaking: "Yui está falando",
    orTapAnswer: "Ou toque para responder",
    tapAlsoWorks: "Você também pode tocar para responder",
    japaneseTag: "Japonês",
    dismiss: "Fechar",
    sending: "Enviando",
    sentTranslated: "Enviado · traduzido para o japonês",
    typeLabel: "Digitar",
    skipLabel: "Pular",
    skipTitle: "Ainda não é possível pular esta pergunta",
    micAriaLabel: "Toque para responder",
    tapAndType: "Toque e digite no seu idioma",
    placeholderType: "Digite sua resposta aqui",
    back: "Voltar",
    send: "Enviar",
    sendingEllipsis: "Enviando…",
    approxMinutes: "~2 min",
    connectionError: "Falha na conexão. Verifique sua rede e tente novamente."
  }
};

export interface SymptomCategoryOption {
  id: string;
  label: Record<LanguageCode, string>;
  phrase: Record<LanguageCode, string>;
}

export const SYMPTOM_CATEGORIES: SymptomCategoryOption[] = [
  {
    id: "fever",
    label: { en: "Fever", ja: "発熱", "ja-easy": "ねつ", zh: "发热", vi: "Sốt", ko: "발열", pt: "Febre" },
    phrase: {
      en: "I have a fever.",
      ja: "熱があります。",
      "ja-easy": "ねつが あります。",
      zh: "我发烧了。",
      vi: "Tôi bị sốt.",
      ko: "열이 있어요.",
      pt: "Estou com febre."
    }
  },
  {
    id: "headache",
    label: {
      en: "Headache",
      ja: "頭痛",
      "ja-easy": "あたまが いたい",
      zh: "头痛",
      vi: "Đau đầu",
      ko: "두통",
      pt: "Dor de cabeça"
    },
    phrase: {
      en: "I have a headache.",
      ja: "頭が痛いです。",
      "ja-easy": "あたまが いたいです。",
      zh: "我头痛。",
      vi: "Tôi bị đau đầu.",
      ko: "머리가 아파요.",
      pt: "Estou com dor de cabeça."
    }
  },
  {
    id: "abdominal_pain",
    label: {
      en: "Stomach pain",
      ja: "腹痛",
      "ja-easy": "おなかが いたい",
      zh: "腹痛",
      vi: "Đau bụng",
      ko: "복통",
      pt: "Dor de estômago"
    },
    phrase: {
      en: "I have a stomach ache.",
      ja: "お腹が痛いです。",
      "ja-easy": "おなかが いたいです。",
      zh: "我肚子痛。",
      vi: "Tôi bị đau bụng.",
      ko: "배가 아파요.",
      pt: "Estou com dor de estômago."
    }
  },
  {
    id: "other",
    label: { en: "Other", ja: "その他", "ja-easy": "その他", zh: "其他", vi: "Khác", ko: "기타", pt: "Outro" },
    phrase: { en: "", ja: "", "ja-easy": "", zh: "", vi: "", ko: "", pt: "" }
  }
];
