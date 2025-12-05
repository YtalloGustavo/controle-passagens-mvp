export default defineNuxtRouteMiddleware((to, from) => {
    const { usuario } = useAuth()

    if (!usuario.value) {
        return navigateTo('/')
    }
})
