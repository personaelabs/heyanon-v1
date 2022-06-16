import { useState, useEffect, SetStateAction, Dispatch } from 'react'
import { Button } from './Base'
import { ProofVerifiedInfo, ZKProofInfo } from '../pages/verify/[authToken]'
import { ProofSubmissionResult } from '../pages/api/verify/[authTokenString]'
import InfoRow from './InfoRow'

type Props = {
  zkProof: string | null
  authToken: string
  updateParent: Dispatch<SetStateAction<ProofVerifiedInfo | null>>
}

const getButtonText = (loading: boolean, submitted: boolean) => {
  if (loading) return 'Submitting...'
  if (submitted) return 'Submitted'
  return 'Submit Proof'
}

export default function SubmitButton({
  zkProof,
  authToken,
  updateParent,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [proofValid, setProofValid] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const buttonText = getButtonText(loading, submitted)

  useEffect(() => {
    updateParent({ proofValid, error, submitted, loading })
  }, [proofValid, error, submitted, loading])

  const submitProof = () => {
    if (!zkProof) {
      alert('There is no proof! Something weird is going on.')
      return
    }
    setLoading(true)
    setSubmitted(true)
    const submitProofAsync = async () => {
      fetch(`/api/verify/${authToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zkProof),
      })
        .then((res) => res.json())
        .then((proofSubmissionResult: ProofSubmissionResult) => {
          setProofValid(proofSubmissionResult.proofStatus)
          setError(proofSubmissionResult.error)
        })
        .catch(() => {
          setLoading(false)
          setError('There was an internal server error. Try again later.')
        })
        .finally(() => setLoading(false))
    }
    submitProofAsync()
  }

  // TODO disable the button if loading, hover: "proof is verifying on server, be patient"
  return (
    <div className="flex">
      <Button onClick={submitProof}>{buttonText}</Button>
      <div className="mx-10">
        {proofValid !== null && (
          <InfoRow
            name="Proof Verified"
            content={proofValid.toString()}
            color={proofValid ? 'text-green-500' : 'text-red-500'}
          />
        )}
        {error && <InfoRow name="Error" content={error} color="text-red-500" />}
      </div>
    </div>
  )
}
