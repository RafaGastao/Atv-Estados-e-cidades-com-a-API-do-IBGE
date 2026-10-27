// Atividade 2 - Estados e cidades com a API do IBGE
const selectEstado = document.getElementById('estado')
const selectCidade = document.getElementById('cidade')
const qtdCidades = document.getElementById('qtdCidades')
const filtroCidade = document.getElementById('filtroCidade')
const resumo = document.getElementById('resumo')

const URL_ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
let todasCidades = []
let requisicaoAtual = 0

function preencherCidades(cidades) {
    const cidadeSelecionada = selectCidade.value
    selectCidade.innerHTML = '<option value="">Selecione a cidade</option>'
    cidades.forEach(cidade => {
        const opcao = document.createElement('option')
        opcao.value = cidade.nome
        opcao.textContent = cidade.nome
        selectCidade.appendChild(opcao)
    })
    if (cidades.some(cidade => cidade.nome === cidadeSelecionada)) {
        selectCidade.value = cidadeSelecionada
    }
}

// 1) Buscar estados ao abrir a página
function carregarEstados() {
    fetch(URL_ESTADOS)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao buscar estados')
            return resposta.json()
        })
        .then(estados => {
            selectEstado.innerHTML = '<option value="">Selecione o estado</option>'
            estados.forEach(estado => {
                const opcao = document.createElement('option')
                opcao.value = estado.sigla
                opcao.textContent = estado.nome
                selectEstado.appendChild(opcao)
            })
        })
        .catch(() => {
            selectEstado.innerHTML = '<option value="">Erro ao carregar estados</option>'
        })
}

// 2) Buscar cidades quando o estado mudar
selectEstado.addEventListener('change', () => {
    const uf = selectEstado.value
    const numeroRequisicao = ++requisicaoAtual
    todasCidades = []
    filtroCidade.value = ''
    filtroCidade.disabled = true
    selectCidade.disabled = true
    resumo.textContent = ''
    qtdCidades.textContent = ''

    if (uf === '') {
        selectCidade.innerHTML = '<option value="">Escolha um estado primeiro</option>'
        return
    }

    selectCidade.innerHTML = '<option value="">Carregando...</option>'

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao buscar cidades')
            return resposta.json()
        })
        .then(cidades => {
            if (numeroRequisicao !== requisicaoAtual) return
            todasCidades = cidades
            preencherCidades(cidades)
            selectCidade.disabled = false
            filtroCidade.disabled = false
            qtdCidades.textContent = `Este estado possui ${cidades.length} cidades.`
        })
        .catch(() => {
            if (numeroRequisicao !== requisicaoAtual) return
            selectCidade.innerHTML = '<option value="">Erro ao carregar cidades</option>'
            qtdCidades.textContent = 'Não foi possível carregar as cidades.'
        })
})

// Desafio extra: filtrar as cidades pelo nome
filtroCidade.addEventListener('input', () => {
    const texto = filtroCidade.value.toLocaleLowerCase('pt-BR')
    const filtradas = todasCidades.filter(cidade =>
        cidade.nome.toLocaleLowerCase('pt-BR').includes(texto)
    )
    preencherCidades(filtradas)
})

// 3) Mostrar resumo ao enviar o formulário
 document.getElementById('formInscricao').addEventListener('submit', evento => {
    evento.preventDefault()
    const nome = document.getElementById('nome').value.trim()
    const cidade = selectCidade.value
    const uf = selectEstado.value
    if (!nome || !cidade || !uf) return
    resumo.textContent = `${nome}, de ${cidade}/${uf}, inscrito com sucesso!`
})

carregarEstados()
