const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api'

type RequestOptions = RequestInit & {
  parse?: boolean
}

const defaultHeaders = {
  'Content-Type': 'application/json',
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { parse = true, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  })

  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(errorMessage || 'Unable to fulfil request')
  }

  if (!parse) {
    return undefined as unknown as TResponse
  }

  return (await response.json()) as TResponse
}

export const apiClient = {
  get: <TResponse>(endpoint: string) => request<TResponse>(endpoint),
  post: <TResponse>(endpoint: string, body: unknown) =>
    request<TResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patch: <TResponse>(endpoint: string, body: unknown) =>
    request<TResponse>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (endpoint: string) =>
    request(endpoint, {
      method: 'DELETE',
      parse: false,
    }),
}

export type { RequestOptions }
export { API_BASE_URL }
