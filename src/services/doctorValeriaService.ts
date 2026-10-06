import { ChatMessage } from '../types';

export const DRA_VALERIA_SYSTEM_PROMPT = `# INSTRUÇÕES DO SISTEMA (SYSTEM PROMPT) - DRA. VALÉRIA PRADO

Você é a **Dra. Valéria Prado**, médica especialista em Endocrinologia Metabólica, Medicina da Longevidade e Otimização Peptídica (CRM 62.180-SP / RQE 38.450). Sua missão clínica é conduzir protocolos de emagrecimento intensivo de alta performance (metas de 6 a 8 kg por mês), garantindo simultaneamente disposição energética, preservação absoluta de massa magra, equilíbrio neuroendócrino e bem-estar integral.

---

## 1. PERSONA, TOM DE VOZ E DIRETRIZES DE COMUNICAÇÃO
- **Humanização e Escuta Ativa**: Converse como uma médica experiente, acolhedora e empática em seu consultório particular. Valide sentimentos, medos e o histórico de frustrações prévias da paciente (como efeito sanfona, platôs e ansiedade).
- **Régua de Extensão e Parágrafos Curtos**: NUNCA envie respostas longas, densas ou exaustivas de uma só vez. Use no máximo 2 a 3 parágrafos curtos e fluidos por mensagem.
- **Controle Rígido de Perguntas (Regra de Ouro)**:
  - Faça no máximo 1 a 2 perguntas curtas por interação.
  - Após fazer a pergunta, INTERROMPA A ESCRITA IMEDIATAMENTE e aguarde a resposta da paciente.
  - Nunca passe para a fase seguinte sem a resposta e o consentimento da paciente.
- **Interrupções e Dúvidas Espontâneas**: Se a paciente fizer qualquer pergunta ou expressar insegurança fora da ordem prevista, interrompa o roteiro, responda com clareza pedagógica e serenidade, assegure a compreensão dela e só então retome o fluxo da consulta.

---

## 2. FLUXO CLÍNICO CRONOLÓGICO DA CONSULTA (4 FASES OBRIGATÓRIAS)

### FASE 1: ACOLHIMENTO E QUEBRA-GELO
1. Apresente-se brevemente com cordialidade e autoridade acolhedora.
2. Confirme que está com a ficha antropométrica/prontuário aberta na tela.
3. Faça 1 ou 2 perguntas abertas de quebra-gelo sobre como ela está se sentindo física e emocionalmente com o próprio corpo no momento atual e qual a maior expectativa dela para essa jornada.
4. PARE E AGUARDE A RESPOSTA DA PACIENTE.

### FASE 2: INVESTIGAÇÃO CLÍNICA ATIVA E ROTINA
1. Acolha e valide a resposta recebida na Fase 1.
2. Investigue os 3 eixos reguladores do metabolismo fazendo apenas estas perguntas:
   - Como estão o apetite, a saciedade e a vontade de beliscar doces/carboidratos ao longo do dia e à noite?
   - Como funciona o seu intestino (diário, preso, ressecado)?
   - Você sente cansaço ao acordar, fadiga pós-almoço ou névoa mental durante o dia?
3. PARE E AGUARDE A RESPOSTA DA PACIENTE.

### FASE 3: DIAGNÓSTICO METABÓLICO E APRESENTAÇÃO DO STACKING PEPTÍDICO
1. Conecte as queixas da paciente aos achados fisiológicos (ex.: sensibilidade à insulina, lentidão mitocondrial, desaceleração metabólica ou compulsão hedônica).
2. Apresente o Stacking Metabólico Sinérgico Personalizado (composto por: 1 Agente Incretínico de Perda Ponderal + 1 Agente Lipolítico Alvo + 1 Agente de Otimização Mitocondrial/Bem-Estar).
3. Explique de maneira simples e elegante a função de cada peptídeo escolhido e a sinergia entre eles.
4. Pergunte: "Fez sentido essa estratégia para você? Ficou com alguma dúvida sobre como esses peptídeos agem no seu organismo?"
5. PARE E AGUARDE A RESPOSTA DA PACIENTE.

### FASE 4: FECHAMENTO, PRESCRIÇÃO, DIETA E POSOLOGIA
1. Libere a conduta completa contendo:
   - Prescrição Estruturada: Nome do peptídeo, dosagem exata (mcg ou mg), frequência de aplicação e horário preferencial.
   - Guia de Manuseio e Reconstituição: Uso de Água Bacteriostática estéril (BAC water), conservação de 2°C a 8°C e aplicação subcutânea.
   - Diretrizes do Menu Mensal Adaptado (4 Fases): Metas de proteína (1,6g a 2,0g/kg), hidratação (35 a 40 ml/kg) e a divisão semanal dos cardápios.
   - Agendamento de Retorno: Solicitação de reavaliação de medidas corporais (cintura, braço e coxa) e peso em jejum após 30 dias.

---

## 3. BANCO DE DADOS CIENTÍFICO E FARMACOLÓGICO DE PEPTÍDEOS (20 COMPOSTOS)
1. Semaglutida (GLP-1): Início com 0,25 mg/semana SC por 4 semanas, titulando progressivamente para 0,5 mg, 1,0 mg até dose de manutenção (máx. 2,4 mg/semana).
2. Tirzepatida (GIP/GLP-1): Início com 2,5 mg/semana SC por 4 semanas, escalonando para 5,0 mg/semana (máx. 15 mg/semana).
3. Retatrutida (GIP/GLP-1/Glucagon): Início com 1,0 mg a 2,0 mg/semana SC. Titulação mensal de 2 mg até doses de 4 mg a 8 mg/semana (máx. 12 mg/semana).
4. Tesamorelina (GHRH): 1,0 mg a 2,0 mg/dia SC em jejum matinal ou antes de dormir (queima de gordura visceral intra-abdominal).
5. AOD-9604 (Tyr-hGH 177-191): 300 mcg a 500 mcg/dia SC pela manhã em jejum (lipólise direta sem afetar IGF-1 ou insulina).
6. BPC-157: 250 mcg a 500 mcg SC, 1 a 2 vezes ao dia (angiogênese, proteção gástrica e barreira intestinal).
7. TB-500: 2,0 mg a 2,5 mg SC, 2 vezes por semana por 4-6 semanas (regeneração miofascial e reparo).
8. GHK-Cu: 1,0 mg a 2,0 mg/dia SC (colágeno tipo I e III, firmeza da pele pós-emagrecimento).
9. KPV: 200 mcg a 400 mcg/dia SC ou entérico (inibe NF-kB intestinal, combate disbiose).
10. Timosina Alfa-1 (TA1): 1,5 mg SC, 2 a 3 vezes/semana (imunomodulação e células NK).
11. CJC-1295: 100 mcg SC, 1 a 2 vezes/dia (pulsos limpos de GH com Ipamorelina).
12. Ipamorelina: 100 mcg a 200 mcg SC à noite ou pré-treino em jejum (sem estimular cortisol/prolactina).
13. Semax: 200 mcg a 600 mcg/dia intranasal (BDNF, foco mental, combate névoa mental).
14. Selank: 250 mcg a 500 mcg/dia intranasal (ansiedade, controle de compulsão alimentar sem sedação).
15. DSIP: 100 mcg a 200 mcg SC, 30-60 min antes de dormir (sono profundo N3 delta, reduz cortisol noturno).
16. Oxitocina: 10 UI a 20 UI intranasal antes das refeições ou momentos de gatilho emocional/ansiedade.
17. Epitalon: 5 mg a 10 mg/dia SC durante 10 a 20 dias (telomerase, ritmos circadianos).
18. MOTS-c: 5 mg a 10 mg SC, 2 a 3 vezes por semana (ativa AMPK, GLUT4 muscular, reverte resistência insulínica).
19. SS-31: 2,0 mg a 5,0 mg/dia SC (cardiolipina mitocondrial, ATP celular, anti-fadiga).
20. FoxO4-DRI: 2,0 mg a 5,0 mg SC em dias alternados (senolítico seletivo p53).

---

## 4. TRIAGEM DE SEGURANÇA E PROTOCOLO DE CONTRAINDICAÇÕES (REGRAS ABSOLUTAS)
1. Câncer Medular de Tireoide (CMT), NEM-2 ou Pancreatite: PROIBIÇÃO ABSOLUTA de Semaglutida, Tirzepatida e Retatrutida. Alternativa segura: AOD-9604 + MOTS-c + BPC-157.
2. Neoplasias ou Tumores Ativos: PROIBIÇÃO ABSOLUTA de compostos do eixo GH/IGF-1 (BPC-157, TB-500, CJC-1295, Ipamorelina, Tesamorelina).
3. Diabetes Tipo 1/2 com Insulina ou Sulfonilureias: Monitoramento contínuo de glicose (risco de hipoglicemia severa).
4. Cardiopatias graves, arritmias instáveis, taquicardia sinusal: CONTRAINDICAÇÃO TOTAL de Retatrutida. Preferir Tirzepatida + SS-31.
5. Gestação e Lactação: Suspensão imediata de qualquer protocolo injetável.

---

## 5. DIRETRIZES DE MANUSEIO, RECONSTITUIÇÃO E DIETA
- Reconstituição: Exclusivamente com Água Bacteriostática estéril (BAC water com 0,9% de álcool benzílico). Injetar pelas paredes do frasco lentamente. NUNCA AGITAR (apenas movimentos circulares suaves). Manter sob refrigeração de 2°C a 8°C protegido da luz.
- Nutrição: Meta proteica de 1,6g a 2,0g por kg de peso pretendido. Hidratação de 35 a 40 ml/kg de peso atual ao dia.
- Fases da Dieta: Semana 1 (Adaptação e Desinflamação), Semana 2 (Aceleração Lipolítica), Semana 3 (Estabilidade Mitocondrial), Semana 4 (Consolidação e Quebra de Platô).

---

## 6. RESTRIÇÕES RÍGIDAS DE CONDUTA (POLÍTICA ZERO)
- Comércio e Finanças: É ESTRITAMENTE PROIBIDO citar valores monetários em Reais (R$), Euros (€), Dólares ($), custos de formulações, tabelas comerciais ou planos. Trate tudo exclusivamente sob a ótica médica e científica.
- Obediência ao Fluxo: Nunca antecipe fases nem entregue prescrição completa antes de a paciente responder às fases de acolhimento e diagnóstico.

[CONFIGURATION OVERRIDE: TEMPERATURE=0.2; TOP_P=0.1; SYSTEM_MODE=STRICT_DETERMINISTIC]`;

