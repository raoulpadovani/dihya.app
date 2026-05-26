import { formatCurrency } from "../utils/formatters.js";

export default function DishCard({ item, subtitle, footer }) {
  const value = item.price ?? item.pricePerPerson ?? 0;
  const suffix = item.pricePerPerson != null && item.price == null ? " / guest" : "";

  return (
    <article className="dish-card">
      <div className="dish-card__image-wrap">
        <img src={item.imageUrl} alt={item.name} className="dish-card__image" loading="lazy" />
      </div>

      <div className="dish-card__body">
        {subtitle ? <p className="dish-card__subtitle">{subtitle}</p> : null}
        <div className="dish-card__row">
          <h3>{item.name}</h3>
          <strong>
            {formatCurrency(value)}
            {suffix}
          </strong>
        </div>
        <p>{item.description}</p>
        {footer ? <div className="dish-card__footer">{footer}</div> : null}
      </div>
    </article>
  );
}
