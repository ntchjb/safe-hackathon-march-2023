export interface FundingSafeResultDialogProps {
  address: string
}

export default function FundingSafeResultDialog({ address }: FundingSafeResultDialogProps) {
  return (
    <div>
      <p>Deployed address</p>
      <input type="text" disabled value={address} />
    </div>
  )
};