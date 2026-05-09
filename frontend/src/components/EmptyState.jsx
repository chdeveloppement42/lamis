import './EmptyState.css';

export default function EmptyState({
  icon = '📂',
  title = 'Aucun résultat',
  description = 'Nous n\'avons trouvé aucun élément correspondant à vos critères.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
