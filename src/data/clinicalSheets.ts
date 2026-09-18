export interface ProtocolDose {
  phase: string;
  dose: string;
  frequency: string;
  notes: string;
}

export interface CascadeStep {
  stepNumber: number;
  direction: 'up' | 'down' | 'neutral';
  title: string;
  desc: string;
}

export interface ClinicalSheetData {
  peptideName: string;
  scientificName: string;
  moleculeType: string;
  route: string;
  frequency: string;
  classification: string;
  casNumber?: string;
  molecularWeight?: string;
  formula?: string;

  // 1. Visão Rápida
  quickVision: string[];

  // 2. Para Que Serve
  purposeIcon: 'metabolism' | 'muscle' | 'skin' | 'longevity';
  primaryPurposes: string[];
  secondaryPurposes?: string[];

  // 3. Mecanismo de Ação (Cascata)
  mechanismTitle: string;
  mechanismCascade: CascadeStep[];
  mechanismSummary: string;

  // 4. Doses e Protocolos Sugeridos
  protocolDoses: ProtocolDose[];
  practicalSummary: {
    timing: string;
    hydration: string;
    nutrition: string;
    monitoring: string;
    storage: string;
  };

  // 5. Contraindicações
  contraindications: string[];

  // 6. Precauções
  precautions: string[];

  // 7. Farmacocinética
  pharmacokinetics: {
    halfLife: string;
    peakTime: string;
    steadyState: string;
    elimination: string;
  };
}

