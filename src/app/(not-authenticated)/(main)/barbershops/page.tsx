import BarbershopItem from "@/src/components/barbershop/barbershop-item"
import Header from "@/src/components/layout/header"
import Search from "@/src/components/common/search"
import {
  getBarbershops,
  GetBarbershopsProps,
} from "@/src/features/barbershops/_data/get-barbershops"

const SearchBarbershops = async ({ searchParams }: GetBarbershopsProps) => {
  const params = await searchParams
  const barbershops = await getBarbershops({ searchParams })

  return (
    <div>
      <Header />
      <div className="my-6 px-5">
        <Search />
      </div>
      <div className="px-5">
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Resultados para {params?.title || params?.service}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchBarbershops
