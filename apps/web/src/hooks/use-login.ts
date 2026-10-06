import { authApi } from "@/features/auth/api/auth.api"
import {useMutation} from "@tanstack/react-query"


export const useLogin = () => {
    return useMutation({
        mutationFn: authApi.login
    })
}