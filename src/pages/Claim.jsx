import ClaimContainer from "../components/claim/ClaimContainer"
import StatementContainer from "../components/claim/StatementContainer"


export default function Claim() {
  return (
    <>
      <div className="d-flex flex-column p-3">
        <StatementContainer />
        <ClaimContainer />
      </div>
    </>
  )
}
