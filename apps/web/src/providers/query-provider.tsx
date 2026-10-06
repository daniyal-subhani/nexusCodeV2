"use client"

import { queryClient } from "@/lib/query/query-client"
import { QueryClientProvider } from "@tanstack/react-query"



interface QueryProviderProps {
    children: React.ReactNode
}

export const QueryProvider = ({children}: QueryProviderProps) => {
return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
)
}