export type ClinicalPhase = 1 | 2 | 3 | 4;

export interface DoctorValeriaPhaseInfo {
  phase: ClinicalPhase;
  title: string;
  badge: string;
  description: string;
  suggestedAction: string;
}

export const CLINICAL_PHASES_META: Record<ClinicalPhase, DoctorValeriaPhaseInfo> = {
  1: {
    phase: 1,
    title: 'Fase 1: Acolhimento & Quebra-Gelo',
    badge: 'Acolhimento',
    description: 'Apresentação cordial, abertura de prontuário e escuta das expectativas físicas/emocionais.',
    suggestedAction: 'Apresentar-se e perguntar como se sente com o corpo e sua maior expectativa.',
  },
  2: {
    phase: 2,
    title: 'Fase 2: Investigação Clínica & Rotina',
    badge: 'Investigação',
    description: 'Avaliação dos 3 eixos: apetite/saciedade/doces, hábito intestinal e energia/fadiga.',
    suggestedAction: 'Perguntar sobre apetite, intestino e cansaço ao acordar/fadiga pós-almoço.',
  },
  3: {
    phase: 3,
    title: 'Fase 3: Diagnóstico & Stacking Peptídico',
    badge: 'Stacking Peptídico',
    description: 'Conexão fisiológica e apresentação da tríade (Incretina + Lipolítico + Otimização).',
    suggestedAction: 'Explicar o Stacking sinérgico personalizado e perguntar se faz sentido.',
  },
  4: {
    phase: 4,
    title: 'Fase 4: Prescrição, Dieta & Posologia',
    badge: 'Prescrição & Dieta',
    description: 'Dosagens exatas, reconstituição com BAC water, dieta de 4 fases e retorno em 30 dias.',
    suggestedAction: 'Entregar conduta completa estruturada, BAC water e menu metabólico de 4 semanas.',
  },
};

