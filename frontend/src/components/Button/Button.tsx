import type { ReactNode } from 'react'
import './Button.css'

type ButtonProps = {
  children: ReactNode
  href?: string
  showArrow?: boolean
  onClick?: () => void
}

export function Button({ children, href, showArrow = true, onClick }: ButtonProps) {
  const className = 'button button--solid button--diagonal'
  const arrow = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
  const content = (
    <>
      <span className="button__content">
        <span>{children}</span>
        {showArrow && arrow}
      </span>
      <span className="button__diagonal" aria-hidden="true" />
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
