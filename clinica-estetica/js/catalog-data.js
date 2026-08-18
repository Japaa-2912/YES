/* ============================================================
   catalog-data.js — Fonte única de dados (template white-label)
   ------------------------------------------------------------
   Procedimentos (por categoria) e artigos do blog.
   Edite aqui para personalizar os conteúdos da clínica.
   ============================================================ */
(function (global) {
  'use strict';

  var CATALOG_DATA = {
    pele: {
      label: 'Pele',
      items: [
        { id: 'servico-toxina', name: 'Toxina Botulínica', desc: 'Suavização de linhas de expressão com resultados naturais e progressivos.' },
        { id: 'servico-bioestimuladores', name: 'Bioestimuladores de Colágeno', desc: 'Estímulo da produção de colágeno para firmeza e sustentação da pele.' },
        { id: 'servico-preenchimento', name: 'Preenchimento de Ácido Hialurônico', desc: 'Volume, contorno e hidratação profunda com efeito imediato.' },
        { id: 'servico-skinbooster', name: 'Skinbooster', desc: 'Hidratação intensiva e melhora da textura e luminosidade da pele.' },
        { id: 'servico-fios', name: 'Fios de PDO e Silhouette', desc: 'Lifting não cirúrgico com reposicionamento gradual dos tecidos.' },
        { id: 'servico-peelings', name: 'Peelings', desc: 'Renovação celular para manchas, textura e uniformidade do tom.' },
        { id: 'servico-ultrassom', name: 'Ultrassom Microfocado', desc: 'Tecnologia que estimula colágeno nas camadas profundas da pele.' },
        { id: 'servico-laser', name: 'Luz Intensa Pulsada e Laser', desc: 'Tratamento de manchas, vasinhos e estímulo de colágeno.' },
        { id: 'servico-limpeza', name: 'Limpeza de Pele', desc: 'Protocolo completo de higienização, extração e equilíbrio da pele.' }
      ]
    },

    cabelo: {
      label: 'Cabelo',
      items: [
        { id: 'servico-terapia-capilar', name: 'Terapia Capilar', desc: 'Protocolos completos para saúde, fortalecimento e crescimento dos fios.' },
        { id: 'servico-mmp', name: 'MMP Capilar', desc: 'Microinfusão de medicamentos para estímulo do folículo capilar.' },
        { id: 'servico-mesoterapia', name: 'Intradermoterapia Capilar', desc: 'Aplicação de ativos diretamente no couro cabeludo.' },
        { id: 'servico-lllt', name: 'Laser LLLT', desc: 'Laser de baixa potência que estimula o bulbo capilar.' }
      ]
    },

    cirurgias: {
      label: 'Cirurgias',
      items: [
        { id: 'servico-blefaroplastia', name: 'Blefaroplastia', desc: 'Correção do excesso de pele e gordura nas pálpebras.' },
        { id: 'servico-otoplastia', name: 'Otoplastia', desc: 'Reposicionamento das orelhas com contorno natural.' },
        { id: 'servico-rinoplastia', name: 'Rinoplastia', desc: 'Harmonização do nariz com foco em equilíbrio facial.' },
        { id: 'servico-exerese', name: 'Exérese de Lesões', desc: 'Remoção de lesões de pele com análise e cuidado oncológico.' },
        { id: 'servico-enxerto', name: 'Enxerto Capilar', desc: 'Transplante de fios para áreas com rarefação definitiva.' }
      ]
    }
  };

  /* Artigos do blog — o "Ler mais" abre o conteúdo completo no modal */
  var BLOG_DATA = [
    {
      id: 'post-1',
      cat: 'Pele',
      date: '12 maio 2026',
      minutes: 5,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      excerpt: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
      body: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
      ]
    },
    {
      id: 'post-2',
      cat: 'Cabelo',
      date: '28 abril 2026',
      minutes: 4,
      title: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco',
      excerpt: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
      body: [
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
        'Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.'
      ]
    },
    {
      id: 'post-3',
      cat: 'Clínica',
      date: '10 abril 2026',
      minutes: 6,
      title: 'Duis aute irure dolor in reprehenderit in voluptate velit',
      excerpt: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum.',
      body: [
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.'
      ]
    },
    {
      id: 'post-4',
      cat: 'Pele',
      date: '22 março 2026',
      minutes: 3,
      title: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa',
      excerpt: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.',
      body: [
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
        'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.'
      ]
    },
    {
      id: 'post-5',
      cat: 'Cabelo',
      date: '8 março 2026',
      minutes: 5,
      title: 'Sed quia consequuntur magni dolores eos qui ratione voluptatem',
      excerpt: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio.',
      body: [
        'Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
        'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
        'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.'
      ]
    },
    {
      id: 'post-6',
      cat: 'Clínica',
      date: '20 fevereiro 2026',
      minutes: 4,
      title: 'Temporibus autem quibusdam et aut officiis debitis aut rerum',
      excerpt: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut.',
      body: [
        'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
        'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
        'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.'
      ]
    },
    {
      id: 'post-7',
      cat: 'Pele',
      date: '5 fevereiro 2026',
      minutes: 7,
      title: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet',
      excerpt: 'Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam.',
      body: [
        'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
        'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
        'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.'
      ]
    },
    {
      id: 'post-8',
      cat: 'Cabelo',
      date: '18 janeiro 2026',
      minutes: 4,
      title: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit',
      excerpt: 'Esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
      body: [
        'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
      ]
    },
    {
      id: 'post-9',
      cat: 'Clínica',
      date: '9 janeiro 2026',
      minutes: 5,
      title: 'At vero eos et accusamus et iusto odio dignissimos ducimus',
      excerpt: 'Qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.',
      body: [
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
        'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
        'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.'
      ]
    }
  ];

  global.CATALOG_DATA = CATALOG_DATA;
  global.BLOG_DATA = BLOG_DATA;
})(window);