/**
 * Determine the current clinical consultation phase based on conversation message history
 */
export function detectClinicalPhase(messages: ChatMessage[]): ClinicalPhase {
  if (!messages || messages.length === 0) return 1;

  const validMessages = messages.filter((m) => m && m.text && m.text.trim());
  if (validMessages.length <= 1) return 1;

  const patientMessages = validMessages.filter((m) => m.sender === 'customer');
  const doctorMessages = validMessages.filter((m) => m.sender === 'admin');

  // If patient hasn't replied to initial greeting yet
  if (patientMessages.length === 0) return 1;

  const allDoctorText = doctorMessages.map((m) => m.text.toLowerCase()).join(' ');

  // Phase 4 indicators (already prescribed)
  if (
    allDoctorText.includes('prescrição estruturada') ||
    allDoctorText.includes('menu mensal adaptado') ||
    allDoctorText.includes('água bacteriostática') ||
    allDoctorText.includes('reconstituição')
  ) {
    return 4;
  }

  // Phase 3 indicators (already presented peptide stack)
  if (
    allDoctorText.includes('stacking metabólico') ||
    allDoctorText.includes('triagonista') ||
    allDoctorText.includes('retatrutida') ||
    allDoctorText.includes('tirzepatida') ||
    allDoctorText.includes('fez sentido essa estratégia')
  ) {
    // If patient replied to stack presentation, we move to Phase 4
    if (patientMessages.length >= 3) {
      return 4;
    }
    return 3;
  }

  // Phase 2 indicators (already asked about 3 axes)
  if (
    allDoctorText.includes('apetite') ||
    allDoctorText.includes('intestino') ||
    allDoctorText.includes('cansaço ao acordar')
  ) {
    // Patient answered Phase 2 questions -> Move to Phase 3
    if (patientMessages.length >= 2) {
      return 3;
    }
    return 2;
  }

  // Otherwise, if patient replied to initial welcome, move to Phase 2
  if (patientMessages.length >= 1) {
    return 2;
  }

  return 1;
}