export const clinicalSheetsData: Record<string, ClinicalSheetData> = {
  // RETATRUTIDE 10mg
  'retatrutide-10mg': {
    peptideName: 'RETATRUTIDE 10mg',
    scientificName: 'LY3437943 • Triplo Agonista GLP-1 / GIP / Glucagon',
    moleculeType: 'Peptídeo Sintético 39 Aminoácidos',
    route: 'Via Subcutânea (SC)',
    frequency: '1x por semana',
    classification: 'Uso Clínico Investigativo / Laboratorial',
    casNumber: '2381089-83-2',
    molecularWeight: '4.731,4 g/mol',
    formula: 'C₂₂₁H₃₄₂N₄₆O₆₈',
    quickVision: [
      'Agonismo simultâneo em 3 receptores metabólicos essenciais (GLP-1 + GIP + Glucagon).',
      'Maior taxa média de redução de adiposidade registrada em ensaios fase II (~24.2%).',
      'Termogênese hepática ativa: eleva gasto calórico em repouso sem agitação.',
      'Ação contínua semanal 24/7 com meia-vida estendida de 6 dias.'
    ],
    purposeIcon: 'metabolism',
    primaryPurposes: [
      'Aceleração metabólica basal e queima de gordura visceral profunda.',
      'Supressão potente da fome hedônica e redução espontânea da ingestão calórica.',
      'Sensibilização à insulina e melhora dramática da glicemia de jejum e HbA1c.',
      'Preservação superior da massa magra quando associado a aporte proteico.'
    ],
    secondaryPurposes: [
      'Redução de gordura intra-hepática (esteatose hepática não alcoólica).',
      'Diminuição dos níveis séricos de triglicerídeos e PCR ultrassensível.'
    ],
    mechanismTitle: 'Tripla Ativação Incretínica e Termogênica',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Receptor GLP-1',
        desc: 'Retarda o esvaziamento gástrico e sinaliza saciedade precoce no hipotálamo.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Receptor GIP',
        desc: 'Otimiza a sensibilidade periférica à insulina e modula o metabolismo de lipídios.'
      },
      {
        stepNumber: 3,
        direction: 'up',
        title: 'Receptor de Glucagon',
        desc: 'Ativa a termogênese hepática e queima calórica basal em repouso.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Adiposidade Visceral',
        desc: 'Mobilização acelerada de ácidos graxos livres para oxidação mitocondrial.'
      }
    ],
    mechanismSummary: 'A integração do receptor de glucagon diferencia o Retatrutide da Semaglutida e Tirzepatida, conferindo-lhe uma taxa termogênica exclusiva de oxidação de gordura corporal.',
    protocolDoses: [
      {
        phase: 'Fase 1: Iniciação (Sem. 1-4)',
        dose: '2.0mg a 2.5mg',
        frequency: '1x por semana',
        notes: 'Adaptação receptorial e minimização de qualquer desconforto gástrico.'
      },
      {
        phase: 'Fase 2: Escalonamento (Sem. 5-8)',
        dose: '4.0mg a 5.0mg',
        frequency: '1x por semana',
        notes: 'Início da ativação termogênica robusta e oxidação lipídica contínua.'
      },
      {
        phase: 'Fase 3: Alvo Terapêutico (Sem. 9+)',
        dose: '8.0mg a 10.0mg',
        frequency: '1x por semana',
        notes: 'Manutenção de alta performance metabólica e taxa máxima de perda ponderal.'
      }
    ],
    practicalSummary: {
      timing: 'Aplicar no mesmo dia a cada 7 dias (ex: todo domingo pela manhã).',
      hydration: 'Consumo mínimo mandatório de 2.5 a 3.5 litros de água diariamente.',
      nutrition: 'Garantir mínimo de 1.6g a 2.0g de proteína por kg de peso corporal.',
      monitoring: 'Acompanhar peso semanalmente e balanço eletrolítico.',
      storage: 'Conservar rigorosamente entre 2°C e 8°C após reconstituição estéril.'
    },
    contraindications: [
      'Histórico pessoal ou familiar de Carcinoma Medular da Tireoide (CMT) ou NEM-2.',
      'Gestação, planejamento reprodutivo imediato e período de lactação.',
      'Histórico clínico comprovado de pancreatite aguda recorrente grave.',
      'Hipersensibilidade conhecida à molécula ou ao agente bacteriostático.'
    ],
    precautions: [
      'Náuseas leves transitórias nas primeiras 48h pós-injeção (geralmente autolimitadas).',
      'Evitar refeições volumosas e ricas em gorduras saturadas no dia da aplicação.',
      'Manter aporte adequado de eletrólitos (sódio, potássio e magnésio).',
      'Em caso de perda de peso ultrarrápida, reforçar o treino resistido.'
    ],
    pharmacokinetics: {
      halfLife: '~6 dias (144 - 168 horas)',
      peakTime: '24 a 48 horas pós-injeção',
      steadyState: 'Atingido na 4ª semana de administração regular',
      elimination: 'Clivagem proteolítica tecidual e degradação em aminoácidos'
    }
  },

  // IPAMORELINA 10mg (Exatamente como nas imagens do usuário!)
  'ipamorelin-10mg': {
    peptideName: 'IPAMORELINA 10mg',
    scientificName: 'Agonista Seletivo do Receptor de Grelina (GHSR-1a)',
    moleculeType: 'Pentapeptídeo Secretagogo de GH de Alta Pureza',
    route: 'Via Subcutânea (SC)',
    frequency: '1-3x ao dia (comum: ao deitar e pós-treino)',
    classification: 'Uso Laboratorial / Investigativo',
    casNumber: '170851-70-4',
    molecularWeight: '711,9 g/mol',
    formula: 'C₃₈H₄₉N₉O₅',
    quickVision: [
      'Secretagogo seletivo de hormônio do crescimento (GH) de 3ª geração.',
      'Menor estímulo colateral de prolactina e cortisol quando comparado ao GHRP-6/GHRP-2.',
      'Uso amplamente documentado em composição corporal e reparo musculoesquelético.',
      'Pico pulsátil fisiológico que respeita o ciclo circadiano natural.'
    ],
    purposeIcon: 'muscle',
    primaryPurposes: [
      'Estimular liberação de GH de forma pulsátil e fisiológica.',
      'Recuperação neuromuscular profunda e aceleração da síntese proteica.',
      'Melhora da densidade mineral óssea e integridade das articulações.',
      'Otimização do sono REM profundo e regeneração tecidual noturna.'
    ],
    secondaryPurposes: [
      'Preservação muscular durante déficits calóricos.',
      'Melhora da textura dérmica e produção endógena de colágeno.'
    ],
    mechanismTitle: 'Ativação Seletiva do Eixo GH / IGF-1',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Receptor GHSR-1a',
        desc: 'Ligação aos receptores somatotrópicos na hipófise anterior.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Pulso de GH',
        desc: 'Disparo de liberação seletiva de GH sem picos de cortisol ou estresse adrenal.'
      },
      {
        stepNumber: 3,
        direction: 'up',
        title: 'Síntese de IGF-1',
        desc: 'Conversão hepática em IGF-1 para anabolismo e recuperação tecidual.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Gordura Visceral',
        desc: 'Ação lipolítica promovida pelo GH livre circulante.'
      }
    ],
    mechanismSummary: 'A Ipamorelina é considerada o secretagogo de GH mais limpo da literatura farmacológica moderna, pois não gera a fome descontrolada comum ao GHRP-6 nem elevação de aldosterona.',
    protocolDoses: [
      {
        phase: '1) Iniciação / Tolerabilidade',
        dose: '100mcg a 150mcg',
        frequency: '1x ao dia (ao deitar em jejum)',
        notes: 'Avaliação da resposta e melhora da arquitetura do sono.'
      },
      {
        phase: '2) Pista Comum / Atletas',
        dose: '200mcg',
        frequency: '2x ao dia (manhã em jejum + noite)',
        notes: 'Protocolo sinérgico frequentemente associado ao CJC-1295.'
      },
      {
        phase: '3) Manutenção & Longevidade',
        dose: '200mcg a 300mcg/dia',
        frequency: 'Fracionado 5 dias on / 2 dias off',
        notes: 'Prevenção de dessensibilização dos receptores hipofisários.'
      }
    ],
    practicalSummary: {
      timing: 'Preferir jejum relativo de 2 horas antes e 30 minutos após a injeção.',
      hydration: 'Adequada ingestão hídrica ao longo de todo o dia.',
      nutrition: 'Evitar açúcares de alto índice glicêmico logo antes da aplicação.',
      monitoring: 'Monitorar níveis de IGF-1 basal após 8 a 12 semanas.',
      storage: 'Conservar frasco reconstituído entre 2°C e 8°C protegido da luz.'
    },
    contraindications: [
      'Neoplasias ativas ou suspeitas oncológicas (devido ao estímulo mitogênico de IGF-1).',
      'Gestação e período de amamentação.',
      'Hipersensibilidade ao peptídeo.',
      'Uso sem acompanhamento laboratorial de marcadores basais.'
    ],
    precautions: [
      'Leve retenção hídrica ou sensação transitória de formigamento nas mãos.',
      'Possível oscilação glicêmica leve em indivíduos diabéticos descompensados.',
      'Sensação de calor ou rubor facial nos primeiros 10 minutos pós-aplicação.',
      'Respeitar os intervalos de jejum para garantir pico máximo de liberação.'
    ],
    pharmacokinetics: {
      halfLife: '~2 horas (meia-vida curta com pulso pronunciado)',
      peakTime: '30 a 45 minutos após a aplicação subcutânea',
      steadyState: 'Não acumula; atua através de pulsos fisiológicos repetidos',
      elimination: 'Metabolização enzimática plasmática e hepática'
    }
  },

  // CJC-1295 COM DAC (Exatamente como nas imagens do usuário!)
  'cjc-1295-dac': {
    peptideName: 'CJC-1295 COM DAC',
    scientificName: 'Análogo de GHRH de Liberação Prolongada (Drug Affinity Complex)',
    moleculeType: 'Tetrassubstituído com complexo de afinidade a albumina',
    route: 'Via Subcutânea (SC)',
    frequency: '1x a 2x por semana',
    classification: 'Uso Experimental / Laboratorial',
    casNumber: '863288-34-0',
    molecularWeight: '3.647,2 g/mol',
    formula: 'C₁₆₅H₂₇₁N₄₇O₄₆',
    quickVision: [
      'Análogo estável de GHRH modificado para ligação covalente à albumina sérica.',
      'Liberação sustentada de GH e IGF-1 por até 8 a 10 dias após injeção única.',
      'Recuperação de tecidos e melhoria da densidade corporal com posologia semanal.',
      'Alta comodidade: dispensa múltiplas picadas diárias.'
    ],
    purposeIcon: 'muscle',
    primaryPurposes: [
      'Apoio prolongado ao eixo GH / IGF-1 basal.',
      'Aceleração de recuperação tecidual e rendimento neuromuscular.',
      'Otimização da composição corporal (aumento de massa livre de gordura).',
      'Aumento da síntese de colágeno dérmico e articular.'
    ],
    mechanismTitle: 'Estimulação Sustentada de GHRH via Albumina',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Complexo DAC',
        desc: 'Ligação estável à albumina sérica que impede degradação por dipeptidil peptidase-4.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Estímulo Contínuo',
        desc: 'Ativação crônica e fisiológica dos receptores de GHRH na hipófise.'
      },
      {
        stepNumber: 3,
        direction: 'up',
        title: 'Elevação de IGF-1',
        desc: 'Aumento expressivo e sustentado de IGF-1 plasmático por vários dias.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Degradação Muscular',
        desc: 'Proteção anticatabólica e reparo mitocondrial celular.'
      }
    ],
    mechanismSummary: 'Graças ao complexo DAC (Drug Affinity Complex), o peptídeo resiste à hidrólise enzimática, mantendo a estimulação do hormônio do crescimento de forma contínua durante toda a semana.',
    protocolDoses: [
      {
        phase: '1) Monoterapia Semanal',
        dose: '500mcg a 1.000mcg',
        frequency: '1x por semana',
        notes: 'Dose segura de entrada para avaliação de tolerabilidade e níveis de IGF-1.'
      },
      {
        phase: '2) Pista Comum / Atletas',
        dose: '1.000mcg a 2.000mcg',
        frequency: '1x a 2x por semana',
        notes: 'Fracionado em 2 doses semanais (ex: Segunda e Quinta-feira).'
      },
      {
        phase: '3) Manutenção Terapêutica',
        dose: '500mcg a 1.000mcg',
        frequency: '1x a cada 7-10 dias',
        notes: 'Ciclos de 8 a 12 semanas com pausas para homeostase.'
      }
    ],
    practicalSummary: {
      timing: 'Aplicação semanal em dia fixo, preferencialmente à noite.',
      hydration: 'Consumo regular de água e eletrólitos.',
      nutrition: 'Dieta hiperproteica e balanceada em micronutrientes.',
      monitoring: 'Coletar dosagem laboratorial de IGF-1 sérico a cada 6 semanas.',
      storage: 'Armazenar entre 2°C e 8°C imediatamente após diluição.'
    },
    contraindications: [
      'Neoplasia ativa ou suspeita de tumor dependente de fatores de crescimento.',
      'Gestação, gravidez planejada e amamentação.',
      'Hipersensibilidade ou alergia a peptídeos sintéticos.',
      'Uso sem dosagem laboratorial periódica de IGF-1.'
    ],
    precautions: [
      'Rubor facial e sensação de pressão na cabeça nos primeiros 15 minutos.',
      'Edema ou leve retenção hídrica transitória.',
      'Possível alteração leve na sensibilidade à glicose com doses elevadas.',
      'Reavaliar protocolo caso os níveis de IGF-1 ultrapassem o limite fisiológico.'
    ],
    pharmacokinetics: {
      halfLife: 'Aproximadamente 6 a 8 dias (meia-vida extremamente prolongada)',
      peakTime: '1 a 3 dias pós-aplicação',
      steadyState: 'Atingido após 2 a 3 semanas de uso contínuo',
      elimination: 'Liberação lenta da albumina e catabolismo renal/hepático'
    }
  },

  // GHK-Cu (Exatamente como nas imagens do usuário!)
  'ghk-cu-50mg': {
    peptideName: 'GHK-Cu 50mg',
    scientificName: 'Tripeptídeo de Cobre (Glicil-Histidil-Lisina:Cobre)',
    moleculeType: 'Complexo Peptídeo-Mineral Bioativo',
    route: 'Via Tópica (Sérum) ou Subcutânea (SC)',
    frequency: '1-2x ao dia (tópico) ou 1x/dia em ciclos',
    classification: 'Uso Cosmecêutico / Regenerativo / Experimental',
    casNumber: '49557-75-7',
    molecularWeight: '404,4 g/mol',
    formula: 'C₁₄H₂₄CuN₆O₄',
    quickVision: [
      'Tripeptídeo natural com afinidade seletiva por íons de cobre bivalente (Cu²⁺).',
      'Poderoso ativador da remodelação dérmica, síntese de colágeno I, III e elastina.',
      'Ação anti-inflamatória, antioxidante e redutora de fotoenvelhecimento.',
      'Frequente em formulações estéticas faciais e protocolos capilares.'
    ],
    purposeIcon: 'skin',
    primaryPurposes: [
      'Reparo cutâneo profundo e aceleração da cicatrização pós-procedimentos.',
      'Estímulo robusto da produção de colágeno e glicosaminoglicanos (GAGs).',
      'Remodelação dérmica e redução de linhas finas e rugas.',
      'Estímulo da microcirculação no folículo piloso (saúde capilar).'
    ],
    mechanismTitle: 'Remodelação Celular e Modulação Gênica Dérmica',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Íons de Cobre Cu²⁺',
        desc: 'Entrega dirigida de cobre a fibroblastos e células-tronco epiteliais.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Colágeno e Elastina',
        desc: 'Expressão aumentada de enzimas lisil oxidase e síntese de matriz extracelular.'
      },
      {
        stepNumber: 3,
        direction: 'down',
        title: 'Enzimas MMPs',
        desc: 'Regulação descendente das metaloproteinases que destroem a pele.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Marcadores Inflamatórios',
        desc: 'Inibição de TNF-alfa e interleucinas pró-inflamatórias.'
      }
    ],
    mechanismSummary: 'O GHK-Cu reverte padrões genéticos celulares para um estado mais jovem, estimulando a síntese de colágeno e a angiogênese enquanto suprime cicatrizes fibróticas.',
    protocolDoses: [
      {
        phase: '1) Uso Tópico Dérmico',
        dose: '0.05% a 0.2% de concentração',
        frequency: '1-2x ao dia',
        notes: 'Aplicar suavemente sobre a pele limpa (rosto, pescoço ou couro cabeludo).'
      },
      {
        phase: '2) Protocolo Injetável SC',
        dose: '1.0mg a 2.0mg ao dia',
        frequency: 'Ciclos de 30 dias',
        notes: 'Injeção subcutânea distante de áreas doloridas; ciclo seguido de pausa.'
      }
    ],
    practicalSummary: {
      timing: 'Para aplicação tópica, aplicar antes de dormir ou pela manhã.',
      hydration: 'Manter a pele bem hidratada para absorção superior.',
      nutrition: 'Dieta rica em vitamina C para otimizar síntese de colágeno.',
      monitoring: 'Observar tolerabilidade e ausência de irritação dérmica.',
      storage: 'Conservar frasco de solução pura refrigerado a 2°C - 8°C.'
    },
    contraindications: [
      'Hipersensibilidade ou alergia tópica ao cobre.',
      'Infecção ativa purulenta no local da aplicação.',
      'Doença de Wilson (distúrbio de acúmulo de cobre).',
      'Uso sem teste de contato dérmico prévio.'
    ],
    precautions: [
      'Irritação local leve transitória ou vermelhidão temporária na pele sensível.',
      'Evitar contato com os olhos e mucosas.',
      'Não misturar com ácidos fortes (AHA, BHA, Vitamina C pura) no mesmo momento.',
      'Suspender o uso se houver ardência prolongada.'
    ],
    pharmacokinetics: {
      halfLife: '~1 a 2 horas (circulação livre) / Efeito dérmico tecidual prolongado',
      peakTime: 'Ação biológica acumulativa após 14 dias de uso regular',
      steadyState: 'Remodelação de matriz visível a partir de 4 a 8 semanas',
      elimination: 'Cobre reutilizado por vias fisiológicas corporais'
    }
  },

  // TIRZEPATIDE 15mg
  'tirzepatide-15mg': {
    peptideName: 'TIRZEPATIDE 15mg',
    scientificName: 'Duplo Agonista GLP-1 / GIP • LY3298176',
    moleculeType: 'Peptídeo Sintético 39 Aminoácidos Modificado',
    route: 'Via Subcutânea (SC)',
    frequency: '1x por semana',
    classification: 'Uso Clínico Investigativo / Laboratorial',
    casNumber: '2023788-19-2',
    molecularWeight: '4.813,5 g/mol',
    formula: 'C₂₂₅H₃₄₈N₄₈O₆₈',
    quickVision: [
      'Dupla ativação sinérgica dos receptores GLP-1 e GIP (Twincretin).',
      'Redução média de até 22.5% do peso corporal demonstrada em ensaios SURMOUNT.',
      'Controle glicêmico excepcional com marcante queda da hemoglobina glicada.',
      'Administração semanal confortável com perfil de tolerabilidade amplamente testado.'
    ],
    purposeIcon: 'metabolism',
    primaryPurposes: [
      'Redução acentuada de gordura corporal e peso total.',
      'Controle refinado da glicemia e combate à resistência à insulina.',
      'Prolongamento da saciedade gástrica e modulação de compulsões noturnas.',
      'Melhoria dos parâmetros cardiovasculares e perfil lipídico.'
    ],
    mechanismTitle: 'Sinergia Twincretin GLP-1 + GIP',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'GLP-1 Central',
        desc: 'Redução do apetite hipotalâmico e retardo suave do esvaziamento gástrico.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'GIP Tecidual',
        desc: 'Melhora da sensibilidade adiposa à insulina e partição eficiente de nutrientes.'
      },
      {
        stepNumber: 3,
        direction: 'down',
        title: 'Picos Glicêmicos',
        desc: 'Estabilização contínua da glicose pós-prandial e do índice HOMA-IR.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Depósitos Adiposos',
        desc: 'Queima contínua de gordura com menor náusea que agonistas puros de GLP-1.'
      }
    ],
    mechanismSummary: 'O componente GIP atenua as náuseas provocadas pelo GLP-1 puro enquanto potencializa a liberação dependente de glicose da insulina e a lipólise adiposa.',
    protocolDoses: [
      {
        phase: 'Fase 1: Iniciação (Sem. 1-4)',
        dose: '2.5mg',
        frequency: '1x por semana',
        notes: 'Dose puramente adaptativa para habituação do sistema gastrointestinal.'
      },
      {
        phase: 'Fase 2: Escalonamento 1 (Sem. 5-8)',
        dose: '5.0mg',
        frequency: '1x por semana',
        notes: 'Início da perda ponderal consistente e controle glicêmico robusto.'
      },
      {
        phase: 'Fase 3: Alvo Avançado (Sem. 9+)',
        dose: '7.5mg a 15.0mg',
        frequency: '1x por semana',
        notes: 'Ajuste conforme resposta individual e acompanhamento de metas.'
      }
    ],
    practicalSummary: {
      timing: 'Aplicar no mesmo dia da semana (manhã ou noite) independente de refeições.',
      hydration: 'Manter hidratação regular (pelo menos 2.5L/dia) para evitar constipação.',
      nutrition: 'Priorizar proteínas de alto valor biológico e fibras solúveis.',
      monitoring: 'Aferir peso semanalmente no mesmo horário e balança.',
      storage: 'Manter solução reconstituída estéril entre 2°C e 8°C.'
    },
    contraindications: [
      'Histórico de Carcinoma Medular da Tireoide ou Neoplasia Endócrina Múltipla tipo 2.',
      'Gravidez confirmada ou amamentação.',
      'Antecedente de pancreatite aguda grave.',
      'Alergia grave conhecida ao composto.'
    ],
    precautions: [
      'Constipação ou náuseas leves transitórias (facilmente manejáveis com água e fibras).',
      'Reduzir a velocidade do escalonamento de dose se houver desconforto abdominal.',
      'Atenção ao combinar com hipoglicemiantes orais como sulfonilureias.',
      'Evitar bebidas alcoólicas em excesso durante o tratamento.'
    ],
    pharmacokinetics: {
      halfLife: '~5 dias (120 horas)',
      peakTime: '8 a 72 horas pós-injeção',
      steadyState: 'Atingido após 4 semanas com a mesma dosagem',
      elimination: 'Clivagem peptídica proteolítica natural'
    }
  },

  // SEMAGLUTIDE 10mg
  'semaglutide-10mg': {
    peptideName: 'SEMAGLUTIDE 10mg',
    scientificName: 'Agonista do Receptor GLP-1 de Longa Duração',
    moleculeType: 'Peptídeo Sintético Acilado com Ácido Graxo',
    route: 'Via Subcutânea (SC)',
    frequency: '1x por semana',
    classification: 'Padrão Ouro em Modulação de Saciedade',
    casNumber: '910463-68-2',
    molecularWeight: '4.113,6 g/mol',
    formula: 'C₁₈₇H₂₉₁N₄₅O₅₉',
    quickVision: [
      'O agonista de GLP-1 mais estudado e prescrito no mundo.',
      'Alta afinidade à albumina garantindo meia-vida prolongada de 7 dias.',
      'Extremamente eficiente na extinção de compulsões alimentares e "food noise".',
      'Resultados comprovados com preservação do bem-estar geral.'
    ],
    purposeIcon: 'metabolism',
    primaryPurposes: [
      'Controle seguro e sustentável do peso corporal.',
      'Supressão de pensamentos obsessivos por comida (ruído mental alimentar).',
      'Melhoria do perfil cardiometabólico e sensibilidade à insulina.',
      'Facilitação de reeducação nutricional a longo prazo sem efeito rebote.'
    ],
    mechanismTitle: 'Modulação Hipotalâmica de Saciedade Central',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Receptor GLP-1 Cerebral',
        desc: 'Ativação direta de neurônios POMC/CART saciogênicos no hipotálamo.'
      },
      {
        stepNumber: 2,
        direction: 'down',
        title: 'Neurônios NPY/AgRP',
        desc: 'Desativação do circuito cerebral que comanda a fome voraz.'
      },
      {
        stepNumber: 3,
        direction: 'down',
        title: 'Motilidade Gástrica',
        desc: 'Esvaziamento estomacal desacelerado, prolongando a saciedade pós-refeição.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Ingestão Calórica',
        desc: 'Déficit calórico espontâneo e sustentável sem sofrimento.'
      }
    ],
    mechanismSummary: 'A molécula de Semaglutida possui um ácido graxo ligado que permite aderir à albumina sérica, protegendo-a contra a quebra pela enzima DPP-4 e fornecendo 168h de ação contínua.',
    protocolDoses: [
      {
        phase: 'Iniciação (Semanas 1 a 4)',
        dose: '0.25mg',
        frequency: '1x por semana',
        notes: 'Fase crucial de habituação estomacal e proteção contra náusea.'
      },
      {
        phase: 'Progressão 1 (Semanas 5 a 8)',
        dose: '0.50mg',
        frequency: '1x por semana',
        notes: 'Primeira fase de perda ponderal acelerada evidente.'
      },
      {
        phase: 'Progressão 2 (Semanas 9 a 12)',
        dose: '1.0mg',
        frequency: '1x por semana',
        notes: 'Dose de consolidação e alta eficácia metabólica.'
      },
      {
        phase: 'Manutenção Máxima (Sem. 13+)',
        dose: '1.7mg a 2.4mg',
        frequency: '1x por semana',
        notes: 'Para pacientes que necessitam de intervenção máxima.'
      }
    ],
    practicalSummary: {
      timing: 'Injetar sempre no mesmo dia da semana, em qualquer horário conveniente.',
      hydration: 'Beber água em pequenos goles frequentes ao longo do dia.',
      nutrition: 'Fracionar a alimentação em porções menores para evitar empachamento.',
      monitoring: 'Acompanhar hábitos intestinais e peso semanalmente.',
      storage: 'Conservar frasco diluído rigorosamente entre 2°C e 8°C.'
    },
    contraindications: [
      'Histórico de carcinoma medular da tireoide (pessoal ou familiar).',
      'Gestação, lactação e mulheres em idade fértil sem método contraceptivo.',
      'Doença inflamatória intestinal grave ou gastroparesia grave prévia.',
      'Alergia aos excipientes da fórmula.'
    ],
    precautions: [
      'Refluxo gastroesofágico ou náuseas leves se ingeridas refeições pesadas.',
      'Não deitar imediatamente após comer.',
      'Garantir aporte hídrico para evitar quadros de desidratação.',
      'Respeitar religiosamente o tempo mínimo de 4 semanas entre aumentos de dose.'
    ],
    pharmacokinetics: {
      halfLife: '~7 dias (165 horas)',
      peakTime: '1 a 3 dias pós-injeção',
      steadyState: 'Atingido na 4ª ou 5ª semana',
      elimination: 'Degradação metabólica por clivagem proteica'
    }
  },

  // BPC-157 10mg
  'bpc-157-10mg': {
    peptideName: 'BPC-157 10mg',
    scientificName: 'Body Protection Compound 157 • Pentadecapeptídeo Gástrico',
    moleculeType: 'Peptídeo Sintético Derivado do Suco Gástrico Humano',
    route: 'Via Subcutânea (local ou sistêmica) / Oral',
    frequency: '1-2x ao dia',
    classification: 'Padrão Ouro em Regeneração Muscular e Tendínea',
    casNumber: '137525-51-0',
    molecularWeight: '1.419,6 g/mol',
    formula: 'C₆₂H₉₈N₁₆O₂₂',
    quickVision: [
      'Pentadecapeptídeo de 15 aminoácidos com extrema afinidade regenerativa tecidual.',
      'Estudos demonstram aceleração da cicatrização de tendões, ligamentos e músculos.',
      'Potente efeito protetor e regenerador da mucosa do estômago e intestino.',
      'Promove angiogênese endotelial dirigida para nutrição de áreas lesionadas.'
    ],
    purposeIcon: 'muscle',
    primaryPurposes: [
      'Regeneração rápida de tendinites, entorses e lesões musculoesqueléticas.',
      'Restauração da integridade da barreira intestinal (leaky gut e colite).',
      'Redução de inflamações articulares crônicas e aceleração pós-cirúrgica.',
      'Proteção contra lesões gástricas induzidas por anti-inflamatórios (AINEs).'
    ],
    mechanismTitle: 'Angiogênese e Expressão de Fatores de Crescimento',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Receptor VEGFR2',
        desc: 'Ativação da via de angiogênese formando microcapilares no tecido lesado.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Síntese de Colágeno Tipo I',
        desc: 'Estímulo da matriz extracelular para ancoragem de fibras tendíneas fortes.'
      },
      {
        stepNumber: 3,
        direction: 'down',
        title: 'Citocinas Pró-inflamatórias',
        desc: 'Redução expressiva da dor inflamatória local e inchaço tecidual.'
      },
      {
        stepNumber: 4,
        direction: 'up',
        title: 'Cicatriz Funcional',
        desc: 'Recuperação biomecânica completa sem formação excessiva de queloides ou fibrose.'
      }
    ],
    mechanismSummary: 'O BPC-157 atua diretamente recrutando fibroblastos e promovendo neoangiogênese saudável, devolvendo vascularização e nutrientes a áreas com baixo suprimento sanguíneo como tendões e cartilagens.',
    protocolDoses: [
      {
        phase: '1) Dose Regenerativa Padrão',
        dose: '250mcg a 350mcg',
        frequency: '1x a 2x ao dia',
        notes: 'Injeção subcutânea próxima à área afetada ou sistêmica no abdômen.'
      },
      {
        phase: '2) Lesões Agudas Severas',
        dose: '500mcg',
        frequency: '2x ao dia (manhã e noite)',
        notes: 'Protocolo intensivo durante 14 a 21 dias até remissão da dor.'
      },
      {
        phase: '3) Manutenção da Saúde Intestinal',
        dose: '250mcg',
        frequency: '1x ao dia (preferencialmente em jejum)',
        notes: 'Ciclos de 4 a 6 semanas para reparação da barreira gastrointestinal.'
      }
    ],
    practicalSummary: {
      timing: 'Pode ser aplicado pela manhã e antes de dormir.',
      hydration: 'Manter hidratação regular.',
      nutrition: 'Assegurar ingestão adequada de colágeno hidrolisado, vitamina C e zinco.',
      monitoring: 'Acompanhar mobilidade articular e escala subjetiva de dor (EVA).',
      storage: 'Conservar frasco de BPC-157 reconstituído refrigerado a 2°C - 8°C.'
    },
    contraindications: [
      'Neoplasias malignas ativas (pelo estímulo angiogênico via VEGF).',
      'Gravidez e lactação.',
      'Hipersensibilidade individual ao composto.',
      'Uso em feridas infectadas sem cobertura antibiótica prévia.'
    ],
    precautions: [
      'Geralmente apresenta perfil de tolerabilidade excepcional e sem efeitos adversos graves.',
      'Leve ardor passageiro no sítio da injeção que cede em minutos.',
      'Utilizar sempre técnica asséptica e agulhas estéreis descartáveis.',
      'Não misturar no mesmo frasco com solventes alcoólicos concentrados.'
    ],
    pharmacokinetics: {
      halfLife: '~4 horas (meia-vida plasmática curta com efeitos transcricionais duradouros)',
      peakTime: '30 a 60 minutos pós-aplicação',
      steadyState: 'Efeito cumulativo regenerativo observado a partir de 7 a 10 dias',
      elimination: 'Depuração renal e hidrólise peptídica natural'
    }
  }
};

