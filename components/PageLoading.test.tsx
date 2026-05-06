import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSpinner, PageLoading } from './PageLoading'

describe('LoadingSpinner', () => {
  it('exposes a status role for assistive tech', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('applies size classes for sm variant', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const el = container.querySelector('[role="status"]')
    expect(el).toHaveClass('w-8', 'h-8')
  })
})

describe('PageLoading', () => {
  it('renders default loading label in fullscreen layout', () => {
    render(<PageLoading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('shows custom message when provided', () => {
    render(<PageLoading message="Please wait" />)
    expect(screen.getByText('Please wait')).toBeInTheDocument()
  })

  it('hides the label when message is null', () => {
    render(<PageLoading message={null} />)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('uses section variant without fullscreen background wrapper', () => {
    const { container } = render(<PageLoading variant="section" message={null} />)
    const root = container.firstElementChild
    expect(root).toHaveClass('flex-1', 'min-h-0')
    expect(root).not.toHaveClass('min-h-screen')
  })
})