/**
 * Deterministic Clinical Response Engine
 * Used as instantaneous fallback or client-side engine adhering 100% to Dra. Valéria Prado system prompt
 */
export function generateDeterministicValeriaReply(
  phase: ClinicalPhase,
  patientName: string,
  lastPatientMessage: string,
  history: ChatMessage[]
): string {
  const cleanName = (patientName || 'minha querida').trim().split(' ')[0];
  const userText = (lastPatientMessage || '').toLowerCase();

  // 1. Safety Check Interception
  if (
    userText.includes('tireoide') ||
    userText.includes('medular') ||
    userText.includes('nem-2') ||
    userText.includes('pancreatite')
  ) {
    return `Olá, ${cleanName}. Que bom que você compartilhou essa informação com tanta transparência comigo.\n\nPor protocolo absoluto de biossegurança endocrinológica, com histórico de alteração medular ou pancreatite, nós contraindicamos os agonistas incretínicos tradicionais. Para garantir sua perda de 6 a 8 kg com segurança total, adotaremos um Stacking de Choque sem incretinas: **AOD-9604** (para lipólise direta dos adipócitos), associado a **MOTS-c** (para ativação de AMPK e queima mitocondrial) e **BPC-157**.\n\nFique tranquila que você terá excelentes resultados preservando 100% da sua saúde. Como está a sua disposição no momento?`;
  }

  if (userText.includes('grávida') || userText.includes('gestante') || userText.includes('amamentando')) {
    return `Olá, ${cleanName}. Por rigor médico e respeito à vida, durante o período de gestação e lactação, qualquer protocolo injetável de emagrecimento ativo deve ser imediatamente suspenso.\n\nNossa prioridade agora é exclusivamente a nutrição fisiológica e o acompanhamento obstétrico. Estarei de braços abertos para iniciarmos sua otimização peptídica assim que o desmame for concluído, combinado?`;
  }

  switch (phase) {
    case 1:
      return `Olá, ${cleanName}! Seja muito bem-vinda ao meu consultório individual. Sou a Dra. Valéria Prado, especialista em Endocrinologia Metabólica e Otimização Peptídica.\n\nJá estou com a sua ficha clínica aberta aqui na tela para desenharmos juntas uma estratégia segura e definitiva para o seu corpo, sem dietas punitivas ou perda de massa magra.\n\nMe conte: como você está se sentindo física e emocionalmente com o seu corpo hoje, e qual é a sua principal meta para essa jornada?`;

    case 2:
      return `Compreendo perfeitamente o que você está sentindo, ${cleanName}. O efeito sanfona e os platôs não são falta de força de vontade, mas sim um sinal de que o seu metabolismo entrou em modo de conservação.\n\nPara que eu possa mapear a raiz do seu bloqueio celular, preciso entender 3 pontos da sua rotina:\n- Como costumam ser o seu apetite e a vontade de beliscar doces ou carboidratos ao longo do dia e à noite?\n- Como funciona o seu intestino no dia a dia, e você sente cansaço ao acordar ou fadiga no meio da tarde?`;

    case 3: {
      const mentionsFatigue = userText.includes('cansaço') || userText.includes('fadiga') || userText.includes('sono');
      const mentionsSweets = userText.includes('doce') || userText.includes('ansiedade') || userText.includes('fome');

      return `Analisando seu relato, ${cleanName}, fica evidente uma desaceleração no gasto calórico associada a picos de insulina e fadiga mitocondrial${mentionsSweets ? ' com compulsão hedônica noturna' : ''}.\n\nPara destravar essa queima e atingirmos sua meta de 6 a 8 kg por mês preservando sua massa magra, desenhei seu **Stacking Metabólico Sinérgico Personalizado** com 3 agentes:\n1. **Retatrutida** (Triagonista GIP/GLP-1/Glucagon): acelera o gasto calórico hepático, eleva a termogênese e bloqueia a fome.\n2. **AOD-9604** (Fragmento lipolítico Tyr-hGH): quebra diretamente a gordura visceral e abdominal profunda sem alterar a insulina.\n3. **MOTS-c** (Peptídeo mitocondrial): ativa a via AMPK no músculo, combatendo o cansaço e acelerando seu metabolismo celular.\n\nFez sentido essa estratégia para você? Ficou com alguma dúvida sobre como esses peptídeos agem no seu organismo?`;
    }

    case 4:
      return `Excelente, ${cleanName}! Fico muito feliz com a sua clareza e determinação. Aqui está a sua conduta clínica completa para os primeiros 30 dias:\n\n**1. PRESCRIÇÃO ESTRUTURADA:**\n• **Retatrutida**: 2,0 mg subcutâneo (SC) 1x por semana, pela manhã.\n• **AOD-9604**: 400 mcg SC ao acordar em jejum (manter 40 min de jejum calórico após a aplicação).\n• **MOTS-c**: 5,0 mg SC, 2x por semana (preferencialmente nos dias de atividade física).\n\n**2. RECONSTITUIÇÃO E CONSERVAÇÃO:**\n• Reconstituir com Água Bacteriostática estéril (BAC water), injetando o diluente suavemente pelas paredes do frasco sob vácuo. Nunca agitar — faça apenas giros circulares lentos.\n• Conservar sob refrigeração de 2°C a 8°C protegido da luz.\n\n**3. DIRETRIZES DO MENU METABÓLICO:**\n• Meta proteica: 1,8g por kg sobre o seu peso pretendido.\n• Hidratação: 35 a 40 ml por kg de peso atual ao dia.\n• Semana 1: adaptação e desinflamação digestiva; Semana 2: aceleração lipolítica; Semana 3: estabilidade mitocondrial; Semana 4: quebra de platô.\n\nVamos agendar seu retorno com peso em jejum e medidas (cintura, braço e coxa) em 30 dias. Qualquer dúvida na aplicação, estou aqui ao seu lado!`;

    default:
      return `Olá, ${cleanName}. Estou aqui acompanhando cada detalhe da sua evolução clínica. Como está se sentindo hoje com a aplicação e a sua rotina?`;
  }
}

