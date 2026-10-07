import type { ReactNode } from 'react'
import './Button.css'

type ButtonProps = {
  children: ReactNode
  href?: string
  showArrow?: boolean
  onClick?: () => void
}

export function Button({ children, href, showArrow = true, onClick }: ButtonProps) {
  const className = 'button button--solid'
  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </>
  )

  if (href) {
    return <a className={className} href={href} onClick={onClick}>{content}</a>
  }

  return (
    <button className={className} type="button" disabled title="Contato em breve">
      {content}
    </button>
  )
}
