export interface Signo {
  slug: string;
  name: string;
  emoji: string;
  element: string;
  elementEmoji: string;
  quality: string;
  ruler: string;
  dateRange: string;
  symbol: string;
  description: string;
  traits: string[];
  love: string;
  career: string;
  health: string;
  compatibility: string[];
}

export const signos: Signo[] = [
  {
    slug: "aries", name: "Áries", emoji: "♈", element: "Fogo", elementEmoji: "🔥",
    quality: "Cardinal", ruler: "Marte", dateRange: "21 de março a 19 de abril", symbol: "O Carneiro",
    description: "Áries é o primeiro signo do zodíaco e carrega a energia do recomeço. Pessoas de Áries são corajosas, determinadas e cheias de iniciativa. Gostam de liderar e não têm medo de enfrentar desafios.",
    traits: ["Corajoso", "Determinado", "Impulsivo", "Líder nato", "Aventureiro", "Direto"],
    love: "No amor, Áries é intenso e apaixonado. Gosta de conquista e precisa de um parceiro que acompanhe sua energia. Quando ama, ama com tudo — mas precisa de espaço para ser quem é.",
    career: "Na carreira, Áries brilha em posições de liderança. Empreendedor nato, prefere criar seus próprios caminhos a seguir ordens. Áreas como esportes, negócios e tecnologia combinam com sua energia.",
    health: "Áries governa a cabeça. Dores de cabeça e tensão são comuns quando está estressado. Exercícios intensos como corrida e artes marciais ajudam a canalizar sua energia.",
    compatibility: ["Leão", "Sagitário", "Gêmeos", "Aquário"],
  },
  {
    slug: "touro", name: "Touro", emoji: "♉", element: "Terra", elementEmoji: "🌍",
    quality: "Fixo", ruler: "Vênus", dateRange: "20 de abril a 20 de maio", symbol: "O Touro",
    description: "Touro é o signo da estabilidade e do prazer. Pessoas de Touro valorizam segurança, conforto e as coisas boas da vida. São pacientes, leais e têm uma conexão profunda com a natureza e os sentidos.",
    traits: ["Paciente", "Leal", "Determinado", "Sensual", "Prático", "Teimoso"],
    love: "No amor, Touro é devoto e sensual. Busca estabilidade e um relacionamento construído no dia a dia. Demonstra amor através de gestos concretos — presentes, comida, toque.",
    career: "Na carreira, Touro é persistente e confiável. Brilha em áreas como finanças, gastronomia, arte e design. Valoriza estabilidade financeira e constrói riqueza com paciência.",
    health: "Touro governa a garganta e o pescoço. Problemas de tireoide e dores na região são comuns. Atividades relaxantes como yoga e caminhadas na natureza fazem bem.",
    compatibility: ["Virgem", "Capricórnio", "Câncer", "Peixes"],
  },
  {
    slug: "gemeos", name: "Gêmeos", emoji: "♊", element: "Ar", elementEmoji: "💨",
    quality: "Mutável", ruler: "Mercúrio", dateRange: "21 de maio a 20 de junho", symbol: "Os Gêmeos",
    description: "Gêmeos é o signo da comunicação e da curiosidade. Pessoas de Gêmeos são versáteis, inteligentes e adoram aprender coisas novas. Sua mente rápida e adaptável os torna excelentes comunicadores.",
    traits: ["Comunicativo", "Curioso", "Versátil", "Inteligente", "Adaptável", "Inquieto"],
    love: "No amor, Gêmeos precisa de estímulo mental. Conversas longas, humor e novidade mantêm a chama acesa. Pode ter dificuldade com rotina, mas quando encontra alguém que acompanha sua mente, se entrega.",
    career: "Na carreira, Gêmeos brilha em comunicação, jornalismo, marketing e ensino. Precisa de variedade e desafios intelectuais. Multitarefa nato, consegue lidar com vários projetos ao mesmo tempo.",
    health: "Gêmeos governa os pulmões e braços. Exercícios respiratórios e atividades que envolvam coordenação são ideais. Ansiedade pode ser um desafio — meditação ajuda.",
    compatibility: ["Libra", "Aquário", "Áries", "Leão"],
  },
  {
    slug: "cancer", name: "Câncer", emoji: "♋", element: "Água", elementEmoji: "💧",
    quality: "Cardinal", ruler: "Lua", dateRange: "21 de junho a 22 de julho", symbol: "O Caranguejo",
    description: "Câncer é o signo do lar e das emoções. Pessoas de Câncer são profundamente intuitivas, protetoras e ligadas à família. Têm uma sensibilidade única que os conecta com as emoções dos outros.",
    traits: ["Intuitivo", "Protetor", "Emocional", "Leal", "Carinhoso", "Sensível"],
    love: "No amor, Câncer é o mais dedicado do zodíaco. Cria um ninho de amor e segurança para quem ama. Precisa de reciprocidade emocional e se magoa facilmente com frieza.",
    career: "Na carreira, Câncer brilha em áreas que envolvem cuidado: saúde, educação, gastronomia, psicologia. Também tem talento para negócios familiares e imobiliário.",
    health: "Câncer governa o estômago e o peito. Problemas digestivos são comuns em momentos de estresse emocional. Alimentação equilibrada e tempo em casa são essenciais.",
    compatibility: ["Escorpião", "Peixes", "Touro", "Virgem"],
  },
  {
    slug: "leao", name: "Leão", emoji: "♌", element: "Fogo", elementEmoji: "🔥",
    quality: "Fixo", ruler: "Sol", dateRange: "23 de julho a 22 de agosto", symbol: "O Leão",
    description: "Leão é o signo do brilho e da autoexpressão. Pessoas de Leão são generosas, criativas e naturalmente magnéticas. Adoram ser o centro das atenções e inspirar os outros com sua energia.",
    traits: ["Generoso", "Criativo", "Confiante", "Magnético", "Dramático", "Leal"],
    love: "No amor, Leão é romântico e grandioso. Gosta de demonstrações de afeto e precisa se sentir admirado. Quando ama, é extremamente leal e protetor.",
    career: "Na carreira, Leão brilha em posições de destaque: artes, entretenimento, liderança, moda. Precisa de reconhecimento e liberdade criativa para dar o seu melhor.",
    health: "Leão governa o coração e as costas. Exercícios cardiovasculares e atividades que tragam prazer são essenciais. O estresse afeta diretamente o coração.",
    compatibility: ["Áries", "Sagitário", "Gêmeos", "Libra"],
  },
  {
    slug: "virgem", name: "Virgem", emoji: "♍", element: "Terra", elementEmoji: "🌍",
    quality: "Mutável", ruler: "Mercúrio", dateRange: "23 de agosto a 22 de setembro", symbol: "A Virgem",
    description: "Virgem é o signo da análise e do serviço. Pessoas de Virgem são detalhistas, organizadas e têm um desejo genuíno de ajudar. Sua mente analítica vê o que outros não veem.",
    traits: ["Detalhista", "Organizado", "Analítico", "Prestativo", "Perfeccionista", "Prático"],
    love: "No amor, Virgem demonstra cuidado através de atos de serviço. Pode parecer reservado, mas quando se abre, é um parceiro dedicado e atencioso. Valoriza qualidade sobre quantidade.",
    career: "Na carreira, Virgem brilha em áreas que exigem precisão: saúde, ciência, edição, análise de dados. É o profissional que todo time precisa — confiável e meticuloso.",
    health: "Virgem governa o sistema digestivo. Alimentação saudável e rotina são fundamentais. Tende a somatizar preocupações — técnicas de relaxamento são importantes.",
    compatibility: ["Touro", "Capricórnio", "Câncer", "Escorpião"],
  },
  {
    slug: "libra", name: "Libra", emoji: "♎", element: "Ar", elementEmoji: "💨",
    quality: "Cardinal", ruler: "Vênus", dateRange: "23 de setembro a 22 de outubro", symbol: "A Balança",
    description: "Libra é o signo do equilíbrio e da harmonia. Pessoas de Libra são diplomáticas, justas e apreciam a beleza em todas as suas formas. Buscam paz e equilíbrio em tudo que fazem.",
    traits: ["Diplomático", "Justo", "Charmoso", "Indeciso", "Harmonioso", "Sociável"],
    love: "No amor, Libra é o signo do romance por excelência. Adora a ideia do amor e busca um parceiro que seja também melhor amigo. Precisa de equilíbrio entre dar e receber.",
    career: "Na carreira, Libra brilha em áreas que envolvem estética e mediação: direito, design, diplomacia, moda. Trabalha melhor em parceria do que sozinho.",
    health: "Libra governa os rins e a região lombar. Equilíbrio é a palavra-chave — tanto na alimentação quanto no estilo de vida. Atividades em dupla motivam mais.",
    compatibility: ["Gêmeos", "Aquário", "Leão", "Sagitário"],
  },
  {
    slug: "escorpiao", name: "Escorpião", emoji: "♏", element: "Água", elementEmoji: "💧",
    quality: "Fixo", ruler: "Plutão", dateRange: "23 de outubro a 21 de novembro", symbol: "O Escorpião",
    description: "Escorpião é o signo da transformação e da intensidade. Pessoas de Escorpião são profundas, magnéticas e não têm medo de mergulhar nas sombras. Sua força interior é incomparável.",
    traits: ["Intenso", "Magnético", "Determinado", "Misterioso", "Leal", "Transformador"],
    love: "No amor, Escorpião é tudo ou nada. Ama com uma intensidade que pode assustar, mas sua lealdade é inabalável. Precisa de confiança total — traição é imperdoável.",
    career: "Na carreira, Escorpião brilha em áreas que exigem investigação e profundidade: psicologia, pesquisa, finanças, medicina. Tem talento para descobrir o que está escondido.",
    health: "Escorpião governa os órgãos reprodutivos. Questões emocionais reprimidas podem afetar a saúde. Terapia e atividades de transformação (como artes marciais) são benéficas.",
    compatibility: ["Câncer", "Peixes", "Virgem", "Capricórnio"],
  },
  {
    slug: "sagitario", name: "Sagitário", emoji: "♐", element: "Fogo", elementEmoji: "🔥",
    quality: "Mutável", ruler: "Júpiter", dateRange: "22 de novembro a 21 de dezembro", symbol: "O Arqueiro",
    description: "Sagitário é o signo da expansão e da liberdade. Pessoas de Sagitário são otimistas, aventureiras e buscam sentido na vida. Sua energia contagiante inspira todos ao redor.",
    traits: ["Otimista", "Aventureiro", "Filosófico", "Honesto", "Inquieto", "Generoso"],
    love: "No amor, Sagitário precisa de liberdade e aventura. Não suporta rotina nem possessividade. Quando encontra alguém que compartilha sua sede de viver, é um parceiro divertido e leal.",
    career: "Na carreira, Sagitário brilha em áreas que envolvem viagem, ensino, filosofia e empreendedorismo. Precisa de propósito — trabalhar só por dinheiro não funciona.",
    health: "Sagitário governa os quadris e coxas. Esportes ao ar livre e atividades de aventura são ideais. Tende a exagerar — moderação é o desafio.",
    compatibility: ["Áries", "Leão", "Libra", "Aquário"],
  },
  {
    slug: "capricornio", name: "Capricórnio", emoji: "♑", element: "Terra", elementEmoji: "🌍",
    quality: "Cardinal", ruler: "Saturno", dateRange: "22 de dezembro a 19 de janeiro", symbol: "A Cabra",
    description: "Capricórnio é o signo da ambição e da disciplina. Pessoas de Capricórnio são responsáveis, determinadas e constroem seu sucesso tijolo por tijolo. Sua paciência e persistência são admiráveis.",
    traits: ["Ambicioso", "Disciplinado", "Responsável", "Paciente", "Reservado", "Prático"],
    love: "No amor, Capricórnio é sério e comprometido. Pode demorar para se abrir, mas quando o faz, é um parceiro sólido como rocha. Demonstra amor através de estabilidade e ações concretas.",
    career: "Na carreira, Capricórnio é o CEO nato. Brilha em administração, finanças, engenharia e qualquer área que exija planejamento de longo prazo. Sobe devagar, mas chega ao topo.",
    health: "Capricórnio governa os ossos e joelhos. Cálcio e exercícios de fortalecimento são importantes. Tende a carregar o peso do mundo — aprender a delegar é essencial.",
    compatibility: ["Touro", "Virgem", "Escorpião", "Peixes"],
  },
  {
    slug: "aquario", name: "Aquário", emoji: "♒", element: "Ar", elementEmoji: "💨",
    quality: "Fixo", ruler: "Urano", dateRange: "20 de janeiro a 18 de fevereiro", symbol: "O Aguadeiro",
    description: "Aquário é o signo da inovação e da humanidade. Pessoas de Aquário são originais, independentes e pensam no coletivo. Sua visão de futuro e desejo de mudar o mundo são inspiradores.",
    traits: ["Inovador", "Independente", "Humanitário", "Original", "Rebelde", "Intelectual"],
    love: "No amor, Aquário precisa de amizade primeiro. Não suporta possessividade e valoriza a individualidade dentro do relacionamento. Quando ama, é leal — mas do seu jeito único.",
    career: "Na carreira, Aquário brilha em tecnologia, ciência, ativismo e qualquer área que envolva inovação. Prefere trabalhar por uma causa do que por status.",
    health: "Aquário governa a circulação e os tornozelos. Atividades em grupo e esportes coletivos são ideais. Precisa de estímulo mental — tédio é o maior inimigo da saúde.",
    compatibility: ["Gêmeos", "Libra", "Áries", "Sagitário"],
  },
  {
    slug: "peixes", name: "Peixes", emoji: "♓", element: "Água", elementEmoji: "💧",
    quality: "Mutável", ruler: "Netuno", dateRange: "19 de fevereiro a 20 de março", symbol: "Os Peixes",
    description: "Peixes é o signo da intuição e da compaixão. Pessoas de Peixes são sensíveis, criativas e têm uma conexão profunda com o mundo espiritual. Sua empatia é um dom — e às vezes um desafio.",
    traits: ["Intuitivo", "Compassivo", "Criativo", "Sonhador", "Sensível", "Espiritual"],
    love: "No amor, Peixes é o mais romântico do zodíaco. Ama incondicionalmente e se entrega de corpo e alma. Precisa de um parceiro que valorize sua sensibilidade sem se aproveitar dela.",
    career: "Na carreira, Peixes brilha em artes, música, cinema, espiritualidade e cuidado. Tem talento para profissões que exigem empatia e criatividade. Precisa de um ambiente harmonioso.",
    health: "Peixes governa os pés e o sistema linfático. Atividades aquáticas são ideais. Tende a absorver energias alheias — limites emocionais e tempo sozinho são essenciais.",
    compatibility: ["Câncer", "Escorpião", "Touro", "Capricórnio"],
  },
];
