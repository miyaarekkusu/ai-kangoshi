// NurseLink AI - Mock Data & Multi-language Translations

export const SUPPORTED_LANGUAGES = [
  { 
    id: 'pt', 
    name: 'Portuguese', 
    native: 'Português', 
    flag: '🇧🇷', 
    code: 'pt-BR',
    badge: '📱 Tablet de recepção',
    title: 'Diálogo de triagem com a IA Enfermeira',
    subtitle: 'O paciente conversa por voz no próprio idioma. A IA traduz e gera legendas em japonês em tempo real.',
    nurseName: 'AI Enfermeira Mirai',
    welcome: 'Olá! Eu sou a Mirai, sua enfermeira de IA. Pode me contar o que você está sentindo?',
    welcomeJa: 'こんにちは。AIナースのミライです。どのような症状がありますか？',
    inputPlaceholder: 'Fale ou digite sua resposta...',
    chips: [
      { label: '+ Dor de cabeça', text: 'Estou com dor de cabeça forte.' },
      { label: '+ Tontura', text: 'Sinto tontura ao me levantar.' },
      { label: '+ Nausea', text: 'Sinto enjoo e vontade de vomitar.' }
    ],
    navSubtitles: {
      intake: 'Diálogo com paciente',
      review: 'Revisão da enfermeira',
      dispatch: 'Chamar Intérprete',
      interpreter: 'Consulta traduzida',
      analytics: 'Painel administrativo'
    }
  },
  { 
    id: 'en', 
    name: 'English', 
    native: 'English', 
    flag: '🇺🇸', 
    code: 'en-US',
    badge: '📱 Reception Tablet',
    title: 'AI Nurse Triage Dialogue',
    subtitle: 'Patients converse by voice in their native language. AI translates and generates Japanese subtitles in real time.',
    nurseName: 'AI Nurse Mirai',
    welcome: 'Hello! I am Mirai, your AI Nurse. Can you tell me what symptoms you are experiencing today?',
    welcomeJa: 'こんにちは。AIナースのミライです。どのような症状がありますか？',
    inputPlaceholder: 'Speak or type your symptoms...',
    chips: [
      { label: '+ Severe Headache', text: 'I have a severe headache.' },
      { label: '+ Dizziness', text: 'I feel dizzy when standing up.' },
      { label: '+ Nausea', text: 'I feel nauseous and sick.' }
    ],
    navSubtitles: {
      intake: 'Patient Voice Intake',
      review: 'Nurse Form Review',
      dispatch: 'Call AI Interpreter',
      interpreter: 'Doctor Consultation',
      analytics: 'Admin Dashboard'
    }
  },
  { 
    id: 'es', 
    name: 'Spanish', 
    native: 'Español', 
    flag: '🇪🇸', 
    code: 'es-ES',
    badge: '📱 Tablet de recepción',
    title: 'Diálogo de triaje con la Enfermera IA',
    subtitle: 'El paciente habla por voz en su propio idioma. La IA traduce y genera subtítulos en japonés en tiempo real.',
    nurseName: 'Enfermera IA Mirai',
    welcome: '¡Hola! Soy Mirai, su enfermera de IA. ¿Puede contarme qué síntomas siente hoy?',
    welcomeJa: 'こんにちは。AIナースのミライです。どのような症状がありますか？',
    inputPlaceholder: 'Hable o escriba su respuesta...',
    chips: [
      { label: '+ Dolor de cabeza', text: 'Tengo un fuerte dolor de cabeza.' },
      { label: '+ Mareo', text: 'Siento mareos al levantarme.' },
      { label: '+ Náuseas', text: 'Siento náuseas e malestar.' }
    ],
    navSubtitles: {
      intake: 'Diálogo con paciente',
      review: 'Revisión de enfermera',
      dispatch: 'Llamar Intérprete',
      interpreter: 'Consulta traducida',
      analytics: 'Panel administrativo'
    }
  },
  { 
    id: 'zh', 
    name: 'Chinese', 
    native: '中文 (简体)', 
    flag: '🇨🇳', 
    code: 'zh-CN',
    badge: '📱 前台问诊平板',
    title: 'AI 护士多语言问诊对话',
    subtitle: '患者以母语语音交谈。AI 实时翻译并生成日语字幕。',
    nurseName: 'AI 护士 Mirai',
    welcome: '您好！我是 Mirai AI 护士。请问您今天有什么不舒服吗？',
    welcomeJa: 'こんにちは。AIナースのミライです。どのような症状がありますか？',
    inputPlaceholder: '请输入或语音说明您的症状...',
    chips: [
      { label: '+ 剧烈头痛', text: '我头痛得厉害。' },
      { label: '+ 头晕目眩', text: '我站起来时感觉头晕。' },
      { label: '+ 恶心呕吐', text: '我感觉恶心想吐。' }
    ],
    navSubtitles: {
      intake: '患者语音问诊',
      review: '护士审核确认',
      dispatch: '呼叫实时翻译',
      interpreter: '诊室双向翻译',
      analytics: '管理与日志分析'
    }
  },
  { 
    id: 'ja', 
    name: 'Japanese', 
    native: '日本語', 
    flag: '🇯🇵', 
    code: 'ja-JP',
    badge: '📱 受付用タブレット',
    title: 'AI看護師 問診対話',
    subtitle: '患者様が母国語で対話します。AIが日本語訳・字幕をリアルタイム生成します。',
    nurseName: 'AI看護師 ミライ',
    welcome: 'こんにちは。AIナースのミライです。本日の症状について教えてください。',
    welcomeJa: '',
    inputPlaceholder: '症状を話すか入力してください...',
    chips: [
      { label: '+ 激しい頭痛', text: '激しい頭痛があります。' },
      { label: '+ めまい', text: '立ち上がるとめまいがします。' },
      { label: '+ 吐き気', text: '吐き気がして胃の調子が悪いです。' }
    ],
    navSubtitles: {
      intake: '患者音声問診',
      review: '看護師問診票確認',
      dispatch: '通訳呼び出し',
      interpreter: '診察時通訳',
      analytics: '管理・ログ統計'
    }
  }
];