// Helper function to get or generate fallback didactic sheet for any product
export function getClinicalSheet(productId: string, productName?: string): ClinicalSheetData {
  if (clinicalSheetsData[productId]) {
    return clinicalSheetsData[productId];
  }

  // Check matching by name keyword
  const lower = (productName || productId).toLowerCase();
  if (lower.includes('retatrutide')) return clinicalSheetsData['retatrutide-10mg'];
  if (lower.includes('ipamorelin')) return clinicalSheetsData['ipamorelin-10mg'];
  if (lower.includes('cjc') || lower.includes('1295')) return clinicalSheetsData['cjc-1295-dac'];
  if (lower.includes('ghk') || lower.includes('copper')) return clinicalSheetsData['ghk-cu-50mg'];
  if (lower.includes('tirzepatide')) return clinicalSheetsData['tirzepatide-15mg'];
  if (lower.includes('semaglutide')) return clinicalSheetsData['semaglutide-10mg'];
  if (lower.includes('bpc')) return clinicalSheetsData['bpc-157-10mg'];

  // Default rich fallback clinical sheet
  return {
    peptideName: (productName || 'PEPTÍDEO BIOATIVO').toUpperCase(),
    scientificName: 'Composto Peptídico Liofilizado de Alta Pureza HPLC >99%',
    moleculeType: 'Peptídeo Bioativo Sintético Grau Laboratorial',
    route: 'Via Subcutânea (SC)',
    frequency: 'Conforme protocolo clínico específico',
    classification: 'Uso de Pesquisa e Investigação Laboratorial',
    quickVision: [
      'Peptídeo de alta pureza cromatográfica com laudo analítico HPLC de terceiros.',
      'Liofilização a vácuo para preservação da estabilidade molecular.',
      'Excelente solubilidade em água bacteriostática estéril (BAC).',
      'Desenvolvido para máxima biodisponibilidade e resposta biológica controlada.'
    ],
    purposeIcon: 'metabolism',
    primaryPurposes: [
      'Otimização de processos celulares e modulação de vias metabólicas.',
      'Preservação e suporte aos mecanismos de homeostase e longevidade.',
      'Alta especificidade de ligação aos receptores-alvo sem efeitos dispersivos.',
      'Estabilidade estrutural sob temperatura controlada (2°C a 8°C).'
    ],
    mechanismTitle: 'Ativação Seletiva de Vias Moleculares',
    mechanismCascade: [
      {
        stepNumber: 1,
        direction: 'up',
        title: 'Ligação Receptorial',
        desc: 'Interação de alta afinidade com os receptores específicos de membrana.'
      },
      {
        stepNumber: 2,
        direction: 'up',
        title: 'Sinalização Intracelular',
        desc: 'Disparo de segundos mensageiros e fatores de transcrição nuclear.'
      },
      {
        stepNumber: 3,
        direction: 'up',
        title: 'Resposta Biológica',
        desc: 'Modulação equilibrada dos processos fisiológicos programados.'
      },
      {
        stepNumber: 4,
        direction: 'down',
        title: 'Estresse Oxidativo',
        desc: 'Otimização energética celular com manutenção de homeostase.'
      }
    ],
    mechanismSummary: 'A molécula atua mimetizando os ligantes endógenos de alta seletividade, ativando respostas biológicas fisiológicas sem sobrecarregar vias secundárias.',
    protocolDoses: [
      {
        phase: 'Fase Inicial (Adaptação)',
        dose: 'Dose mínima sugerida',
        frequency: '1x ao dia ou 1x por semana',
        notes: 'Avaliação de tolerabilidade individual e resposta inicial.'
      },
      {
        phase: 'Fase de Protocolo Pleno',
        dose: 'Dose padrão recomendada',
        frequency: 'Conforme literatura do composto',
        notes: 'Manutenção da ação contínua durante o ciclo pretendido.'
      }
    ],
    practicalSummary: {
      timing: 'Aplicar preferencialmente em horários regulares e consistentes.',
      hydration: 'Manter hidratação adequada de 2.5L a 3.0L de água diários.',
      nutrition: 'Dieta equilibrada condizente com os objetivos do protocolo.',
      monitoring: 'Acompanhar respostas clínicas e marcadores laboratoriais.',
      storage: 'Manter sempre sob refrigeração de 2°C a 8°C após reconstituição.'
    },
    contraindications: [
      'Neoplasias ativas ou suspeitas clínicas sem investigação.',
      'Gestação, lactação e indivíduos menores de idade.',
      'Hipersensibilidade conhecida à molécula ou ao veículo.',
      'Uso sem acompanhamento profissional qualificado.'
    ],
    precautions: [
      'Utilizar técnica rigorosa de assepsia durante a reconstituição e manuseio.',
      'Não agitar vigorosamente o frasco para não romper as ligações peptídicas.',
      'Manter fora do alcance de crianças e animais de estimação.',
      'Armazenar em embalagem protegida de luz solar direta.'
    ],
    pharmacokinetics: {
      halfLife: 'Específica do composto sob regime refrigerado',
      peakTime: 'Absorção subcutânea gradual e sustentada',
      steadyState: 'Concentração plasmática estável sob regime contínuo',
      elimination: 'Clivagem hidrolítica e degradação enzimática natural'
    }
  };
}
