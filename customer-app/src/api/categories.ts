import { api } from './client'
import type { Category } from './types'

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get<{ categories: Category[] }>('/categories')
  return res.data.categories
}
