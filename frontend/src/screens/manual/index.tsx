import type { ComponentType, ReactNode, SVGProps } from "react";
import { Yui } from "@/components/character/Yui";
import {
  AgreeIcon,
  BrandMarkIcon,
  ConsultIcon,
  FlowArrowIcon,
  NurseCheckIcon,
  RegisterIcon,
  ShieldCheckIcon,
  SpeakIcon,
  WaitIcon
} from "./stepIcons";
import "./manual.css";

/**
 * 使い方ガイド（マニュアル）画面。
 * Claude Design モックアップ実ソース（scratchpad/nurselink/Guide.dc.html, 960×1180）を
 * 構造・文言・配色ともそのまま移植したもの。
 * - 上段：患者向け。絵記号＋英単語1語＋多言語ラベルの4ステップ（Agree / Speak / Wait / Consult）
 * - 下段：スタッフ向け。⓪→④の業務フローと3つの確認ポイント
 * 固定960px幅ではなくブレークポイントで段組みを切り替える（AGENTS.md 5章）。
 */

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface PatientStep {
  id: string;
  no: string;
  Icon: Icon;
  en: string;
  desc: string;
  langs: string;
  accent?: boolean;
}

const PATIENT_STEPS: PatientStep[] = [
  {
    id: "agree",
    no: "1",
    Icon: AgreeIcon,
    en: "Agree",
    desc: "Tap the green button to start.",
    langs: "同意する · 同意 · Đồng ý"
  },
  {
    id: "speak",
    no: "2",
    Icon: SpeakIcon,
    en: "Speak",
    desc: "Talk in your own language.",
    langs: "母国語で話す · 用母语说 · Nói"
  },
  {
    id: "wait",
    no: "3",
    Icon: WaitIcon,
    en: "Wait",
    desc: "A nurse checks your answers.",
    langs: "待つ · 等待 · Chờ"
  },
  {
    id: "consult",
    no: "4",
    Icon: ConsultIcon,
    en: "Consult",
    desc: "Yui interprets for you and the doctor.",
    langs: "診察 · 就诊 · Khám bệnh",
    accent: true
  }
];

type FlowTone = "default" | "highlight" | "dark";

interface FlowStep {
  id: string;
  symbol: string;
  title: string;
  device: string;
  desc: ReactNode;
  tone: FlowTone;
  /** モックアップ上の横幅比（②のみ 1.15 で少し広い） */
  grow: number;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "consent",
    symbol: "⓪",
    title: "同意",
    device: "患者 · スマホ",
    desc: "録音・送信への同意を取得。同意なしでは①に進めない。",
    tone: "default",
    grow: 1
  },
  {
    id: "intake",
    symbol: "①",
    title: "問診対話",
    device: "患者 · スマホ",
    desc: "母国語で音声問診。質問は事前定義テンプレートの範囲内。",
    tone: "default",
    grow: 1
  },
  {
    id: "review",
    symbol: "②",
    title: "問診票の確認",
    device: "看護師 · タブレット",
    desc: (
      <>
        対訳を見ながら修正し、確定して病院システムへ登録。
        <b>この工程は省略できない。</b>
      </>
    ),
    tone: "highlight",
    grow: 1.15
  },
  {
    id: "call",
    symbol: "③",
    title: "通訳呼び出し",
    device: "看護師 · タブレット",
    desc: "言語を選んでワンタップ起動。②の問診サマリーを引き継ぐ。",
    tone: "default",
    grow: 1
  },
  {
    id: "session",
    symbol: "④",
    title: "診察通訳",
    device: "医師・患者 · 大画面",
    desc: "双方向の字幕と音声。問診サマリーを常時表示。",
    tone: "dark",
    grow: 1
  }
];

interface GuardNote {
  id: string;
  Icon: Icon;
  title: string;
  desc: string;
}

