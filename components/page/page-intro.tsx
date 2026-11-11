interface PageIntroProps {
  readonly description?: string;
  readonly title: string;
}

export function PageIntro({ description, title }: PageIntroProps) {
  return (
    <header className="page-intro">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
