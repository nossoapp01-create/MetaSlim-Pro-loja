import { Product, BannerSlide, Testimonial, StoreSettings } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'MetaSlim Pro',
  storeSubtitle: 'Clinical Peptide Labs',
  logoText: 'MetaSlim Pro',
  currencySymbol: '€',
  currencyRateEurToBrl: 6.2,
  defaultPaymentLink: 'https://buy.stripe.com/live_metaslimpro_checkout',
  whatsappNumber: '+351912345678',
  freeShippingThreshold: 100,
  mypos: {
    enabled: true,
    mode: 'production',
    integrationType: 'paylink',
    sid: '000000000000001',
    walletNumber: '61938166666',
    keyIndex: 1,
    payLink: 'https://pay.mypos.com/metaslimpro',
  },
  stripe: {
    enabled: true,
    mode: 'live',
    publishableKey: 'pk_live_51MetaslimProCheckoutKey',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_checkout',
    currency: 'eur',
    successUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=success',
    cancelUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=cancelled',
  },
};

export const initialProducts: Product[] = [
  {
    id: 'retatrutide-10mg',
    name: 'Retatrutide 10mg',
    subtitle: 'MetaSlim Pro Clinical Vial',
    refCode: 'RT-10',
    category: 'glp1',
    categoryLabel: 'Emagrecimento & GLP-1',
    price: 59.0,
    originalPrice: 99.0,
    purity: '99.4% HPLC Grade',
    whatIsItFor:
      'Ativação tripla simultânea dos receptores GLP-1, GIP e Glucagon para aceleração metabólica basal e intensa supressão do apetite.',
    scientificDescription:
      'O Retatrutide (LY3437943) representa o ápice da farmacologia metabólica moderna. Desenvolvido para indução de queima calórica basal via receptores hepáticos de glucagon sem provocar degradação muscular, simultaneamente modulando apetite central.',
    stock: 340,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUNGHYf5ysPyg9SVloHweRJLVtK7y5NHDOdgmRp-aIaz3Z8fjdAKwE2dDPcuIMx19hngOImZjWukDeXgDra6_XouFN9a8BTVO-hNK3VOwb3QxYPuka98-qURmbj16A4to2F1mJZyu5_qqcLBTpipCTA6cvQmD_7wCoN1qU7PPvBpSeKTcX_I1gpIIoff8NZhFOPZReAbmYzwa5c_1HhnMoZyp69ZmChlEq7iQdllvtjFQ1Tr_Tnoz0vnmHx4_mxB7E5O4',
    batchNumber: 'RT10-EU782',
    casNumber: '2381089-83-2',
    molecularWeight: '~4731.4 g/mol',
    formula: 'C₂₂₁H₃₄₂N₄₆O₆₈',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_retatrutide',
    featured: true,
    badge: 'Mais Vendido',
  },
  {
    id: 'tirzepatide-15mg',
    name: 'Tirzepatide 15mg',
    subtitle: 'Dual Agonist GLP-1/GIP',
    refCode: 'TZ-15',
    category: 'glp1',
    categoryLabel: 'Emagrecimento & GLP-1',
    price: 65.0,
    originalPrice: 110.0,
    purity: '99.2% HPLC Grade',
    whatIsItFor:
      'Duplo mecanismo para controle glicêmico refinado, sensibilidade insulínica periférica e saciedade prolongada em protocolos avançados.',
    scientificDescription:
      'Duplo agonista que mimetiza incretinas naturais, promovendo esvaziamento gástrico suave, otimização de sensibilidade celular à glicose e oxidação lípica profunda.',
    stock: 215,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB885pRjZysU4tBU8Z6AnKcFWCEo5uWLKmzO-pylcSxwLRQJUa0aSsVmsGhEh1NCxs3VdVekBD711bZT7FYjI2OOCY6rw514ageS4Rg0ywWI5iLoEr5Cb52HwH6qNwatkW4oFV5pKkDPurOPuOS1CiHcqrb4EGcS62dDZgQZeU8tB5sQxnVRsQbnkAshasShXkEPigKIKR9z6Og2sBqKOLZNVX_2WHFksJaOiL1KCrgyUg12ZCEAAwK13G8lfROVYqIxkg',
    batchNumber: 'TZ15-BATCH-402',
    casNumber: '2023788-19-2',
    molecularWeight: '~4813.5 g/mol',
    formula: 'C₂₂₅H₃₄₈N₄₈O₆₈',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_tirzepatide',
    featured: true,
    badge: 'Promocional',
  },
  {
    id: 'semaglutide-10mg',
    name: 'Semaglutide 10mg',
    subtitle: 'Incretin Receptor Therapy',
    refCode: 'SM-10',
    category: 'glp1',
    categoryLabel: 'Emagrecimento & GLP-1',
    price: 54.0,
    originalPrice: 85.0,
    purity: '99.1% HPLC Grade',
    whatIsItFor:
      'Estabilização de compulsão alimentar e suporte contínuo para reeducação nutricional sem perda de tônus e sem rebote.',
    scientificDescription:
      'Agonista de receptor GLP-1 com meia-vida prolongada de 7 dias, fornecendo controle sustentado da fome basal e picos glicêmicos pós-prandiais.',
    stock: 190,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1_QaXg1iuaqiPhphU1rlNuXpKKvU35uwsi3ZsiYgGZia7WBegfDPLRExjBWLeHunR6UJPpEyZsz-3nnzuk-LbxxtbZoiER6UO7z6syPxV_H119jRXFEhA_N6DkiGG7BQGDyBXiqfi6r_UIKFHrNGVVMK44e9zgjVfeTZ6dCQW4FYB3_5d6_x_3mqKMgxdNK9Hx80PTb2DA9ZwGxEq3ZKn4vKU7VnAbe0JuxAi_gb2BAZD1xa8dFrQ0MC0LIKTkeCUOAk',
    batchNumber: 'SM10-BATCH-118',
    casNumber: '910463-68-2',
    molecularWeight: '~4113.6 g/mol',
    formula: 'C₁₈₇H₂₉₁N₄₅O₅₉',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_semaglutide',
    featured: false,
    badge: 'Clássico',
  },
  {
    id: 'bpc-157-10mg',
    name: 'BPC-157 10mg',
    subtitle: 'Body Protection Compound',
    refCode: 'BC-10',
    category: 'muscular',
    categoryLabel: 'Peptídeos Musculares',
    price: 45.0,
    originalPrice: 76.0,
    purity: '99.5% HPLC Grade',
    whatIsItFor:
      'Aceleração da regeneração de tendões, ligamentos, mucosa gastrointestinal e alívio de processos inflamatórios articulares crônicos.',
    scientificDescription:
      'Pentadecapeptídeo sintético derivado de proteína de suco gástrico humano. Estimula a angiogênese endotelial e síntese de colágeno tipo 1 em tecidos conectivos.',
    stock: 160,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUNGHYf5ysPyg9SVloHweRJLVtK7y5NHDOdgmRp-aIaz3Z8fjdAKwE2dDPcuIMx19hngOImZjWukDeXgDra6_XouFN9a8BTVO-hNK3VOwb3QxYPuka98-qURmbj16A4to2F1mJZyu5_qqcLBTpipCTA6cvQmD_7wCoN1qU7PPvBpSeKTcX_I1gpIIoff8NZhFOPZReAbmYzwa5c_1HhnMoZyp69ZmChlEq7iQdllvtjFQ1Tr_Tnoz0vnmHx4_mxB7E5O4',
    batchNumber: 'BC10-PRO-55',
    casNumber: '137525-51-0',
    molecularWeight: '~1419.6 g/mol',
    formula: 'C₆₂H₉₈N₁₆O₂₂',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_bpc157',
    featured: true,
    badge: 'Regenerativo',
  },
  {
    id: 'ipamorelin-10mg',
    name: 'Ipamorelin 10mg',
    subtitle: 'Selective GH Secretagogue',
    refCode: 'IP-10',
    category: 'muscular',
    categoryLabel: 'Peptídeos Musculares',
    price: 48.0,
    originalPrice: 79.0,
    purity: '99.3% HPLC Grade',
    whatIsItFor:
      'Estimulação natural da liberação de GH (hormônio do crescimento), densidade óssea, preservação de massa magra e reparação celular sem elevar prolactina.',
    scientificDescription:
      'Pentapeptídeo mimético da grelina de alta seletividade. Não estimula apetite de rebote nem eleva cortisol ou aldosterona.',
    stock: 120,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUNGHYf5ysPyg9SVloHweRJLVtK7y5NHDOdgmRp-aIaz3Z8fjdAKwE2dDPcuIMx19hngOImZjWukDeXgDra6_XouFN9a8BTVO-hNK3VOwb3QxYPuka98-qURmbj16A4to2F1mJZyu5_qqcLBTpipCTA6cvQmD_7wCoN1qU7PPvBpSeKTcX_I1gpIIoff8NZhFOPZReAbmYzwa5c_1HhnMoZyp69ZmChlEq7iQdllvtjFQ1Tr_Tnoz0vnmHx4_mxB7E5O4',
    batchNumber: 'IP10-REGEN-91',
    casNumber: '170851-70-4',
    molecularWeight: '~711.9 g/mol',
    formula: 'C₃₈H₄₉N₉O₅',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_ipamorelin',
    featured: false,
    badge: 'Anabólico Limpo',
  },
  {
    id: 'cjc-1295-dac',
    name: 'CJC-1295 COM DAC 5mg',
    subtitle: 'Análogo de GHRH de Longa Duração',
    refCode: 'CJ-05',
    category: 'muscular',
    categoryLabel: 'Peptídeos Musculares',
    price: 49.0,
    originalPrice: 82.0,
    purity: '99.4% HPLC Grade',
    whatIsItFor:
      'Apoio prolongado ao eixo GH / IGF-1 basal, recuperação neuromuscular acelerada e otimização da composição corporal.',
    scientificDescription:
      'Análogo estável de GHRH modificado para ligação covalente à albumina sérica (DAC), proporcionando liberação sustentada de GH e IGF-1 por até 8 a 10 dias.',
    stock: 140,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB885pRjZysU4tBU8Z6AnKcFWCEo5uWLKmzO-pylcSxwLRQJUa0aSsVmsGhEh1NCxs3VdVekBD711bZT7FYjI2OOCY6rw514ageS4Rg0ywWI5iLoEr5Cb52HwH6qNwatkW4oFV5pKkDPurOPuOS1CiHcqrb4EGcS62dDZgQZeU8tB5sQxnVRsQbnkAshasShXkEPigKIKR9z6Og2sBqKOLZNVX_2WHFksJaOiL1KCrgyUg12ZCEAAwK13G8lfROVYqIxkg',
    batchNumber: 'CJ05-LONG-42',
    casNumber: '863288-34-0',
    molecularWeight: '~3647.2 g/mol',
    formula: 'C₁₆₅H₂₇₁N₄₇O₄₆',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_cjc1295',
    featured: true,
    badge: 'Ação Prolongada',
  },
  {
    id: 'ghk-cu-50mg',
    name: 'GHK-Cu 50mg',
    subtitle: 'Tripeptídeo de Cobre Puro',
    refCode: 'CU-50',
    category: 'longevidade',
    categoryLabel: 'Anti-Aging & Pele',
    price: 46.0,
    originalPrice: 75.0,
    purity: '99.6% HPLC Grade',
    whatIsItFor:
      'Reparo cutâneo profundo, estímulo à síntese de colágeno e elastina, cicatrização acelerada e remodelação dérmica.',
    scientificDescription:
      'Complexo de tripeptídeo com íons de cobre bivalente (Cu²⁺). Atua na remodelação dérmica profunda, cicatrização pós-procedimentos e síntese de glicosaminoglicanos.',
    stock: 180,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1_QaXg1iuaqiPhphU1rlNuXpKKvU35uwsi3ZsiYgGZia7WBegfDPLRExjBWLeHunR6UJPpEyZsz-3nnzuk-LbxxtbZoiER6UO7z6syPxV_H119jRXFEhA_N6DkiGG7BQGDyBXiqfi6r_UIKFHrNGVVMK44e9zgjVfeTZ6dCQW4FYB3_5d6_x_3mqKMgxdNK9Hx80PTb2DA9ZwGxEq3ZKn4vKU7VnAbe0JuxAi_gb2BAZD1xa8dFrQ0MC0LIKTkeCUOAk',
    batchNumber: 'CU50-BLUE-18',
    casNumber: '49557-75-7',
    molecularWeight: '~404.4 g/mol',
    formula: 'C₁₄H₂₄CuN₆O₄',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_ghkcu',
    featured: true,
    badge: 'Anti-Aging',
  },
  {
    id: 'agua-bacteriostatica-10ml',
    name: 'Água Bacteriostática 10ml',
    subtitle: 'Solvente Estéril para Reconstituição',
    refCode: 'BAC-10',
    category: 'kits',
    categoryLabel: 'Solventes & Kits',
    price: 9.0,
    originalPrice: 15.0,
    purity: '0.9% Benzyl Alcohol USP',
    whatIsItFor:
      'Solvente estéril essencial para diluição correta de peptídeos liofilizados, prevenindo contaminação bacteriana por até 28 dias após a reconstituição.',
    scientificDescription:
      'Água para injeção estéril e apirogênica contendo 0.9% de álcool benzílico bacteriostático. Mantém a integridade molecular de peptídeos reconstituídos sob refrigeração de 2°C a 8°C.',
    stock: 850,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWWxcwb3RdiHMl8WY-78m3xXiZk11_8HSsY9pDmX5jHNyVVNj-j2PPGf68QPBjKYOyw7Yu0eWrz8IJT_ivx-6trEztH84IRLRpoGlW2cqBv_YXjkHlXNbf7IB09x74r-T3BlysNMpSHkJ7KxIYAgWbWii83t2uvId_PDzAt1mQv6Gb-NcmCvsrdlz9mmNaXWUYbg5k0RR4vuQbzAV52xEtignCHNr1mWntbDeiVsb9H1xNtl62zAClRQ',
    batchNumber: 'BAC-10-EU99',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_bacwater',
    featured: false,
    badge: 'Essencial',
  },
];

