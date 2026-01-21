import BarbershopItem from "../../_components/barbershop/barbershop-item"
import Header from "../../_components/layout/header"
import Search from "../../_components/common/search"
import {
  getBarbershops,
  GetBarbershopsProps,
} from "../../_features/barbershops/_data/get-barbershops"

const BarbershopsPage = async ({ searchParams }: GetBarbershopsProps) => {
  const barbershops = await getBarbershops({ searchParams })

  return (
    <div>
      <Header />
      <div className="my-6 px-5">
        <Search />
      </div>
      <div className="px-5">
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Resultados para &quot;{searchParams?.title || searchParams?.service}
          &quot;
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

export default BarbershopsPage