export const PRESET_PATIENT_SCENARIOS = [
  {
    id: 'pt-stomach',
    lang: 'pt',
    patientName: 'Carlos Silva',
    age: 34,
    gender: 'Male',
    nationality: 'Brasil',
    chiefComplaint: 'Dor de cabeça forte e febre alta',
    duration: '2 dias',
    painLevel: 8,
    allergies: 'Penicilina (Penicillin)',
    medications: 'Paracetamol',
    history: 'Nenhuma doença crônica',
    dialogueHistory: [
      { speaker: 'nurse', text: 'Olá! Eu sou a Mirai, sua enfermeira de IA. Pode me contar o que você está sentindo?', translation: 'こんにちは。AIナースのミライです。どのような症状がありますか？' },
      { speaker: 'patient', text: 'Estou com febre há dois dias e dor de garganta forte, dói para engolir.', translation: '2日前から発熱と強い喉の痛みがあり、飲み込むと痛いです。' },
      { speaker: 'nurse', text: 'Entendi. Além disso, você sente dor no corpo ou falta de ar?', translation: 'わかりました。他に体の痛みや息切れはありますか？' },
      { speaker: 'patient', text: 'Sim, o corpo dói bastante e sinto um pouco de falta de ar ao subir escadas.', translation: 'はい、体がかなり痛くて、階段を上ると少し息切れがします。' }
    ],
    aiSummary: {
      category: '内科 / 神経内科 (General Medicine / Neurology)',
      triageLevel: 'Yellow',
      triageReason: '高熱を伴う急性頭痛 (8/10)、光過敏症およびめまいの症状。髄膜炎等の鑑別が必要。',
      translatedForm: {
        patientName: 'カルロス・シルバ (Carlos Silva)',
        age: 34,
        gender: '男性',
        chiefComplaint: '昨夜からの激しい頭痛および高熱 (痛みスケール: 8/10)',
        onset: '2日前から（昨夜より増悪）',
        associatedSymptoms: ['発熱', 'めまい', '咽頭痛'],
        allergies: 'ペニシリン (Penicillin)',
        medications: 'パラセタモール（今朝服用）',
        pastHistory: '特記事項なし',
        vitalSignsProposed: { bp: '132/84', hr: 98, temp: '38.6°C', spo2: '98%' }
      }
    }
  },
  {
    id: 'en-chestpain',
    lang: 'en',
    patientName: 'Sarah Jenkins',
    age: 52,
    gender: 'Female',
    nationality: 'United States',
    chiefComplaint: 'Chest tightness and shortness of breath',
    duration: '3 hours',
    painLevel: 7,
    allergies: 'Aspirin (causes hives)',
    medications: 'Lisinopril 10mg',
    history: 'Hypertension',
    dialogueHistory: [
      { speaker: 'nurse', text: 'Hello! I am Mirai, your AI Nurse. What brings you to the hospital today?', translation: 'こんにちは、看護師のミライです。本日はどうされましたか？' },
      { speaker: 'patient', text: 'I started having chest tightness about 3 hours ago. It feels heavy, and it is hard to breathe deep.', translation: '約3時間前から胸の締め付け感があります。圧迫感があり、深呼吸がしにくいです。' },
      { speaker: 'nurse', text: 'Does the chest pain radiate to your left arm, shoulder, or jaw?', translation: '胸の痛みは左腕や肩、アゴの方に広がっていますか？' },
      { speaker: 'patient', text: 'Yes, slightly into my left shoulder. I felt cold sweat too.', translation: 'はい、少し左肩の方に広がっています。冷や汗もかきました。' }
    ],
    aiSummary: {
      category: '循環器内科 (Cardiology) - 緊急判定',
      triageLevel: 'Red',
      triageReason: '急性胸部圧迫感 (7/10)、左肩への放散痛および冷や汗。急性心筋梗塞 (AMI) / 狭心症の疑い。優先診察が必要。',
      translatedForm: {
        patientName: 'サラ・ジェンキンス (Sarah Jenkins)',
        age: 52,
        gender: '女性',
        chiefComplaint: '3時間前からの胸部圧迫感（左肩放散痛・冷汗伴う）',
        onset: '本日14:00頃〜',
        associatedSymptoms: ['呼吸困難', '左肩放散痛', '冷や汗'],
        allergies: 'アスピリン（蕁麻疹）',
        medications: 'リシノプリル (10mg/日)',
        pastHistory: '高血圧症',
        vitalSignsProposed: { bp: '158/96', hr: 104, temp: '36.7°C', spo2: '96%' }
      }
    }
  },
  {
    id: 'es-migraine',
    lang: 'es',
    patientName: 'Gonzalo Martínez',
    age: 41,
    gender: 'Male',
    nationality: 'España',
    chiefComplaint: 'Dolor de cabeza intenso y visión borrosa',
    duration: '1 día',
    painLevel: 8,
    allergies: 'Ninguna (None)',
    medications: 'Ibuprofeno',
    history: 'Migraña',
    dialogueHistory: [
      { speaker: 'nurse', text: '¡Hola! Soy Mirai, su enfermera de IA. ¿Puede contarme qué síntomas siente hoy?', translation: 'こんにちは、看護師のミライです。本日はどうされましたか？' },
      { speaker: 'patient', text: 'Tengo un dolor de cabeza muy fuerte desde ayer y me molesta la luz.', translation: '昨日から非常に激しい頭痛があり、光が眩しく感じられます。' }
    ],
    aiSummary: {
      category: '神経内科 (Neurology)',
      triageLevel: 'Yellow',
      triageReason: '片頭痛悪化および光過敏。',
      translatedForm: {
        patientName: 'ゴンザロ・マルティネス (Gonzalo Martínez)',
        age: 41,
        gender: '男性',
        chiefComplaint: '昨夜からの激しい頭痛および光過敏',
        onset: '昨日〜',
        associatedSymptoms: ['光過敏', '悪心'],
        allergies: 'なし',
        medications: 'イブプロフェン',
        pastHistory: '片頭痛',
        vitalSignsProposed: { bp: '128/82', hr: 84, temp: '36.9°C', spo2: '98%' }
      }
    }
  }
];

