// AI Intake & Translation Engine for NurseLink AI

export class AIIntakeEngine {
  /**
   * Analyzes dialogue history and generates a Japanese clinical intake draft + Triage rating
   */
  static analyzeDialogue(dialogueHistory, patientInfo = {}) {
    const fullText = dialogueHistory.map(d => `${d.speaker}: ${d.text} (${d.translation || ''})`).join('\n');

    let triageLevel = 'Green';
    let triageReason = '一般的な症状。急変リスクは低く、標準的な診察順序で対応可能。';
    let category = '一般内科 (General Internal Medicine)';

    const lower = fullText.toLowerCase();

    // Red condition checks
    if (lower.includes('chest') || lower.includes('dor no peito') || lower.includes('胸') || lower.includes('呼吸') || lower.includes('breath') || lower.includes('9/10') || lower.includes('10/10')) {
      triageLevel = 'Red';
      triageReason = '循環器・呼吸器系の緊急症状（胸痛・強度の呼吸困難等）。優先度高のバイタル測定および緊急医師診察が必要。';
      category = '循環器内科 / 救急科 (Cardiology / ER)';
    } else if (lower.includes('febre') || lower.includes('fever') || lower.includes('熱') || lower.includes('headache') || lower.includes('頭痛') || lower.includes('8/10') || lower.includes('7/10')) {
      triageLevel = 'Yellow';
      triageReason = '高熱および強い疼痛症状。症状の増悪リスクがあるため、早めの確認・診察を推奨。';
      category = '内科 / 神経内科 (Internal Medicine / Neurology)';
    }

    // Extract symptoms and details
    const lastPatientMsg = [...dialogueHistory].reverse().find(d => d.speaker === 'patient');

    return {
      triageLevel,
      triageReason,
      category,
      translatedForm: {
        patientName: patientInfo.name || 'カルロス・シルバ',
        age: patientInfo.age || 34,
        gender: patientInfo.gender || '男性',
        chiefComplaint: lastPatientMsg ? `${lastPatientMsg.translation} (${lastPatientMsg.text})` : '頭痛および発熱',
        onset: patientInfo.duration || '2日前より',
        painScale: patientInfo.painLevel || 8,
        allergies: patientInfo.allergies || 'ペニシリン (Penicillin)',
        medications: patientInfo.medications || 'パラセタモール (Paracetamol)',
        pastHistory: patientInfo.history || '特記事項なし',
        vitalSignsProposed: {
          bp: triageLevel === 'Red' ? '154/94' : '130/82',
          hr: triageLevel === 'Red' ? 108 : 96,
          temp: triageLevel === 'Yellow' ? '38.5°C' : '36.8°C',
          spo2: '98%'
        }
      }
    };
  }

  /**
   * Translates text between Doctor (JP) and Patient (Foreign Language)
   */
  static translateDoctorPatient(text, fromLang, toLang) {
    // High reliability medical domain translation engine simulation with intelligent contextual fallback
    const dictionary = {
      'こんにちは、お腹のどのあたりが痛みますか？': {
        'pt': 'Olá! Em qual parte da sua barriga você sente dor?',
        'en': 'Hello! Which part of your stomach hurts?',
        'zh': '您好！请问您肚子具体是哪个位置痛？',
        'es': '¡Hola! ¿En qué parte del estómago siente dolor?'
      },
      '息を大きく吸って、吐いてください。': {
        'pt': 'Respire fundo e solte o ar, por favor.',
        'en': 'Please take a deep breath in and exhale.',
        'zh': '请深呼吸，然后呼出来。',
        'es': 'Por favor, respire hondo y exhale.'
      },
      '血液検査とレントゲン撮影を行います。': {
        'pt': 'Vamos fazer um exame de sangue e um raio-X.',
        'en': 'We will perform a blood test and an X-ray.',
        'zh': '我们需要为您做血液检查和X光拍摄。',
        'es': 'Vamos a realizar un análisis de sangre y una radiografía.'
      },
      '今夜は安静にして、処方されたお薬を食後に飲んでください。': {
        'pt': 'Descanse hoje à noite e tome o remédio receitado após as refeições.',
        'en': 'Please rest tonight and take the prescribed medication after meals.',
        'zh': '请今晚好好休息，饭后按时服用处方药。',
        'es': 'Descanse esta noche y tome los medicamentos recetados después de comer.'
      }
    };

    if (dictionary[text] && dictionary[text][toLang]) {
      return dictionary[text][toLang];
    }

    // Dynamic translation mock logic
    if (fromLang === 'ja') {
      if (toLang === 'pt') return `[Tradução IA]: ${text} (Médico explicando procedimento)`;
      if (toLang === 'en') return `[AI Translation]: ${text} (Doctor explanation)`;
      if (toLang === 'zh') return `[AI翻译]: ${text} (医生说明)`;
      return `[AI Translation]: ${text}`;
    } else {
      return `[AI 日本語訳]: ${text} (患者の発話)`;
    }
  }

  /**
   * Generates HL7 FHIR standard json record format for electronic medical records (EMR/EHR)
   */
  static createFHIRRecord(intakeData) {
    return {
      resourceType: 'Encounter',
      id: `EHR-${Date.now()}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'NurseLink-AI-Intake-Module'
      },
      status: 'arrived',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: intakeData.triageLevel === 'Red' ? 'EMER' : 'AMB',
        display: intakeData.triageLevel === 'Red' ? 'emergency' : 'ambulatory'
      },
      priority: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
          code: intakeData.triageLevel === 'Red' ? 'CR' : intakeData.triageLevel === 'Yellow' ? 'UR' : 'R',
          display: intakeData.triageLevel
        }]
      },
      subject: {
        display: intakeData.translatedForm?.patientName || 'Carlos Silva'
      },
      participant: [
        {
          type: [{ coding: [{ code: 'ATND', display: 'attending' }] }],
          individual: { display: 'AI Nurse Aoi (NurseLink AI Avatar)' }
        }
      ],
      reasonCode: [
        {
          text: intakeData.translatedForm?.chiefComplaint || '主訴',
          coding: [{ display: intakeData.category }]
        }
      ]
    };
  }
}
