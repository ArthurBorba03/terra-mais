import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { name: 'Flores', slug: 'flores', description: 'Flores frescas e perfumadas para todos os momentos', icon: '🌸', sortOrder: 1 },
  { name: 'Buquês', slug: 'buques', description: 'Buquês especiais para surpreender quem você ama', icon: '💐', sortOrder: 2 },
  { name: 'Rosas', slug: 'rosas', description: 'As mais belas rosas nacionais e importadas', icon: '🌹', sortOrder: 3 },
  { name: 'Plantas', slug: 'plantas', description: 'Plantas naturais para decorar seu espaço', icon: '🌿', sortOrder: 4 },
  { name: 'Vasos', slug: 'vasos', description: 'Vasos decorativos e funcionais para suas plantas', icon: '🪴', sortOrder: 5 },
  { name: 'Terra e Substratos', slug: 'terra-substratos', description: 'Terra e substratos de qualidade para suas plantas', icon: '🌱', sortOrder: 6 },
  { name: 'Adubos', slug: 'adubos', description: 'Adubos e fertilizantes para plantas saudáveis', icon: '🧪', sortOrder: 7 },
  { name: 'Jardinagem', slug: 'jardinagem', description: 'Ferramentas e acessórios para jardinagem', icon: '🪚', sortOrder: 8 },
  { name: 'Presentes', slug: 'presentes', description: 'Presentes especiais para todas as ocasiões', icon: '🎁', sortOrder: 9 },
  { name: 'Cestas', slug: 'cestas', description: 'Cestas decorativas com flores e itens especiais', icon: '🧺', sortOrder: 10 },
]

