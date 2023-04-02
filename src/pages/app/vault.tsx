import { useUserContext } from "@/context/user"
import FundingSafeForm from '@/components/funding-safe.form'

export default function FundingSafePage() {
  const {user} = useUserContext()

  return (
    <div>
      <FundingSafeForm />
    </div>
  )
}