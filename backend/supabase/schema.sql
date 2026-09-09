-- NurseLink AI: 模擬病院システム（問診票）のテーブル定義
-- Supabaseダッシュボード > SQL Editor で実行すること。

create table if not exists questionnaires (
  id text primary key,
  patient_display_id text not null,
  patient_language text not null,
  symptoms jsonb not null default '[]'::jsonb,
  free_note_original text,
  free_note_ja text,
  status text not null default 'draft' check (status in ('draft', 'confirmed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by_nurse_id text
);

-- Row Level Security を有効化する。
-- バックエンド（FastAPI）は service_role キーでアクセスするため、
-- RLSポリシーを追加しなくても service_role は素通りできる。
-- anon/authenticated ロールからの直接アクセスは、ポリシーを追加しない限り
-- デフォルトで拒否される（意図的：フロントから直接Supabaseを叩かせない）。
alter table questionnaires enable row level security;
