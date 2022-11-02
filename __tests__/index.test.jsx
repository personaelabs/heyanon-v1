import { render, screen } from '@testing-library/react'
import Home from '../pages/index'
import '@testing-library/jest-dom'
/**
 * @dev dummy title test
 */
describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)
    const title = screen.getByText('What is this site?')
    expect(title).toBeInTheDocument()
  })
})
