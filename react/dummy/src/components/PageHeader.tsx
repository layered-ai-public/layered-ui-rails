interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1>{title}</h1>
      {description && <p className="l-ui-utility--mt-md">{description}</p>}
    </>
  )
}
