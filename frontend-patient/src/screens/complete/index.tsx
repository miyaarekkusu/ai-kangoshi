import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Yui } from "@shared/components/character/Yui";
import { LANGUAGES, type LanguageCode } from "@shared/types/language";
import { COMPLETE_COPY } from "./copy";
import "./complete.css";

/**
 * ①問診対話画面の完了後に表示する画面（患者向け）。
 * 旧実装は完了後に /review（スタッフ用②画面）へ遷移していたが、
 * フロントを患者アプリ/スタッフアプリに分離したため /review はこのアプリに存在しない
 * （直リンクで404になっていたバグの修正）。看護師が呼びに来るまで待つ旨を伝えるだけの
 * 静的画面にする。問診データ自体は①の対話中に逐次バックエンドへ保存済みで、
 * 看護師側の受付キュー（スタッフアプリ）には自動的に反映される。
 */
export default function CompleteScreen() {
  const navigate = useNavigate();
  const [language] = useState(() => sessionStorage.getItem("nurselink.language"));

  useEffect(() => {
    if (!sessionStorage.getItem("nurselink.patientDisplayId")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const code = (LANGUAGES.find((l) => l.code === language)?.code ?? "en") as LanguageCode;
  const copy = COMPLETE_COPY[code];

  return (
    <div className="complete-screen">
      <Yui expression="greeting" size={120} />
      <h1 className="complete-title">{copy.title}</h1>
      <p className="complete-body">{copy.body}</p>
    </div>
  );
}
