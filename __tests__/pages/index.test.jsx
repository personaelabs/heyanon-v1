import { render, screen } from '@testing-library/react'
import Home from '../../pages/index'
import '@testing-library/jest-dom'
/**
 * @dev dummy title test
 */
describe('Testing pages:index', () => {
  it('renders a correct text', () => {
    render(<Home />)
    const title = screen.getByText('What is this site?')
    expect(title).toBeInTheDocument()
  })
})
