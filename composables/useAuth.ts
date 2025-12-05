export interface Usuario {
    id: number
    nome: string
    email: string
    perfil: string
    setor: string
}

export const useAuth = () => {
    // Cookie para persistência (expira em 7 dias)
    const cookie = useCookie<Usuario | null>('usuario_session', {
        maxAge: 60 * 60 * 24 * 7,
        watch: true
    })

    // Estado global sincronizado com o cookie
    const usuario = useState<Usuario | null>('usuarioLogado', () => cookie.value)

    // Sincronizar estado quando cookie muda (ex: outra aba)
    watch(cookie, (novo) => {
        usuario.value = novo
    })

    const logar = (dadosUsuario: any) => {
        cookie.value = dadosUsuario
        usuario.value = dadosUsuario
    }

    const sair = () => {
        cookie.value = null
        usuario.value = null
        navigateTo('/')
    }

    return { usuario, logar, sair }
}