export const INITIAL_EHR_RECORDS = [
  {
    id: 'EHR-2026-0891',
    timestamp: '2026-09-03 16:45',
    patientId: 'P-9021',
    patientName: 'Carlos Silva',
    patientNameKana: 'カルロス・シルバ',
    lang: 'Portuguese (pt-BR)',
    triage: 'Yellow',
    status: 'Confirmed',
    department: '内科 (General Internal Medicine)',
    chiefComplaint: '昨夜からの激しい頭痛および高熱 (8/10)',
    vitals: { bp: '132/84', hr: 98, temp: '38.6°C', spo2: '98%' },
    fhirData: {
      resourceType: 'Encounter',
      id: 'EHR-2026-0891',
      status: 'arrived',
      class: { code: 'AMB', display: 'ambulatory' },
      subject: { reference: 'Patient/P-9021', display: 'Carlos Silva' },
      participant: [{ individual: { display: 'AI Nurse Mirai (NurseLink AI)' } }],
      reasonCode: [{ coding: [{ code: 'HEADACHE-FEVER', display: 'Acute severe headache with fever' }] }]
    }
  },
  {
    id: 'EHR-2026-0892',
    timestamp: '2026-09-03 17:02',
    patientId: 'P-9022',
    patientName: 'Sarah Jenkins',
    patientNameKana: 'サラ・ジェンキンス',
    lang: 'English (en-US)',
    triage: 'Red',
    status: 'Confirmed',
    department: '循環器内科 (Cardiology)',
    chiefComplaint: '3時間前からの胸部圧迫感（左肩放散痛伴う）',
    vitals: { bp: '158/96', hr: 104, temp: '36.7°C', spo2: '96%' },
    fhirData: {
      resourceType: 'Encounter',
      id: 'EHR-2026-0892',
      status: 'arrived',
      class: { code: 'EMER', display: 'emergency' },
      subject: { reference: 'Patient/P-9022', display: 'Sarah Jenkins' },
      participant: [{ individual: { display: 'AI Nurse Mirai (NurseLink AI)' } }],
      reasonCode: [{ coding: [{ code: 'CHEST-PAIN-ACUTE', display: 'Acute chest pain with radiation' }] }]
    }
  }
];

export const MOCK_STATISTICS = {
  totalIntakesToday: 24,
  timeSavedMinutesPerPatient: 18.5,
  totalHoursSavedMonth: 142.5,
  nurseEditRatePercent: 12.5,
  languageBreakdown: [
    { lang: 'English', count: 9, percent: 37.5, flag: '🇺🇸' },
    { lang: 'Chinese', count: 6, percent: 25.0, flag: '🇨🇳' },
    { lang: 'Portuguese', count: 4, percent: 16.7, flag: '🇧🇷' },
    { lang: 'Spanish', count: 3, percent: 12.5, flag: '🇪🇸' },
    { lang: 'Tagalog / Vietnamese', count: 2, percent: 8.3, flag: '🇵🇭' }
  ],
  triageBreakdown: { red: 3, yellow: 8, green: 13 },
  riskPreventionCount: 7
};
