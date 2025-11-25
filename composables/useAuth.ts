export interface Usuario {
    id: number
    nome: string
    email: string
    perfil: string
    setor: string
}

export const useAuth = () => {
    // Estado global para guardar o usuário logado
    const usuario = useState<Usuario | null>('usuarioLogado', () => null)

    const logar = (dadosUsuario: any) => {
        usuario.value = dadosUsuario
    }

    const sair = () => {
        usuario.value = null
        navigateTo('/')
    }

    return { usuario, logar, sair }
}