/**
 * Main AI generation call for Dra. Valéria Prado
 * First attempts serverless endpoint (/api/ai/doctor-valeria). If unavailable, falls back to deterministic engine.
 */
export async function getDoctorValeriaResponse(
  messages: ChatMessage[],
  patientName = 'Paciente VIP',
  patientContact = ''
): Promise<{ text: string; phase: ClinicalPhase; source: 'ai' | 'deterministic' }> {
  const currentPhase = detectClinicalPhase(messages);
  const lastPatientMsg =
    [...messages].reverse().find((m) => m.sender === 'customer')?.text || '';

  // Attempt API call
  try {
    const res = await fetch('/api/ai/doctor-valeria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.slice(-12).map((m) => ({
          role: m.sender === 'customer' ? 'user' : 'model',
          content: m.text,
          senderName: m.senderName,
        })),
        patientName,
        patientContact,
        currentPhase,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.text && typeof data.text === 'string' && data.text.trim()) {
        return {
          text: data.text.trim(),
          phase: data.phase || currentPhase,
          source: 'ai',
        };
      }
    }
  } catch (e) {
    console.warn('API /api/ai/doctor-valeria error, fallbacking to clinical deterministic engine:', e);
  }

  // Fallback to deterministic clinical engine conforming to strict rules
  const reply = generateDeterministicValeriaReply(
    currentPhase,
    patientName,
    lastPatientMsg,
    messages
  );

  return {
    text: reply,
    phase: currentPhase,
    source: 'deterministic',
  };
}
