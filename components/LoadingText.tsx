import { useState, useEffect } from 'react'

const textArray = [
  'Running magic moon math in the browser 🌚🌚🌚',
  "Vitalik probably thinks you're cool for generating a ZK proof",
  'Welcome to the future of b l o c k c h a i n',
  "Pop quiz: what's the difference between the ate, tate pairing?",
  'Bonus question: are ate, kate, and tate related?',
  "If you think this is slow, why don't you try solving y^2=x^2+Ax^2+x yourself?",
  '👻👻👻👻👻👻',
  //   'Running automated venture capitalist detection...',
]

export default function LoadingText() {
  let className = 'font-bold '
  const [timer, setTimer] = useState(0)
  const [text, setText] = useState(textArray[0])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1) // <-- Change this line!
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, []) // Pass in empty array to run effect only once!

  useEffect(() => {
    const changeSeconds = 5
    if (timer % changeSeconds != 0) return
    setText(textArray[(timer / changeSeconds) % textArray.length])
  }, [timer])

  return (
    <div>
      <div>
        <span className="font-bold text-terminal-green">{`>>> `}</span>
        <span> Running for {timer} seconds </span>
      </div>
      <div>
        <span className="font-bold text-terminal-green">{`>>> `}</span>

        <span className={className}>{text} </span>
      </div>
    </div>
  )
}
