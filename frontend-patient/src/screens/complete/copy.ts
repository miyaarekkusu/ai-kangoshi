import type { LanguageCode } from "@shared/types/language";

export const COMPLETE_COPY: Record<LanguageCode, { title: string; body: string }> = {
  en: { title: "Thank you", body: "Your intake is complete. Please wait — a nurse will call you shortly." },
  ja: { title: "ありがとうございました", body: "問診が完了しました。看護師がお呼びするまで少々お待ちください。" },
  "ja-easy": { title: "ありがとうございました", body: "もんしんは おわりました。かんごしが よぶまで まっていてください。" },
  zh: { title: "谢谢", body: "问诊已完成。请稍等，护士会叫您的名字。" },
  vi: { title: "Cảm ơn bạn", body: "Quá trình hỏi bệnh đã hoàn tất. Vui lòng đợi, y tá sẽ gọi bạn sớm." },
  ko: { title: "감사합니다", body: "문진이 완료되었습니다. 간호사가 부를 때까지 잠시 기다려 주세요." },
  pt: { title: "Obrigado", body: "Sua triagem foi concluída. Aguarde, uma enfermeira irá chamá-lo em breve." }
};