const GUARD_NOTES: GuardNote[] = [
  {
    id: "ai-draft",
    Icon: NurseCheckIcon,
    title: "AIは下書きまで",
    desc: "症状分類と問診票は構造化データのみ。診断名・治療方針はAIから出力されません。"
  },
  {
    id: "consent-gate",
    Icon: ShieldCheckIcon,
    title: "同意なしでは始まらない",
    desc: "⓪で同意が得られない場合は問診に進まず、看護師が対面で対応します。"
  },
  {
    id: "confirm-gate",
    Icon: RegisterIcon,
    title: "確定してから登録",
    desc: "②で確定するまで、病院システムにも④の通訳画面にもデータは渡りません。"
  }
];

function PatientStepCard({ step }: { step: PatientStep }) {
  const { Icon } = step;
  return (
    <li className={`manual-step${step.accent ? " manual-step--accent" : ""}`}>
      <span className="manual-step-no" aria-hidden="true">
        {step.no}
      </span>
      <Icon className="manual-step-icon" />
      <span className="manual-step-en">{step.en}</span>
      <span className="manual-step-desc">{step.desc}</span>
      <span className="manual-step-langs">{step.langs}</span>
    </li>
  );
}

function FlowStepCard({ step, isLast }: { step: FlowStep; isLast: boolean }) {
  return (
    <li className="manual-flow-item" style={{ flexGrow: step.grow }}>
      <div className={`manual-flow-card manual-flow-card--${step.tone}`}>
        <div className="manual-flow-head">
          <span className="manual-flow-symbol">{step.symbol}</span>
          <span className="manual-flow-title">{step.title}</span>
        </div>
        <span className="manual-flow-device">{step.device}</span>
        <span className="manual-flow-desc">{step.desc}</span>
      </div>
      {!isLast && (
        <span className="manual-flow-arrow" aria-hidden="true">
          <FlowArrowIcon />
        </span>
      )}
    </li>
  );
}

export default function ManualScreen() {
  return (
    <div className="manual-screen">
      <div className="manual-page">
        <header className="manual-header">
          <Yui size={76} className="manual-header-avatar" />
          <div className="manual-header-titles">
            <h1 className="manual-header-title">使い方ガイド</h1>
            <span className="manual-header-sub">How it works · 使用方法 · Cách sử dụng · 사용 방법</span>
          </div>
          <div className="manual-brand">
            <BrandMarkIcon className="manual-brand-mark" />
            <span className="manual-brand-name">NurseLink AI</span>
          </div>
        </header>

        <section className="manual-panel" aria-labelledby="manual-patient-heading">
          <div className="manual-panel-head">
            <span className="manual-tag manual-tag--teal">患者さん / For patients</span>
            <h2 className="manual-panel-title" id="manual-patient-heading">
              4つのステップだけ
            </h2>
            <span className="manual-panel-note">Only 4 steps · 只需 4 步</span>
          </div>

          <ol className="manual-steps">
            {PATIENT_STEPS.map((step) => (
              <PatientStepCard step={step} key={step.id} />
            ))}
          </ol>

          <div className="manual-help">
            <NurseCheckIcon className="manual-help-icon" />
            <span className="manual-help-en">
              If you are unsure, tap the help button — a nurse will come to you.
            </span>
            <span className="manual-help-ja">困ったら「呼ぶ」ボタン</span>
          </div>
        </section>

        <section className="manual-panel" aria-labelledby="manual-staff-heading">
          <div className="manual-panel-head">
            <span className="manual-tag manual-tag--gray">看護師・医師</span>
            <h2 className="manual-panel-title" id="manual-staff-heading">
              業務フローと確認ポイント
            </h2>
            <span className="manual-panel-note">⓪→①は患者端末、②以降はスタッフ端末</span>
          </div>

          <ol className="manual-flow">
            {FLOW_STEPS.map((step, index) => (
              <FlowStepCard step={step} isLast={index === FLOW_STEPS.length - 1} key={step.id} />
            ))}
          </ol>

          <div className="manual-notes">
            {GUARD_NOTES.map(({ id, Icon, title, desc }) => (
              <div className="manual-note" key={id}>
                <div className="manual-note-head">
                  <Icon className="manual-note-icon" />
                  <span className="manual-note-title">{title}</span>
                </div>
                <span className="manual-note-desc">{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