export const initialBanners: BannerSlide[] = [
  {
    id: 1,
    title: 'Retatrutide 10mg',
    subtitle:
      'Queima metabólica de tripla ação (GLP-1/GIP/Glucagon) para termogênese clínica acelerada.',
    tag: 'Tri-Agonista',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmU0QF939OA_AaFguSRcFIfO6Fj_CoLVbWb0cgV9YKJLdMynQfrx1bZP-BB4SwtPKTVBafndSCtz0EyW93lBfV5xeFplygb3rfPpDErE73UwIH4v7m8oPW4EQ7Otl4W6o3gLYcU4Cg112B56oOCC_NBaFuYqnqMM3xWO2dwXcZ758XWhtG52b5bytSxw3aBi48u7lg5vmuQV-8UdR3CbNGYUhRWS9eGmxQZ9P6HDOUcrcXCUzADv1iVA',
    ctaText: 'Ver Protocolo',
    ctaLink: '#catalogo',
    badgeText: 'Lote Certificado',
  },
  {
    id: 2,
    title: 'Selo Laboratorial COA',
    subtitle:
      'Rigor analítico internacional em cada frasco liofilizado com código QR auditável e pureza superior a 99% HPLC.',
    tag: 'Pureza >99% HPLC',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqu43o3f2QURlCTtBRZ0JLy1BKYc0OKNrvgwfg9PK-aMguco9S985gQ6dfdn53LKbPAhokBQ3ltftNMqq2AUwytWJvXhaaNv5tu89xicVLpRiuuWEdEvIfViWTKlOwfRswxRmtxT82Xj9Rhg-y-oXayY1vhyaCM5JFOlFfhVHqkzdWU7SzxyLwnjepDXo-yCB1OozIAjeom39-8tFy-6iGrXp3UJdIi-cw7i7StAOuAT_l7_SNdA89Bg',
    ctaText: 'Ver Laudos',
    ctaLink: '#laudos',
    badgeText: 'Ref: BATCH-2025',
  },
  {
    id: 3,
    title: 'Leve 2 + Frete Grátis',
    subtitle:
      'Protocolos de ciclo completo com desconto progressivo para Portugal e toda a União Europeia com entrega em 24-48h.',
    tag: 'Economia Escalar',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3VCA88KkH5EWlY2WY_wrf3du0X3Bd2BHAKWakeluMq2mb1bQJMisDKPermnP0E5vt4bMLEpz4G3O8ppgwJU8996WFgdgzNJMWTL8XUN7Rq1IXxAYaLgIDMKmoqNkR4HO7pxK45hru5km64e83P-OPZr7g5HXnFRzmj_dUS746uJTch6cn42wMYTIpn73HD6QWZfoJmdphLI0Dw-l8EMuSiqU3sn_zyDbsMaacOJWFYizXHs29esJBtg',
    ctaText: 'Garantir Oferta',
    ctaLink: '#catalogo',
    badgeText: '24-48h UE',
  },
  {
    id: 4,
    title: 'Tirzepatide & Semaglutide',
    subtitle:
      'Padrão ouro em modulação de incretinas. Envio isotérmico discreto em cadeia fria direto para a sua porta.',
    tag: 'Pronta Entrega',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf2DqQwA48dDIW-wZ6rDxUrZ5D0_3Swim58KPNSTm9PG73IVw894D2FIIF0kSANKLwq0L_Hh7S_QpnPbrn8qjjjMJB_rdI4EbfanVFi3yBvLxp3lwBI0EdhHicC-oPOyE6TpNJx5j0eBqDr-qSuljW59CZRnztlvKnslCEm1DfTroREHbSaWjkBUWgGAM8jqHxVIsvegdo7X4jMdRx3NeambcKAI95_w5Md3TPRWQ0jEEobLbTKzC3qQ',
    ctaText: 'Ver Estoque',
    ctaLink: '#catalogo',
    badgeText: 'Cadeia Fria Protegida',
  },
  {
    id: 5,
    title: '-14 kg em 4 Meses',
    subtitle:
      'Resultados reais consolidados na comunidade MetaSlim Pro com retenção de massa magra comprovada em exames.',
    tag: 'Impacto Clínico',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNwravYahknrS-DAPfvQGDBYOPte8-UICk7v7egnFUoaKjzVn2lpXFF0v15bV1RSr1CM8SIndhxABjXTfgNHme0Cs6x4ysBZXh5s4dUkkEZO04jH7OVhpvgp7GZpfKujDAYPX5O4Gakh99Wt91hyai4HG66KuFqhA4edL5VI_qSBbDYsXxgcRduwNVqyQVXMjaiFBkGlNAy5e4X4grE0P_cbhPm4TvGSJ87o_YF66jt1-l2evocqzGLw',
    ctaText: 'Ver Antes & Depois',
    ctaLink: '#avaliacoes',
    badgeText: '98.4% Satisfação',
  },
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Pedro M.',
    age: 42,
    protocol: 'Retatrutide 10mg',
    duration: '3 meses',
    weightLost: '-9 kg em 3 meses',
    beforeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-z2wh0AE-og2pfAHEH8ksl1CkOcNquRAj0kU-bLTJzD5MK6eu1REwqHW_N3LsVJSEpC0EdM9dHZC_Jrnx_pPGQ7neD2X4MwGTbEMmnkGsS0q40GPJilJVOWWLVkhuAfnlPX4dc5e2LmuxhGQdOdxcE_ewhB3eoioX6OtUJ0qCPDFyEmqhQ-RGycXsw-LUUl0xrQUXB3JnRobXFNDHHm7EE4cOt6a1wCgtffUuonU9iAo10M6RFMKPug',
    afterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRohMfc9viX62JBIjjxKdJrTcGVlIeaxCTCayfBkzwVMXP2I-frnOWhwongwAhSz9lt1d2LbVHdsKnURZkRotEznw4AIyYyqNRrd33rZ8XvZf7RCLT59BSvI11M-kSUB4AFp5yJTHfF_W-gf55Q48O-hiRG8SFW3MLfSfe2MAFkOsNWW3EyRqIh1JVoVmk9rGg_5i2dkYrwSX2PxBI7IqX4inUnpNHSO4NNNhw8hAcYg1cThaLbw1A_g',
    quote:
      'Costumava rir da minha barriga, mas me sentia péssimo. Estar sentado o dia todo e comer rápido cobrava a conta. O MetaSlim Pro tornou o emagrecimento simples e realista. Sinto-me confiante outra vez.',
    verified: true,
  },
  {
    id: 'test-2',
    name: 'Ana C.',
    age: 36,
    protocol: 'Retatrutide + BPC-157',
    duration: '2 meses e meio',
    weightLost: 'Mais energia e -12kg',
    beforeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsMD1Snw1I7T50YHgVKLfoUTqROtva2bpN5TENjJWZoPwZLybAh3eFobCn1nDll0xygk_lrXRvvWrigpjIWJbkWIK8W8BF2sp1f5mnt4DD52LXZXIQWDKXfQb-vWP5CGsK9xuZapf9ma5AJetTOIWSE3Lr40MFNPafFzYJQLRQF0B686bR0hDIP2gQNMQv4oRXmRXixkD_7kp7kksSHaI0gntCZi0ozXHiP58Z65hqUAtMbgHcLSuEWw',
    afterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJuv0Z1WsGV32Y2JU4fxj2CG8BDsnurjhuhRb80ULh_ivcgtGme4sZ2Y1Rd3XbYRLjCGhOykKtE-r9jqQoe1qpMmeXgliRw5MZ314EIsobOqjODhaG7ANWxSNn3iWbK2mylmHEJe-yZz0ZtScMYOf3EBa4MO-wJxlYZSYHtN_03_MDi4EMiWKgrbrpV6Z30rDbDGaQ8rGkbipriB_vdnz2yhc3myXl-dlnSyJNDS0UyPtg1dE1yVNx8A',
    quote:
      'Evitava fotografias porque não me reconhecia. O Retatrutide ajudou-me a mudar de forma natural, sem aquela fraqueza ou culpa. Tenho energia de verdade e voltei a gostar de me ver no espelho.',
    verified: true,
  },
  {
    id: 'test-3',
    name: 'Inês F.',
    age: 29,
    protocol: 'Tirzepatide 15mg',
    duration: '5 meses',
    weightLost: '16 kg perdidos em 5 meses',
    beforeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcaVFYvFKGUFTYkd56sDpv46zna0_Z81KvEW7CPtOEL7bg00qxzRUvSAXndaS_3ucX0wg9PLUx6h_fnQUxe2uneIKt5oFnHXPfGsRYJD4GIoKpkmNOuJaoxDs786TeRGeIIIvUF7lLXT6NrXm69SCl-0KxKZtnJqMvzvXMPoG9ef_A49s1PVHjRErZO9b8DeBb0hjFboZPQRSBnYTfgZmCmPHZ70a6iWNJFQz9o1f4YhBg10zXPIWZSw',
    afterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwrWFrKDuTnpod-csrcIeTK76Is_oPenT9w-HsNNfiZsQaLmAkB2OrzUSJcba8rq3mN8c3onyMInBL3OAGbpgM64whqqnOjGUKPhp6ziLZdJ6DEl2dv86AcLWDyTL2zghPIkHQSKbcZoIwpmPzQhkyKZbR2rMnO8lVw33P2QiZ9aMEE9Fu4qwHtwEoSXjD7IQwL4f3cQs2vQc1Av3PCpOlA3svpkV-wvbg-_ebMkzEwdAXGIRLfE0D7w',
    quote:
      'Tinha tentado todas as dietas da moda sem sucesso. A MetaSlim Pro foi diferente: fácil de seguir, sem restrições absurdas. As minhas calças antigas voltaram a servir com folga e sinto-me saudável.',
    verified: true,
  },
  {
    id: 'test-4',
    name: 'Beatriz L.',
    age: 34,
    protocol: 'Retatrutide 10mg',
    duration: '4 meses',
    weightLost: 'Finalmente sinto-me eu mesma',
    beforeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP0qaQtDfgtSOh9ebgshDqgNi1d6hTOYqfj3cpp4OpKbR8-O88a3YsTfaYEVfeO_NnEmQKC9dVrwwV-AhPFy9nGS-vpxJnsN8j-kA_DVCHaY6anz3M0Gseq0wwPCoS72jJxLpnFqMWOqM4irxnGW8qwYIkc4juOPWjt-Kv-qaWTdx5fazM-zNcQmMfNBx-D1czdRX3ruJq5ftRdol0pJqvSDQi6Z9RucbYnAFCE6Vtp284vNyvIKOGaw',
    afterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuB1sNRuD2vArs9dWBqu2yR_JJ2nqXR6qCQV9Gi9Yg4qk97z61J27tbNoQzOiRX2L4JVjrGFiOeAAUVGHkCfYaUTZ9MK7on102XqRBjFFpKZsrC-S_0RxxWc5Zct_QxsXaYAyBz0_6O1KjyA2nkDvadqRvgqJ9lFqcUIME-DI2sZx2C8Cq0cYhnmEfPiXt3uWQADZNe4jwz8Mv8DZzhXBnmaPQSvHvt8v3tqpu2gCVAg9KxfXNr86Mzg',
    quote:
      'Depois dos filhos, achei que nunca mais recuperaria o meu corpo. A MetaSlim Pro ajudou-me a recomeçar e ensinou-me equilíbrio. Vejo progresso real sem me sentir privada.',
    verified: true,
  },
];