const flowerProducts = [
  { name: 'Girassol Unidade', slug: 'girassol-unidade', description: 'Girassol fresco de alta qualidade, símbolo de alegria e energia positiva. Perfeito para iluminar qualquer ambiente.', price: 8.90, images: ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600'], isFeatured: true, isNew: true },
  { name: 'Lírio Branco Unidade', slug: 'lirio-branco-unidade', description: 'Lírio branco elegante, símbolo de pureza e sofisticação. Ideal para presentes e decoração.', price: 12.90, images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600'] },
  { name: 'Gérbera Colorida', slug: 'gerbera-colorida', description: 'Gérbera colorida vibrante, disponível em diversas cores alegres. Traz vida e cor para qualquer ambiente.', price: 6.50, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isNew: true },
  { name: 'Tulipa Holandesa', slug: 'tulipa-holandesa', description: 'Tulipa importada da Holanda, com pétalas perfeitas e coloração intensa. Uma flor sofisticada para ocasiões especiais.', price: 18.90, comparePrice: 24.90, images: ['https://images.unsplash.com/photo-1596738943038-41e5f5b26099?w=600'], isPromotion: true },
  { name: 'Orquídea Phalaenopsis', slug: 'orquidea-phalaenopsis', description: 'Orquídea Phalaenopsis de alto padrão, com flores duradouras e elegantes. Presente perfeito para quem aprecia sofisticação.', price: 89.90, images: ['https://images.unsplash.com/photo-1566907225477-1f3ba2a26e3f?w=600'], isFeatured: true, isBestseller: true },
  { name: 'Antúrio Vermelho', slug: 'anturio-vermelho', description: 'Antúrio vermelho vibrante, planta tropical de longa duração. Símbolo de hospitalidade e amor.', price: 35.90, images: ['https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600'] },
  { name: 'Crisântemo Branco', slug: 'crisantemo-branco', description: 'Crisântemo branco clássico, com pétalas delicadas e duradouras. Muito versátil para arranjos e decorações.', price: 9.90, images: ['https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600'] },
  { name: 'Lavanda Francesa', slug: 'lavanda-francesa', description: 'Lavanda francesa aromática e delicada. Traz tranquilidade e perfume suave para qualquer espaço.', price: 22.90, images: ['https://images.unsplash.com/photo-1499744937866-d7e566a20a61?w=600'], isNew: true },
  { name: 'Peônia Rosa', slug: 'peonia-rosa', description: 'Peônia rosa exuberante com pétalas em camadas. Uma das flores mais amadas do mundo, símbolo de romance e prosperidade.', price: 32.90, comparePrice: 39.90, images: ['https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600'], isPromotion: true },
  { name: 'Amarilis Vermelha', slug: 'amarilis-vermelha', description: 'Amarilis de um vermelho intenso e impressionante. Flor de grande impacto visual, perfeita para presentes especiais.', price: 28.90, images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc52?w=600'] },
  { name: 'Calla Lily Branca', slug: 'calla-lily-branca', description: 'Calla Lily branca clássica, símbolo de elegância e pureza. Muito utilizada em casamentos e eventos especiais.', price: 24.90, images: ['https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600'], isFeatured: true },
  { name: 'Freesia Amarela', slug: 'freesia-amarela', description: 'Freesia amarela com perfume suave e agradável. Flores delicadas que trazem alegria e leveza.', price: 15.90, images: ['https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600'] },
  { name: 'Bromélia Tropical', slug: 'bromelia-tropical', description: 'Bromélia tropical vibrante, planta robusta e de fácil cuidado. Traz o clima tropical para dentro de casa.', price: 45.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'] },
  { name: 'Violeta Africana', slug: 'violeta-africana', description: 'Violeta africana delicada, com flores pequenas e encantadoras. Ideal para ambientes internos com pouca luz.', price: 19.90, images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc52?w=600'], isNew: true },
  { name: 'Hortênsia Azul', slug: 'hortencia-azul', description: 'Hortênsia azul deslumbrante, com grandes inflorescências. Uma das flores mais elegantes para decoração de interiores.', price: 38.90, images: ['https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600'], isBestseller: true },
  { name: 'Ranúnculo Colorido', slug: 'ranunculo-colorido', description: 'Ranúnculo com pétalas em camadas e cores vibrantes. Flor delicada e sofisticada para presentes especiais.', price: 16.90, images: ['https://images.unsplash.com/photo-1596738943038-41e5f5b26099?w=600'] },
  { name: 'Dália Bicolor', slug: 'dalia-bicolor', description: 'Dália bicolor impressionante, com pétalas geométricas e simétricas. Uma das flores mais elaboradas da natureza.', price: 21.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'] },
  { name: 'Íris Roxa', slug: 'iris-roxa', description: 'Íris roxa majestosa, símbolo de sabedoria e royalty. Flor de impacto visual com significado especial.', price: 17.90, comparePrice: 22.90, images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f28?w=600'], isPromotion: true },
  { name: 'Margarida Branca', slug: 'margarida-branca', description: 'Margarida branca clássica e encantadora. Símbolo de simplicidade e alegria, perfeita para qualquer ocasião.', price: 7.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'] },
  { name: 'Lisianto Lilás', slug: 'lisianto-lilas', description: 'Lisianto lilás delicado, com aspecto semelhante à rosa. Flor elegante e versátil para arranjos e presentear.', price: 13.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isNew: true },
]

const bouquetProducts = [
  { name: 'Buquê de 12 Rosas Vermelhas', slug: 'buque-12-rosas-vermelhas', description: 'Buquê clássico com 12 rosas vermelhas nacionais, embalagem luxuosa em papel kraft e laço de cetim. O presente perfeito para declarar amor.', price: 149.90, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], isFeatured: true, isBestseller: true, allowExtras: true },
  { name: 'Buquê Mix Tropical', slug: 'buque-mix-tropical', description: 'Buquê colorido com flores tropicais variadas: helicônia, ginger, ave-do-paraíso e folhagens exóticas. Alegre e impactante.', price: 189.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isFeatured: true, allowExtras: true },
  { name: 'Buquê de Girassóis', slug: 'buque-girassois', description: 'Buquê alegre com 10 girassóis frescos, acompanhados de folhagens verdes. Símbolo de felicidade e energia positiva.', price: 129.90, images: ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600'], isBestseller: true, allowExtras: true },
  { name: 'Buquê Romântico Rosa', slug: 'buque-romantico-rosa', description: 'Buquê delicado com rosas cor-de-rosa, lisianto e baby breath. Embalagem em papel vegetal com laço de fita.', price: 159.90, comparePrice: 189.90, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], isPromotion: true, allowExtras: true },
  { name: 'Buquê de Orquídeas', slug: 'buque-orquideas', description: 'Buquê luxuoso com orquídeas Phalaenopsis brancas e folhagens exóticas. Sofisticação e elegância para momentos especiais.', price: 289.90, images: ['https://images.unsplash.com/photo-1566907225477-1f3ba2a26e3f?w=600'], isFeatured: true, allowExtras: true },
  { name: 'Buquê Campestre', slug: 'buque-campestre', description: 'Buquê rústico com mix de flores do campo: margaridas, lavanda, sempre-viva e folhagens naturais. Charme e autenticidade.', price: 99.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isNew: true, allowExtras: true },
  { name: 'Buquê Peônias Premium', slug: 'buque-peonias-premium', description: 'Buquê exclusivo com peônias rosas importadas e folhagens de eucalipto. Sofisticado e perfumado, ideal para ocasiões especiais.', price: 349.90, images: ['https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600'], isFeatured: true, allowExtras: true },
  { name: 'Buquê Surpresa Colorido', slug: 'buque-surpresa-colorido', description: 'Buquê colorido com seleção diária das flores mais frescas e bonitas disponíveis. Uma surpresa cheia de flores!', price: 89.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isNew: true, allowExtras: true },
  { name: 'Buquê de 24 Rosas Bicolor', slug: 'buque-24-rosas-bicolor', description: 'Imponente buquê com 24 rosas bicolor, combinando vermelho e branco. Uma declaração de amor grandioso e inesquecível.', price: 259.90, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], isBestseller: true, allowExtras: true },
  { name: 'Buquê de Lavanda e Eucalipto', slug: 'buque-lavanda-eucalipto', description: 'Buquê aromático e elegante com lavanda francesa, ramos de eucalipto e flores brancas. Perfumado e sofisticado.', price: 139.90, images: ['https://images.unsplash.com/photo-1499744937866-d7e566a20a61?w=600'], allowExtras: true },
]

const rosaProducts = [
  { name: 'Rosa Vermelha Nacional', slug: 'rosa-vermelha-nacional', description: 'Rosa vermelha nacional de primeira qualidade, com haste longa e botão bem formado. Símbolo clássico do amor eterno.', price: 11.90, images: ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600'], isBestseller: true },
  { name: 'Rosa Branca Premium', slug: 'rosa-branca-premium', description: 'Rosa branca de alta qualidade, com pétalas perfeitas e perfume delicado. Elegância e pureza em uma única flor.', price: 14.90, images: ['https://images.unsplash.com/photo-1559563458-527698bf5295?w=600'], isFeatured: true },
  { name: 'Rosa Rosa Importada', slug: 'rosa-rosa-importada', description: 'Rosa cor-de-rosa importada com botão grande e cor intensa. Representa carinho, gratidão e admiração.', price: 18.90, images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc52?w=600'] },
  { name: 'Rosa Amarela da Paz', slug: 'rosa-amarela-paz', description: 'Rosa amarela vibrante, símbolo de amizade e alegria. Perfeita para presentear amigos especiais.', price: 12.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'], isNew: true },
  { name: 'Rosa Laranja Pôr do Sol', slug: 'rosa-laranja-por-do-sol', description: 'Rosa laranja vibrante com tons que lembram o pôr do sol. Representa entusiasmo, paixão e energia positiva.', price: 15.90, comparePrice: 19.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'], isPromotion: true },
  { name: 'Rosa Roxa Encanto', slug: 'rosa-roxa-encanto', description: 'Rosa roxa exótica e fascinante, representando encantamento e mistério. Uma escolha única e marcante.', price: 19.90, images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc52?w=600'], isFeatured: true },
  { name: 'Dúzia de Rosas Vermelhas', slug: 'duzia-rosas-vermelhas', description: 'A clássica dúzia de rosas vermelhas nacionais, com hastes longas e botões perfeitos. O presente mais romântico de todos.', price: 129.90, images: ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600'], isBestseller: true, isFeatured: true, allowExtras: true },
  { name: 'Rosa Bicolor Charme', slug: 'rosa-bicolor-charme', description: 'Rosa bicolor com pétalas de duas cores, criando um efeito visual único e deslumbrante. Rara e especial.', price: 21.90, images: ['https://images.unsplash.com/photo-1559563458-527698bf5295?w=600'], isNew: true },
]

const plantProducts = [
  { name: 'Ficus Lyrata (Figueira Lira)', slug: 'ficus-lyrata', description: 'Ficus Lyrata imponente com folhas grandes e decorativas. A planta mais desejada para decoração de interiores modernos.', price: 189.90, images: ['https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=600'], isFeatured: true, isBestseller: true },
  { name: 'Costela de Adão', slug: 'costela-de-adao', description: 'Monstera deliciosa com folhas recortadas únicas. Símbolo do estilo tropical chic, perfeita para ambientes amplos.', price: 79.90, images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600'], isBestseller: true },
  { name: 'Suculenta Coleção Mix', slug: 'suculenta-colecao-mix', description: 'Conjunto com 3 suculentas variadas em mini vasos. Plantas resistentes e decorativas, perfeitas para iniciantes.', price: 49.90, images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'], isNew: true },
  { name: 'Palmeira Rafia', slug: 'palmeira-rafia', description: 'Palmeira Rafia elegante que traz o charme tropical para qualquer ambiente. Crescimento moderado e fácil manutenção.', price: 149.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'] },
  { name: 'Clorofito (Fitônia Verde)', slug: 'clorofito-fitonia-verde', description: 'Fitônia com folhas verdes decorativas e crescimento rápido. Excelente para pendurar ou decorar prateleiras.', price: 35.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Zamioculca', slug: 'zamioculca', description: 'Zamioculca resistente e elegante, com folhas brilhantes em verde profundo. Suporta ambientes com pouca luz e umidade.', price: 59.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isFeatured: true },
  { name: 'Jiboinha', slug: 'jiboinha', description: 'Jiboinha versátil e resistente, com folhas variegadas verdes e amarelas. Perfeita para ambientes internos ou trepadeira.', price: 29.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true },
  { name: 'Bonsai Ficus', slug: 'bonsai-ficus', description: 'Bonsai de Ficus com forma trabalhada artesanalmente. Arte japonesa que combina paciência e beleza natural.', price: 249.90, comparePrice: 299.90, images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600'], isPromotion: true, isFeatured: true },
  { name: 'Dracena Vermelha', slug: 'dracena-vermelha', description: 'Dracena com folhas avermelhadas e bordas verdes, muito decorativa e resistente. Purifica o ar do ambiente.', price: 65.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Helicônia', slug: 'heliconia', description: 'Helicônia tropical exuberante com flores coloridas em formato de lagosta. Transforma qualquer espaço com tropicalidade.', price: 89.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'], isNew: true },
  { name: 'Árvore da Felicidade', slug: 'arvore-da-felicidade', description: 'Radermachera sinica, a árvore da felicidade, com folhagem delicada e crescimento elegante. Traz harmonia ao ambiente.', price: 120.90, images: ['https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=600'] },
  { name: 'Espada de São Jorge', slug: 'espada-de-sao-jorge', description: 'Planta protetora e purificadora do ar, com folhas eretas e resistentes. Muito utilizada no jardim e em ambientes internos.', price: 45.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true },
  { name: 'Cacto Coluna', slug: 'cacto-coluna', description: 'Cacto coluna imponente, com crescimento vertical e baixa necessidade de água. Elemento decorativo para ambientes modernos.', price: 38.90, images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'] },
  { name: 'Avenca Delicada', slug: 'avenca-delicada', description: 'Avenca com folhagem verde delicada e textura única. Perfeita para banheiros e locais com umidade e pouca luz.', price: 22.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Begônia Florífera', slug: 'begonia-florifera', description: 'Begônia com flores abundantes em tons de rosa e branco. Muito decorativa e com floração contínua durante boa parte do ano.', price: 32.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isNew: true },
  { name: 'Imbé (Philodendron)', slug: 'imbe-philodendron', description: 'Philodendron com folhas grandes e brilhantes, muito decorativo e resistente. Perfeito para ambientes com luz indireta.', price: 55.90, images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600'] },
  { name: 'Cactus Bola', slug: 'cactus-bola', description: 'Cacto bola curioso e decorativo, com espinhos delicados e formato compacto. Mínima manutenção, máxima beleza.', price: 19.90, images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'] },
  { name: 'Palmeira Areca', slug: 'palmeira-areca', description: 'Palmeira Areca com várias hastes elegantes e folhas plumosas. Uma das melhores plantas para purificar o ar de interiores.', price: 175.90, comparePrice: 210.90, images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'], isPromotion: true, isFeatured: true },
  { name: 'Orquídea Vanda Azul', slug: 'orquidea-vanda-azul', description: 'Raridade! Orquídea Vanda com flores em tons de azul e roxo. Uma das orquídeas mais exóticas e desejadas do mundo.', price: 320.90, images: ['https://images.unsplash.com/photo-1566907225477-1f3ba2a26e3f?w=600'], isFeatured: true },
  { name: 'Planta Carnívora Dioneia', slug: 'planta-carnivora-dioneia', description: 'A famosa Venus Fly Trap! Planta carnívora fascinante que captura insetos com suas folhas armadilha. Curiosidade da natureza.', price: 42.90, images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'], isNew: true },
]

const vasoProducts = [
  { name: 'Vaso Cerâmica Artesanal Verde', slug: 'vaso-ceramica-artesanal-verde', description: 'Vaso de cerâmica artesanal em tons de verde, com acabamento rústico e elegante. Peça única feita à mão por artesãos locais.', price: 89.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isFeatured: true },
  { name: 'Vaso Concreto Moderno', slug: 'vaso-concreto-moderno', description: 'Vaso de concreto com design minimalista e moderno. Perfeito para suculentas e cactos em ambientes contemporâneos.', price: 65.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'] },
  { name: 'Vaso Macramê Suspenso', slug: 'vaso-macrame-suspenso', description: 'Vaso suspenso em macramê artesanal, acompanha vaso de barro. Perfeito para decorar janelas e varandas.', price: 79.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isNew: true },
  { name: 'Vaso Terracota Grande', slug: 'vaso-terracota-grande', description: 'Vaso de terracota natural, tamanho grande (40cm). Material poroso ideal para a saúde das raízes das plantas.', price: 45.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isBestseller: true },
  { name: 'Vaso Madeira Rústico', slug: 'vaso-madeira-rustico', description: 'Vaso de madeira tratada com efeito rústico. Peça decorativa que combina natureza e elegância em qualquer ambiente.', price: 119.90, comparePrice: 149.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isPromotion: true },
  { name: 'Vaso Plástico Premium', slug: 'vaso-plastico-premium', description: 'Vaso de plástico resistente com sistema de auto-irrigação. Prático e funcional, ideal para plantas de interior.', price: 35.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'] },
  { name: 'Cachepô Metálico Dourado', slug: 'cachepo-metalico-dourado', description: 'Cachepô metálico com acabamento dourado, design sofisticado. Eleva qualquer planta ao nível de objeto de decoração.', price: 95.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isFeatured: true },
  { name: 'Vaso Fibra de Vidro Oval', slug: 'vaso-fibra-vidro-oval', description: 'Vaso de fibra de vidro em formato oval, leve e resistente. Ideal para plantas grandes em áreas externas.', price: 189.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'] },
  { name: 'Jardim Vertical Kit', slug: 'jardim-vertical-kit', description: 'Kit completo para jardim vertical com 6 vasos modulares e sistema de fixação. Monte seu jardim na parede!', price: 249.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isNew: true, isFeatured: true },
  { name: 'Vaso Bambu Natural', slug: 'vaso-bambu-natural', description: 'Vaso ecológico feito de bambu natural sustentável. Beleza natural e respeito ao meio ambiente em um único produto.', price: 55.90, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], isNew: true },
]

const aduboProducts = [
  { name: 'Adubo NPK 10-10-10 1kg', slug: 'adubo-npk-10-10-10-1kg', description: 'Adubo granulado balanceado NPK 10-10-10 para uso geral. Promove crescimento saudável e vigoroso de todas as plantas.', price: 24.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Fertilizante Líquido Flores', slug: 'fertilizante-liquido-flores', description: 'Fertilizante líquido concentrado especialmente formulado para plantas com flores. Estimula a floração abundante e colorida.', price: 32.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true },
  { name: 'Húmus de Minhoca Premium', slug: 'humus-minhoca-premium', description: 'Húmus de minhoca de alta qualidade, rico em nutrientes orgânicos. O adubo natural mais completo para suas plantas.', price: 28.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isNew: true },
  { name: 'Adubo Osmocote 3 Meses', slug: 'adubo-osmocote-3-meses', description: 'Fertilizante de liberação lenta Osmocote com duração de 3 meses. Uma aplicação garante nutrição completa por todo o período.', price: 45.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Calcário Dolomítico 2kg', slug: 'calcario-dolomitico-2kg', description: 'Calcário dolomítico para correção do pH do solo. Essencial para otimizar a absorção de nutrientes pelas plantas.', price: 18.90, comparePrice: 24.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isPromotion: true },
  { name: 'Bokashi Orgânico 500g', slug: 'bokashi-organico-500g', description: 'Bokashi orgânico fermentado, rico em microrganismos benéficos. Melhora a qualidade do solo e estimula o crescimento.', price: 22.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Esterco Bovino Compostado', slug: 'esterco-bovino-compostado', description: 'Esterco bovino compostado e higienizado, rico em matéria orgânica. Melhora a estrutura e fertilidade do solo.', price: 15.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true },
  { name: 'Adubo Foliar Concentrado', slug: 'adubo-foliar-concentrado', description: 'Fertilizante foliar de absorção rápida via folhas. Ideal para reposição rápida de nutrientes e situações de emergência.', price: 38.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isNew: true },
  { name: 'NPK para Orquídeas', slug: 'npk-para-orquideas', description: 'Fertilizante específico para orquídeas com formulação balanceada. Garante floração exuberante e crescimento saudável.', price: 42.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Superfosfato Simples 1kg', slug: 'superfosfato-simples-1kg', description: 'Superfosfato simples para estimular o desenvolvimento radicular. Essencial para transplantes e formação de raízes fortes.', price: 19.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
]

const jardinagemProducts = [
  { name: 'Kit Ferramentas Jardim 5 Peças', slug: 'kit-ferramentas-jardim-5-pecas', description: 'Kit completo com 5 ferramentas essenciais: pá, ancinho, transplantador, podador e garfo. Para jardinagem iniciante e avançada.', price: 89.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true, isFeatured: true },
  { name: 'Regador 5 Litros', slug: 'regador-5-litros', description: 'Regador de plástico resistente com bico longo, capacidade de 5 litros. Ergonômico e prático para regar plantas de qualquer tamanho.', price: 45.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Tesoura Poda Profissional', slug: 'tesoura-poda-profissional', description: 'Tesoura de poda em aço inoxidável com cabo antiderrapante. Ideal para podas de precisão em flores, arbustos e plantas.', price: 65.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isBestseller: true },
  { name: 'Luvas Jardinagem Premium', slug: 'luvas-jardinagem-premium', description: 'Luvas de jardinagem impermeáveis com revestimento antiderrapante. Proteção e conforto para trabalhar no jardim.', price: 35.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isNew: true },
  { name: 'Pulverizador 2 Litros', slug: 'pulverizador-2-litros', description: 'Pulverizador manual de pressão com capacidade de 2 litros. Ideal para aplicação de fertilizantes foliares e defensivos.', price: 38.90, comparePrice: 49.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isPromotion: true },
  { name: 'Enxada de Cabo Longo', slug: 'enxada-cabo-longo', description: 'Enxada resistente com cabo longo em madeira tratada. Ferramenta indispensável para capina e preparação do solo.', price: 55.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Mangueira Jardim 20m', slug: 'mangueira-jardim-20m', description: 'Mangueira de jardim flexível de 20 metros com esguicho regulável. Alta resistência e longa durabilidade para uso intenso.', price: 79.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Tela Sombrite 50%', slug: 'tela-sombrite-50', description: 'Tela de sombreamento 50% em malha de polietileno. Protege plantas sensíveis do sol excessivo e reduz temperatura.', price: 48.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isNew: true },
  { name: 'Pedra Brita Decorativa', slug: 'pedra-brita-decorativa', description: 'Pedra brita decorativa colorida para cobertura de vasos e jardins. Estética e funcional para drenagem e decoração.', price: 29.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'] },
  { name: 'Suporte Plantas Parede', slug: 'suporte-plantas-parede', description: 'Suporte metálico para pendurar plantas na parede. Design moderno e resistente para criar jardins verticais elegantes.', price: 42.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isNew: true },
]

const presenteProducts = [
  { name: 'Cesta Presente Flores e Chocolates', slug: 'cesta-presente-flores-chocolates', description: 'Cesta luxuosa com arranjo de flores frescas, chocolates belgas e laço decorativo. O presente perfeito para qualquer ocasião especial.', price: 229.90, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'], isFeatured: true, isBestseller: true, allowExtras: true },
  { name: 'Arranjo Mesa Corporativo', slug: 'arranjo-mesa-corporativo', description: 'Arranjo elegante para mesa corporativa com flores selecionadas e vaso premium. Sofisticação para ambientes de trabalho.', price: 189.90, images: ['https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=600'], isFeatured: true, allowExtras: true },
  { name: 'Planta + Vaso Presente', slug: 'planta-vaso-presente', description: 'Combinação perfeita: planta selecionada em vaso decorativo personalizado. Presente que dura e traz alegria por muito tempo.', price: 149.90, images: ['https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=600'], allowExtras: true },
  { name: 'Box Jardim em Casa', slug: 'box-jardim-em-casa', description: 'Kit completo para jardim doméstico: 3 plantas, substrato, vaso e mini ferramentas. O presente ideal para quem ama plantas.', price: 199.90, comparePrice: 249.90, images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'], isPromotion: true, isNew: true, allowExtras: true },
]

const cestaProducts = [
  { name: 'Cesta Café da Manhã Floral', slug: 'cesta-cafe-manha-floral', description: 'Cesta especial com flores frescas, café premium, bolos artesanais, frutas selecionadas e itens gourmets. Um café da manhã inesquecível.', price: 299.90, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'], isFeatured: true, isBestseller: true, allowExtras: true },
  { name: 'Cesta Dia das Mães Premium', slug: 'cesta-dia-maes-premium', description: 'Cesta especial Dia das Mães com buquê de flores, chocolates, perfume e cartão personalizado. Para mãe, só o melhor!', price: 389.90, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'], isFeatured: true, allowExtras: true },
  { name: 'Cesta Bebê Flores', slug: 'cesta-bebe-flores', description: 'Cesta temática para bebês com flores delicadas, pelúcia, kit higiene e mimo especial. Para celebrar uma nova vida!', price: 259.90, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'], isNew: true, allowExtras: true },
  { name: 'Cesta Gourmet e Flores', slug: 'cesta-gourmet-flores', description: 'Cesta com seleção de flores frescas e produtos gourmet: queijos, geleias, vinhos, chocolates e biscoitos artesanais.', price: 449.90, comparePrice: 499.90, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'], isPromotion: true, isFeatured: true, allowExtras: true },
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar admin
  const hashedPassword = await bcrypt.hash('admin123@TM', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@terramais.com.br' },
    update: {},
    create: {
      name: 'Administrador Terra Mais',
      email: 'admin@terramais.com.br',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar categorias
  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories[cat.slug] = created.id
  }
  console.log('✅ Categorias criadas:', Object.keys(createdCategories).length)

  // Criar produtos - flores
  for (const p of flowerProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['flores'], stock: Math.floor(Math.random() * 50) + 10 },
    })
  }

  // Criar produtos - buques
  for (const p of bouquetProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['buques'], stock: Math.floor(Math.random() * 30) + 5 },
    })
  }

  // Criar produtos - rosas
  for (const p of rosaProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['rosas'], stock: Math.floor(Math.random() * 100) + 20 },
    })
  }

  // Criar produtos - plantas
  for (const p of plantProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['plantas'], stock: Math.floor(Math.random() * 40) + 5 },
    })
  }

  // Criar produtos - vasos
  for (const p of vasoProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['vasos'], stock: Math.floor(Math.random() * 25) + 5 },
    })
  }

  // Criar produtos - adubos
  for (const p of aduboProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['adubos'], stock: Math.floor(Math.random() * 60) + 20 },
    })
  }

  // Criar produtos - jardinagem
  for (const p of jardinagemProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['jardinagem'], stock: Math.floor(Math.random() * 40) + 10 },
    })
  }

  // Criar produtos - presentes
  for (const p of presenteProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['presentes'], stock: Math.floor(Math.random() * 20) + 5 },
    })
  }

  // Criar produtos - cestas
  for (const p of cestaProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, categoryId: createdCategories['cestas'], stock: Math.floor(Math.random() * 15) + 5 },
    })
  }

  const totalProducts = flowerProducts.length + bouquetProducts.length + rosaProducts.length +
    plantProducts.length + vasoProducts.length + aduboProducts.length +
    jardinagemProducts.length + presenteProducts.length + cestaProducts.length
  console.log('✅ Produtos criados:', totalProducts)

  // Criar cupons
  await prisma.coupon.upsert({
    where: { code: 'TERRAMAIS10' },
    update: {},
    create: { code: 'TERRAMAIS10', description: '10% de desconto em qualquer pedido', type: 'PERCENTAGE', value: 10, minAmount: 100, isActive: true },
  })
  await prisma.coupon.upsert({
    where: { code: 'BEMVINDO' },
    update: {},
    create: { code: 'BEMVINDO', description: 'R$20 de desconto na primeira compra', type: 'FIXED', value: 20, minAmount: 80, isActive: true },
  })
  console.log('✅ Cupons criados')

  // Criar configurações do site
  const settings = [
    { key: 'whatsapp', value: '5551992332327', description: 'Número WhatsApp' },
    { key: 'instagram', value: 'floriculturaterramais', description: 'Instagram handle' },
    { key: 'phone', value: '(51) 9 9233-2327', description: 'Telefone loja' },
    { key: 'address', value: 'Avenida Marechal Rondon, 3742 - Vila Fátima, Cachoeirinha - RS', description: 'Endereço' },
    { key: 'business_hours', value: 'Seg-Sáb: 9h às 18h | Dom: Fechados', description: 'Horário funcionamento' },
    { key: 'delivery_fee', value: '15', description: 'Taxa de entrega padrão' },
    { key: 'free_delivery_min', value: '200', description: 'Valor mínimo frete grátis' },
  ]
  for (const s of settings) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('✅ Configurações do site criadas')

  console.log('\n🌿 Seed concluído com sucesso!')
  console.log(`📧 Admin: admin@terramais.com.br`)
  console.log(`🔑 Senha: admin123@TM`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

// Criar admin Patricia
const hashedPattyPassword = await bcrypt.hash('10082001', 12)
const patricia = await prisma.user.upsert({
  where: { email: 'patty100801@gmail.com' },
  update: {},
  create: {
    name: 'Patricia',
    email: 'patty100801@gmail.com',
    password: hashedPattyPassword,
    role: Role.ADMIN,
  },
})
console.log('✅ Patricia criada:', patricia.email)