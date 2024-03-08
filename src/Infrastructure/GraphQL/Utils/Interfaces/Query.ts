import { Filter, SortField } from "."

export interface Query<DTO> {
    first?: number
    after?: string
    last?: number
    before?: string
    where?: Filter<DTO>
    order?: SortField<DTO>
}
