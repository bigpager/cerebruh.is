import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /welcome to cerebruh/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Home />)
    const description = screen.getByText(/cognitive infrastructure/i)
    expect(description).toBeInTheDocument()
  })
})